import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isValidSolanaAddress,
  transferUsdcFromTreasury,
  verifySolanaTransaction,
} from "@/lib/solana";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      method,
      asset,
      amount,
      destination,
      signature,
    }: {
      method: "bank" | "crypto";
      asset?: "SOL" | "USDC" | "USD";
      amount: number;
      destination?: string;
      signature?: string;
    } = body;

    if (!method || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "method and positive amount are required" },
        { status: 400 },
      );
    }

    if (method === "crypto") {
      if (!destination || !isValidSolanaAddress(destination)) {
        return NextResponse.json(
          { error: "Valid Solana destination address required" },
          { status: 400 },
        );
      }
    }

    let txSignature: string | null = signature || null;
    let onChainConfirmed = false;
    let simulated = false;

    if (method === "crypto" && asset === "USDC") {
      if (signature) {
        const verification = await verifySolanaTransaction(signature);
        onChainConfirmed = verification.confirmed;
        txSignature = signature;
      } else {
        const result = await transferUsdcFromTreasury(destination!, amount);
        txSignature = result.signature;
        simulated = result.simulated;
        onChainConfirmed = !result.simulated;
      }
    }

    const fee = method === "bank" ? amount * 0.01 : 0;
    const status: "completed" | "processing" =
      method === "crypto" && onChainConfirmed ? "completed" : "processing";

    const { data: withdrawal, error: insertError } = await supabase
      .from("withdrawals")
      .insert({
        user_id: user.id,
        method,
        asset: asset || (method === "bank" ? "USD" : "USDC"),
        amount,
        destination: destination || null,
        status,
        solana_tx_signature: txSignature,
        fee,
        metadata: { simulated },
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 },
      );
    }

    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      amount,
      status: status === "completed" ? "completed" : "pending",
      solana_tx_signature: txSignature,
      metadata: {
        description: `Withdrawal via ${method}`,
        method,
        asset: asset || "USD",
        destination: destination || null,
        fee,
        simulated,
      },
    });

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Withdrawal initiated",
      message: `$${Number(amount).toFixed(2)} withdrawal via ${method}${
        simulated ? " (simulated)" : ""
      }.`,
      type: "payment",
      metadata: { withdrawal_id: withdrawal.id },
    });

    return NextResponse.json({
      success: true,
      withdrawal,
      tx_signature: txSignature,
      simulated,
    });
  } catch (error: any) {
    console.error("Withdraw error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
