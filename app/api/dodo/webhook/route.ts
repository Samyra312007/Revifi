import { Webhooks } from "@dodopayments/nextjs";
import { createClient } from "@/lib/supabase/server";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,

  onPaymentSucceeded: async (payload) => {
    console.log("💰 Payment succeeded:", payload.data.payment_id);
    const supabase = await createClient();

    await supabase
      .from("invoices")
      .update({
        status: "paid_to_escrow",
        dodo_payment_intent: payload.data.payment_id,
        paid_at: new Date().toISOString(),
      })
      .eq("dodo_checkout_id", payload.data.checkout_id);
  },

  onPaymentFailed: async (payload) => {
    console.error("Payment failed:", payload.data.payment_id);
    const supabase = await createClient();

    await supabase
      .from("invoices")
      .update({ status: "expired" })
      .eq("dodo_checkout_id", payload.data.checkout_id);
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
