"use client";

import { useEffect, useState } from "react";
import {
  connectPhantom,
  disconnectPhantom,
  getConnectedPhantomAddress,
  getPhantomProvider,
} from "@/lib/phantom";
import { createClient } from "@/lib/supabase/client";

interface Props {
  initialAddress?: string | null;
  onChange?: (address: string | null) => void;
  saveToProfile?: boolean;
}

export default function PhantomConnect({
  initialAddress = null,
  onChange,
  saveToProfile = true,
}: Props) {
  const [address, setAddress] = useState<string | null>(initialAddress);
  const [busy, setBusy] = useState(false);
  const [installed, setInstalled] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    setInstalled(Boolean(getPhantomProvider()));
    if (!initialAddress) {
      getConnectedPhantomAddress().then((addr) => {
        if (addr) {
          setAddress(addr);
          onChange?.(addr);
        }
      });
    }
  }, []);

  async function persistAddress(addr: string | null) {
    if (!saveToProfile) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("users")
      .update({ solana_wallet: addr })
      .eq("id", user.id);
  }

  async function handleConnect() {
    setBusy(true);
    try {
      const addr = await connectPhantom();
      setAddress(addr);
      onChange?.(addr);
      await persistAddress(addr);
    } catch (err: any) {
      alert(err?.message || "Failed to connect Phantom");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    try {
      await disconnectPhantom();
      setAddress(null);
      onChange?.(null);
      await persistAddress(null);
    } catch (err: any) {
      alert(err?.message || "Failed to disconnect");
    } finally {
      setBusy(false);
    }
  }

  if (!installed) {
    return (
      <a
        href="https://phantom.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
      >
        <span className="material-symbols-outlined text-base">download</span>
        Install Phantom
      </a>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs font-mono text-purple-200 truncate max-w-[160px]">
            {address.slice(0, 4)}…{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={busy}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {busy ? "Working..." : "Disconnect"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={busy}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-base">link</span>
      {busy ? "Connecting..." : "Connect Phantom"}
    </button>
  );
}
