import { NextResponse } from "next/server";
import { Webhooks } from "@dodopayments/nextjs";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

let cachedHandler: any = null;

function getHandler() {
  if (cachedHandler) return cachedHandler;

  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret || secret === "your_webhook_secret_here") {
    return null;
  }

  cachedHandler = Webhooks({
    webhookKey: secret,

    onPaymentSucceeded: async (payload) => {
      console.log("Payment succeeded:", payload.data.payment_id);
      const supabase = await createClient();
      const data = payload.data as any;

      await supabase
        .from("invoices")
        .update({
          status: "paid_to_escrow",
          dodo_payment_intent: data.payment_id,
          paid_at: new Date().toISOString(),
        })
        .eq("dodo_checkout_id", data.checkout_id);
    },

    onPaymentFailed: async (payload) => {
      console.error("Payment failed:", payload.data.payment_id);
      const supabase = await createClient();
      const data = payload.data as any;

      await supabase
        .from("invoices")
        .update({ status: "expired" })
        .eq("dodo_checkout_id", data.checkout_id);
    },

    onSubscriptionActive: async (payload) => {
      console.log("Subscription active:", payload.data.subscription_id);
      const supabase = await createClient();

      await supabase
        .from("users")
        .update({
          metadata: {
            subscription_id: payload.data.subscription_id,
            subscription_status: "active",
          },
        })
        .eq("email", payload.data.customer.email);
    },

    onPayload: async (payload) => {
      console.log("Webhook received:", payload.type);
    },
  });

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
