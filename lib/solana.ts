import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

export const connection = new Connection(RPC_URL, {
  commitment: "confirmed",
});

export const USDC_MINT = new PublicKey(process.env.USDC_MINT!);

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
