import { NextResponse } from "next/server";
import { Webhooks } from "@dodopayments/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type WebhookHandler = (req: Request) => Promise<Response>;
let cachedHandler: WebhookHandler | null = null;

function getHandler(): WebhookHandler | null {
  if (cachedHandler) return cachedHandler;

  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret || secret === "your_webhook_secret_here") return null;

  cachedHandler = Webhooks({
    webhookKey: secret,

    onPaymentSucceeded: async (payload) => {
      const supabase = createAdminClient();
      const data = payload.data as Record<string, unknown> & {
        payment_id?: string;
        checkout_id?: string;
        metadata?: Record<string, unknown> & { invoice_id?: string };
      };

      const invoiceId = data?.metadata?.invoice_id;
      const updates = {
        status: "paid_to_escrow",
        dodo_payment_intent: data.payment_id,
        paid_at: new Date().toISOString(),
      };

      if (invoiceId) {
        await supabase.from("invoices").update(updates).eq("id", invoiceId);
      } else if (data.checkout_id) {
        await supabase
          .from("invoices")
          .update(updates)
          .eq("dodo_checkout_id", data.checkout_id);
      }
    },

    onPaymentFailed: async (payload) => {
      const supabase = createAdminClient();
      const data = payload.data as Record<string, unknown> & {
        checkout_id?: string;
        metadata?: { invoice_id?: string };
      };
      const invoiceId = data?.metadata?.invoice_id;
      if (invoiceId) {
        await supabase
          .from("invoices")
          .update({ status: "expired" })
          .eq("id", invoiceId);
      } else if (data.checkout_id) {
        await supabase
          .from("invoices")
          .update({ status: "expired" })
          .eq("dodo_checkout_id", data.checkout_id);
      }
    },

    onSubscriptionActive: async (payload) => {
      const supabase = createAdminClient();
      const data = payload.data as Record<string, unknown> & {
        subscription_id?: string;
        customer?: { email?: string };
        metadata?: { user_id?: string };
      };

      const userId = data?.metadata?.user_id;
      let existing: Record<string, unknown> = {};
      if (userId) {
        const { data: row } = await supabase
          .from("users")
          .select("metadata")
          .eq("id", userId)
          .single();
        existing = (row?.metadata as Record<string, unknown>) || {};
        await supabase
          .from("users")
          .update({
            metadata: {
              ...existing,
              subscription_id: data.subscription_id,
              subscription_status: "active",
            },
          })
          .eq("id", userId);
      } else if (data.customer?.email) {
        const { data: row } = await supabase
          .from("users")
          .select("metadata")
          .eq("email", data.customer.email)
          .single();
        existing = (row?.metadata as Record<string, unknown>) || {};
        await supabase
          .from("users")
          .update({
            metadata: {
              ...existing,
              subscription_id: data.subscription_id,
              subscription_status: "active",
            },
          })
          .eq("email", data.customer.email);
      }
    },
  }) as unknown as WebhookHandler;

  return cachedHandler;
}

export async function POST(req: Request) {
  const handler = getHandler();
  if (!handler) {
    return NextResponse.json(
      {
        error:
          "Webhook secret not configured. Set DODO_PAYMENTS_WEBHOOK_SECRET in .env.local.",
      },
      { status: 503 },
    );
  }
  return handler(req);
}
