import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

const RPC_URL =
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";

const USDC_MINT_ADDRESS =
  process.env.USDC_MINT ||
  process.env.NEXT_PUBLIC_USDC_MINT ||
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const connection = new Connection(RPC_URL, { commitment: "confirmed" });
export const USDC_MINT = new PublicKey(USDC_MINT_ADDRESS);

function loadTreasuryKeypair(): Keypair | null {
  const raw = process.env.TREASURY_PRIVATE_KEY;
  if (!raw) return null;
  try {
    if (raw.trim().startsWith("[")) {
      const arr = JSON.parse(raw) as number[];
      return Keypair.fromSecretKey(Uint8Array.from(arr));
    }
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 64) return Keypair.fromSecretKey(buf);
    const hexBuf = Buffer.from(raw, "hex");
    if (hexBuf.length === 64) return Keypair.fromSecretKey(hexBuf);
  } catch (err) {
    console.error("Failed to parse TREASURY_PRIVATE_KEY:", err);
  }
  return null;
}

export interface TransferResult {
  signature: string;
  simulated: boolean;
}

export async function transferUsdcFromTreasury(
  recipientAddress: string,
  amountUsdc: number,
): Promise<TransferResult> {
  const treasury = loadTreasuryKeypair();
  if (!treasury) {
    return { signature: "SIMULATED_TX_" + Date.now(), simulated: true };
  }

  const recipient = new PublicKey(recipientAddress);
  const fromAta = await getAssociatedTokenAddress(USDC_MINT, treasury.publicKey);
  const toAta = await getAssociatedTokenAddress(USDC_MINT, recipient);
  const amountBaseUnits = BigInt(Math.round(amountUsdc * 1_000_000));

  const tx = new Transaction();
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(
      treasury.publicKey,
      toAta,
      recipient,
      USDC_MINT,
    ),
  );
  tx.add(
    createTransferInstruction(fromAta, toAta, treasury.publicKey, amountBaseUnits),
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = treasury.publicKey;
  tx.sign(treasury);

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
  });
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  return { signature, simulated: false };
}

export async function transferSolFromTreasury(
  recipientAddress: string,
  amountSol: number,
): Promise<TransferResult> {
  const treasury = loadTreasuryKeypair();
  if (!treasury) {
    return { signature: "SIMULATED_TX_" + Date.now(), simulated: true };
  }

  const recipient = new PublicKey(recipientAddress);
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: treasury.publicKey,
      toPubkey: recipient,
      lamports,
    }),
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = treasury.publicKey;
  tx.sign(treasury);

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
  });
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  return { signature, simulated: false };
}

export async function verifySolanaTransaction(
  signature: string,
): Promise<{ confirmed: boolean; slot?: number }> {
  if (!signature || signature.startsWith("SIMULATED_")) {
    return { confirmed: false };
  }
  try {
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });
    const value = status.value;
    if (!value) return { confirmed: false };
    return {
      confirmed:
        value.confirmationStatus === "confirmed" ||
        value.confirmationStatus === "finalized",
      slot: value.slot,
    };
  } catch (err) {
    console.error("verifySolanaTransaction error:", err);
    return { confirmed: false };
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    const key = new PublicKey(address);
    return PublicKey.isOnCurve(key.toBytes());
  } catch {
    return false;
  }
}
