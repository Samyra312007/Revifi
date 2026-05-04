import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const productId = process.env.DODO_PRODUCT_ID;
    if (!productId) {
      return NextResponse.json(
        {
          error:
            "DODO_PRODUCT_ID is not configured. Set it in .env.local before creating deals.",
        },
        { status: 503 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deal_name, creator_id, brand_id, amount, due_date } =
      await req.json();

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        deal_name,
        creator_id,
        brand_id,
        amount,
        due_date,
        status: "pending",
      })
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json(
        { error: invoiceError.message },
        { status: 500 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const dodoResponse = await fetch(`${appUrl}/api/dodo/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
            price: amount,
            name: deal_name,
          },
        ],
        customer: { email: user.email },
        metadata: {
          invoice_id: invoice.id,
          creator_id,
          brand_id,
          user_id: user.id,
        },
        return_url: `${appUrl}/brand/payment/success?invoice=${invoice.id}`,
      }),
    });

    const dodoData = (await dodoResponse.json().catch(() => ({}))) as {
      checkout_url?: string;
      checkout_id?: string;
      session_id?: string;
      payment_id?: string;
      id?: string;
      error?: string;
    };

    if (!dodoResponse.ok || !dodoData.checkout_url) {
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return NextResponse.json(
        {
          error:
            dodoData.error ||
            "Dodo Payments did not return a checkout URL. Verify DODO_PAYMENTS_API_KEY and DODO_PRODUCT_ID.",
        },
        { status: 502 },
      );
    }

    const checkoutId =
      dodoData.checkout_id ||
      dodoData.session_id ||
      dodoData.payment_id ||
      dodoData.id ||
      dodoData.checkout_url.split("/").pop() ||
      null;

    await supabase
      .from("invoices")
      .update({
        dodo_checkout_id: checkoutId,
        metadata: { checkout_url: dodoData.checkout_url },
      })
      .eq("id", invoice.id);

    return NextResponse.json({
      success: true,
      invoice,
      checkout_url: dodoData.checkout_url,
    });
  } catch (error) {
    console.error("Deal creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
