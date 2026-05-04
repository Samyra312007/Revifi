export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  isConnected?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{
    publicKey: { toString(): string };
  }>;
  disconnect: () => Promise<void>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeAllListeners?: () => void;
  signAndSendTransaction?: (tx: any) => Promise<{ signature: string }>;
  signTransaction?: (tx: any) => Promise<any>;
}

export function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const provider = (window as any).phantom?.solana ?? (window as any).solana;
  if (provider?.isPhantom) return provider as PhantomProvider;
  return null;
}

export async function connectPhantom(): Promise<string> {
  const provider = getPhantomProvider();
  if (!provider) {
    window.open("https://phantom.app/", "_blank", "noopener,noreferrer");
    throw new Error(
      "Phantom wallet not detected. Install it at phantom.app and refresh.",
    );
  }
  const resp = await provider.connect();
  return resp.publicKey.toString();
}

export async function disconnectPhantom(): Promise<void> {
  const provider = getPhantomProvider();
  if (!provider) return;
  await provider.disconnect();
}

export async function getConnectedPhantomAddress(): Promise<string | null> {
  const provider = getPhantomProvider();
  if (!provider) return null;
  try {
    const resp = await provider.connect({ onlyIfTrusted: true });
    return resp.publicKey.toString();
  } catch {
    return null;
  }
}

export async function sendSolWithPhantom(
  toAddress: string,
  amountSol: number,
  rpcUrl: string,
): Promise<string> {
  const provider = getPhantomProvider();
  if (!provider || !provider.signAndSendTransaction) {
    throw new Error("Phantom is required to send funds. Connect your wallet first.");
  }
  if (!provider.publicKey) {
    await provider.connect();
  }

  const { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } =
    await import("@solana/web3.js");

  const connection = new Connection(rpcUrl, "confirmed");
  const fromPubkey = new PublicKey(provider.publicKey!.toString());
  const toPubkey = new PublicKey(toAddress);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    }),
  );

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = fromPubkey;

  const { signature } = await provider.signAndSendTransaction(tx);
  await connection.confirmTransaction(signature, "confirmed");
  return signature;
}

export async function sendUsdcWithPhantom(
  toAddress: string,
  amountUsdc: number,
  rpcUrl: string,
  usdcMint: string,
): Promise<string> {
  const provider = getPhantomProvider();
  if (!provider || !provider.signAndSendTransaction) {
    throw new Error("Phantom is required to send funds. Connect your wallet first.");
  }
  if (!provider.publicKey) {
    await provider.connect();
  }

  const { Connection, PublicKey, Transaction } = await import("@solana/web3.js");
  const {
    createAssociatedTokenAccountIdempotentInstruction,
    createTransferInstruction,
    getAssociatedTokenAddress,
  } = await import("@solana/spl-token");

  const connection = new Connection(rpcUrl, "confirmed");
  const owner = new PublicKey(provider.publicKey!.toString());
  const recipient = new PublicKey(toAddress);
  const mint = new PublicKey(usdcMint);

  const fromAta = await getAssociatedTokenAddress(mint, owner);
  const toAta = await getAssociatedTokenAddress(mint, recipient);

  const tx = new Transaction();
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(owner, toAta, recipient, mint),
  );
  tx.add(
    createTransferInstruction(
      fromAta,
      toAta,
      owner,
      BigInt(Math.round(amountUsdc * 1_000_000)),
    ),
  );

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = owner;

  const { signature } = await provider.signAndSendTransaction(tx);
  await connection.confirmTransaction(signature, "confirmed");
  return signature;
}
