import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

export const connection = new Connection(RPC_URL, {
  commitment: "confirmed",
});

export const USDC_MINT = new PublicKey(
  process.env.USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
);

export async function getSolBalance(walletAddress: string): Promise<number> {
  const pubkey = new PublicKey(walletAddress);
  const balance = await connection.getBalance(pubkey);
  return balance / 1e9;
}

export async function getUSDCBalance(walletAddress: string): Promise<number> {
  const pubkey = new PublicKey(walletAddress);
  const tokenAccounts = await connection.getTokenAccountsByOwner(pubkey, {
    mint: USDC_MINT,
  });

  if (tokenAccounts.value.length === 0) return 0;

  const accountInfo = await connection.getTokenAccountBalance(
    tokenAccounts.value[0].pubkey,
  );
  return accountInfo.value.uiAmount || 0;
}

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
    return {
      signature: "SIMULATED_TX_" + Date.now(),
      simulated: true,
    };
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
    createTransferInstruction(
      fromAta,
      toAta,
      treasury.publicKey,
      amountBaseUnits,
    ),
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
