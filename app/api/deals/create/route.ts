import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
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

    const dodoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/dodo/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_cart: [
            {
              product_id: process.env.DODO_PRODUCT_ID,
              quantity: 1,
              price: amount,
              name: deal_name,
            },
          ],
          customer: { email: user.email },
          metadata: { invoice_id: invoice.id, creator_id, brand_id },
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/creator/dashboard`,
        }),
      },
    );

    const { checkout_url } = await dodoResponse.json();

    await supabase
      .from("invoices")
      .update({
        dodo_checkout_id: checkout_url.split("/").pop(),
        metadata: { checkout_url },
      })
      .eq("id", invoice.id);

    return NextResponse.json({
      success: true,
      invoice,
      checkout_url,
    });
  } catch (error) {
    console.error("Deal creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
