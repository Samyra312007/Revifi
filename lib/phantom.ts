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
