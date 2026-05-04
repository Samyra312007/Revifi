import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transferUsdcFromTreasury } from "@/lib/solana";

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

    const { invoice_id, advance_amount } = await req.json();

    if (!invoice_id || !advance_amount || advance_amount <= 0) {
      return NextResponse.json(
        { error: "invoice_id and positive advance_amount are required" },
        { status: 400 },
      );
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, creators(*)")
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice || invoice.status !== "paid_to_escrow") {
      return NextResponse.json(
        { error: "Invoice not found or not eligible for advance" },
        { status: 400 },
      );
    }

    if (Number(advance_amount) > Number(invoice.amount)) {
      return NextResponse.json(
        { error: "Advance amount cannot exceed invoice amount" },
        { status: 400 },
      );
    }

    const fee = Number(advance_amount) * 0.05;
    const finalAmount = Number(advance_amount) - fee;

    const creatorWallet = invoice.creators?.solana_wallet;
    if (!creatorWallet) {
      return NextResponse.json(
        {
          error:
            "Creator has no Solana wallet linked. Add one in Settings before requesting an advance.",
        },
        { status: 400 },
      );
    }

    let signature = "SIMULATED_TX_" + Date.now();
    let simulated = true;
    try {
      const result = await transferUsdcFromTreasury(creatorWallet, finalAmount);
      signature = result.signature;
      simulated = result.simulated;
    } catch (err) {
      console.error("Solana transfer failed:", err);
      return NextResponse.json(
        {
          error:
            "Solana transfer failed. Treasury may be underfunded or wallet invalid.",
        },
        { status: 500 },
      );
    }

    await supabase
      .from("invoices")
      .update({
        status: "factored",
        advance_requested: true,
        advance_amount: finalAmount,
        fee_amount: fee,
        solana_tx_signature: signature,
      })
      .eq("id", invoice_id);

    await supabase.from("transactions").insert({
      invoice_id,
      user_id: user.id,
      type: "advance",
      amount: finalAmount,
      status: "completed",
      solana_tx_signature: signature,
      metadata: {
        description: `Advance for ${invoice.deal_name}`,
        fee,
        simulated,
      },
    });

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Instant Advance approved",
      message: `$${finalAmount.toFixed(2)} sent to your Solana wallet${
        simulated ? " (simulated)" : ""
      }. Fee: $${fee.toFixed(2)}.`,
      type: "advance",
      metadata: { invoice_id, signature, simulated },
    });

    return NextResponse.json({
      success: true,
      advance_amount: finalAmount,
      fee,
      tx_signature: signature,
      simulated,
    });
  } catch (error) {
    console.error("Advance request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
