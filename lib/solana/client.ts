import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  process.env.SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";

const USDC_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_MINT ||
  process.env.USDC_MINT ||
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const connection = new Connection(RPC_URL, { commitment: "confirmed" });
export const USDC_MINT = new PublicKey(USDC_MINT_ADDRESS);

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

export function isValidSolanaAddress(address: string): boolean {
  try {
    const key = new PublicKey(address);
    return PublicKey.isOnCurve(key.toBytes());
  } catch {
    return false;
  }
}

export async function fetchSolPriceUsd(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { cache: "no-store" },
    );
    const data = (await res.json()) as { solana?: { usd?: number } };
    return Number(data?.solana?.usd) || 0;
  } catch {
    return 0;
  }
}
