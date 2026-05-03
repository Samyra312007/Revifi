import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const USDC_MINT = new PublicKey(process.env.USDC_MINT!);
const connection = new Connection(process.env.SOLANA_RPC_URL!);

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

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, creators(*)")
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice || invoice.status !== "paid_to_escrow") {
      return NextResponse.json({ error: "Invalid invoice" }, { status: 400 });
    }

    const fee = advance_amount * 0.05;
    const finalAmount = advance_amount - fee;

    const creatorWallet = new PublicKey(invoice.creators.solana_wallet);

    const mockSignature = "SIMULATED_TX_" + Date.now();

    await supabase
      .from("invoices")
      .update({
        status: "factored",
        advance_requested: true,
        advance_amount: finalAmount,
        fee_amount: fee,
        solana_tx_signature: mockSignature,
      })
      .eq("id", invoice_id);

    await supabase.from("transactions").insert({
      invoice_id,
      user_id: user.id,
      type: "advance",
      amount: finalAmount,
      status: "completed",
      solana_tx_signature: mockSignature,
    });

    return NextResponse.json({
      success: true,
      advance_amount: finalAmount,
      fee,
      tx_signature: mockSignature,
    });
  } catch (error) {
    console.error("Advance request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
