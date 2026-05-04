"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function HomeContent() {
  const [authed, setAuthed] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const search = useSearchParams();
  const error = search?.get("error");
  const wantsSignIn = search?.get("signin") === "1";
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled) setAuthed(Boolean(user));
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(Boolean(session?.user));
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignIn() {
    setSigningIn(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      });
    } finally {
      setSigningIn(false);
    }
  }

  useEffect(() => {
    if (wantsSignIn && !authed && !signingIn) {
      const t = setTimeout(() => {
        void handleSignIn();
      }, 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsSignIn, authed, signingIn]);

  function ctaButton(label: string, className: string) {
    if (authed) {
      return (
        <Link href="/creator/dashboard">
          <button className={className}>{label}</button>
        </Link>
      );
    }
    return (
      <button onClick={handleSignIn} disabled={signingIn} className={className}>
        {signingIn ? "Opening Google…" : label}
      </button>
    );
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md shadow-[0_8px_32px_0_rgba(153,69,255,0.05)]">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-2xl">
              account_balance_wallet
            </span>
            <span className="text-2xl font-black text-white uppercase tracking-tighter font-['Space_Grotesk']">
              Revifi
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#top"
              className="text-white font-semibold hover:text-primary-container transition-colors"
            >
              Home
            </a>
            <a
              href="#solutions"
              className="text-slate-400 hover:text-primary-container transition-colors"
            >
              Solutions
            </a>
            <a
              href="#security"
              className="text-slate-400 hover:text-primary-container transition-colors"
            >
              Security
            </a>
          </div>
          {ctaButton(
            authed ? "Open Dashboard" : "Get Started",
            "bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-semibold active:scale-95 transition-transform hover:opacity-90",
          )}
        </nav>
      </header>

      {error === "auth_failed" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-lg">
          Sign in failed. Make sure Google OAuth is enabled in Supabase.
        </div>
      )}

      <main id="top" className="pt-24 mesh-gradient">
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container">
              <span className="material-symbols-outlined text-sm">
                auto_awesome
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">
                The Future of Creative Finance
              </span>
            </div>
            <h1 className="font-display-xl text-display-xl text-white leading-[1.1]">
              Financial Stability for the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-secondary-container">
                Creator Economy
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Bridge the gap between work and wealth. Access instant liquidity
              from pending contracts with Revifi&apos;s institutional-grade
              decentralized infrastructure.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {ctaButton(
                "Apply for Advance",
                "px-8 py-4 bg-primary-container text-white rounded-xl font-headline-md text-body-md hover:bg-primary-container/90 transition-all shadow-[0_0_30px_rgba(153,69,255,0.3)]",
              )}
              <a href="#solutions">
                <button className="px-8 py-4 border border-outline/30 text-white rounded-xl font-headline-md text-body-md hover:bg-white/5 transition-all">
                  See How It Works
                </button>
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary-container/20 blur-[100px] rounded-full"></div>
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden border border-white/10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="font-label-sm text-label-sm text-slate-400 mb-1">
                    Available Liquidity (illustrative)
                  </p>
                  <h3 className="font-display-xl text-headline-lg text-white">
                    $124,500.00
                  </h3>
                </div>
                <div className="bg-secondary-container/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-secondary-container">
                    trending_up
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between font-data-mono text-data-mono">
                    <span className="text-slate-400">Advance Progress</span>
                    <span className="text-secondary-container">
                      85% Approved
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-container to-secondary-container w-[85%] shadow-[0_0_15px_rgba(0,236,145,0.4)]"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-label-sm text-slate-500 mb-1">Fee</p>
                    <p className="text-body-md text-white font-data-mono">
                      5% Fixed
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-label-sm text-slate-500 mb-1">Network</p>
                    <p className="text-body-md text-white font-data-mono">
                      Solana L1
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="solutions" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display-xl text-headline-lg text-white">
              Engineered for Velocity
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              A suite of financial tools built on next-generation protocols to
              eliminate the standard 30-90 day payment cycles.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card lg:col-span-2 rounded-3xl p-8 flex flex-col justify-between group glow-hover transition-all">
              <div className="max-w-md">
                <span className="material-symbols-outlined text-primary-container text-4xl mb-6">
                  terminal
                </span>
                <h3 className="font-headline-lg text-headline-lg text-white mb-4">
                  Smart Contracts
                </h3>
                <p className="text-on-surface-variant text-body-md">
                  Our deterministic escrow system automatically triggers payouts
                  the moment deliverables are verified on-chain. No manual
                  invoicing, no chasing clients.
                </p>
              </div>
              <div className="mt-12 flex gap-4">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-white">
                    verified_user
                  </span>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-white">
                    lock
                  </span>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-white">
                    speed
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between group glow-hover transition-all">
              <div>
                <span className="material-symbols-outlined text-secondary-container text-4xl mb-6">
                  account_balance_wallet
                </span>
                <h3 className="font-headline-lg text-headline-md text-white mb-4">
                  Multi-currency Wallet
                </h3>
                <p className="text-on-surface-variant text-body-md">
                  Manage USD and digital assets in one unified treasury
                  interface with instant conversion.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center text-sm text-slate-500 font-data-mono">
                  <span>USDC</span>
                  <span className="text-white">Stablecoin</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 font-data-mono mt-2">
                  <span>SOL</span>
                  <span className="text-white">Native</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between group glow-hover transition-all bg-gradient-to-br from-primary-container/10 to-transparent">
              <div>
                <span className="material-symbols-outlined text-primary-container text-4xl mb-6">
                  bolt
                </span>
                <h3 className="font-headline-lg text-headline-md text-white mb-4">
                  Instant Liquidity
                </h3>
                <p className="text-on-surface-variant text-body-md">
                  Get up to 80% of your contract value upfront. We take the
                  risk, you get the capital to scale.
                </p>
              </div>
              <a
                href="#security"
                className="mt-8 text-primary-container font-semibold flex items-center gap-2 group"
              >
                Learn about advances
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>
            </div>

            <div
              id="security"
              className="glass-card lg:col-span-2 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center border border-secondary-container/20"
            >
              <div className="flex-1">
                <h3 className="font-headline-lg text-headline-lg text-white mb-4">
                  Institutional-Grade Security
                </h3>
                <p className="text-on-surface-variant text-body-md mb-6">
                  Multi-signature authentication and cold-storage treasury
                  management ensures your earnings are always safe and
                  accessible only by you.
                </p>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-secondary-container/10 text-secondary-container text-xs font-bold uppercase tracking-widest">
                    SOC2 Type II
                  </span>
                  <span className="px-3 py-1 rounded-full bg-secondary-container/10 text-secondary-container text-xs font-bold uppercase tracking-widest">
                    ISO 27001
                  </span>
                </div>
              </div>
              <div className="w-full md:w-64">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-teal-500/20 p-8 text-center">
                  <span className="material-symbols-outlined text-6xl text-primary-container">
                    security
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-white/5 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">
                account_balance_wallet
              </span>
              <span className="text-lg font-bold text-white font-['Space_Grotesk']">
                Revifi
              </span>
            </div>
            <p className="font-['Space_Grotesk'] text-sm text-slate-400 text-center md:text-left">
              © 2024 Revifi. Built for the high-velocity creator economy.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href="#solutions"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              Smart Contracts
            </a>
            <a
              href="#solutions"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              Instant Payouts
            </a>
            <a
              href="#security"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              Security
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
