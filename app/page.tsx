"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/80 backdrop-blur-md border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-2xl">
              account_balance_wallet
            </span>
            <span className="text-2xl font-black text-white uppercase tracking-tighter font-space-grotesk">
              Revifi
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-white font-semibold hover:text-primary-container transition-colors"
            >
              Features
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
            <a
              href="#developers"
              className="text-slate-400 hover:text-primary-container transition-colors"
            >
              Developers
            </a>
          </div>
          <Link href="/creator/dashboard">
            <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-semibold active:scale-95 transition-transform hover:opacity-90">
              Get Started
            </button>
          </Link>
        </nav>
      </header>

      <main className="pt-24 mesh-gradient">
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container">
              <span className="material-symbols-outlined text-sm">
                auto_awesome
              </span>
              <span className="font-label-sm uppercase tracking-wider">
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
              from pending contracts with Revifi's institutional-grade
              decentralized infrastructure.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/creator/dashboard">
                <button className="px-8 py-4 bg-primary-container text-white rounded-xl font-headline-md text-body-md hover:bg-primary-container/90 transition-all shadow-[0_0_30px_rgba(153,69,255,0.3)]">
                  Apply for Advance
                </button>
              </Link>
              <button className="px-8 py-4 border border-outline/30 text-white rounded-xl font-headline-md text-body-md hover:bg-white/5 transition-all">
                View Demo
              </button>
            </div>
            <div className="flex items-center gap-6 pt-8 border-t border-white/5">
              <div className="flex flex-col">
                <span className="font-display-xl text-headline-lg text-white">
                  $42M+
                </span>
                <span className="font-label-sm text-label-sm text-slate-500 uppercase">
                  Paid Out
                </span>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="font-display-xl text-headline-lg text-white">
                  0.0s
                </span>
                <span className="font-label-sm text-label-sm text-slate-500 uppercase">
                  Settlement Time
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary-container/20 blur-[100px] rounded-full"></div>
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden border border-white/10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="font-label-sm text-label-sm text-slate-400 mb-1">
                    Available Liquidity
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
                      1.2% Fixed
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

        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display-xl text-headline-lg text-white">
              Engineered for Velocity
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              A suite of financial tools built on next-generation protocols to
              eliminate the standard 30-90 day payment cycles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card md:col-span-2 rounded-3xl p-8 flex flex-col justify-between group glow-hover transition-all">
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
                  Manage USD, EUR, and digital assets in one unified treasury
                  interface with instant conversion.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center text-sm text-slate-500 font-data-mono">
                  <span>USD</span>
                  <span className="text-white">$45,000</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 font-data-mono mt-2">
                  <span>SOL</span>
                  <span className="text-white">82.4</span>
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
              <button className="mt-8 text-primary-container font-semibold flex items-center gap-2 group">
                Learn about advances
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>

            <div
              id="security"
              className="glass-card md:col-span-2 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center border border-secondary-container/20"
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

        <section
          id="solutions"
          className="max-w-7xl mx-auto px-6 py-24 bg-surface-container-lowest rounded-[48px] my-24 border border-white/5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <h2 className="font-display-xl text-display-xl text-white">
                Seamless Workflow Integration
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined">sync</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-white mb-2">
                      Automated Reconciliations
                    </h4>
                    <p className="text-on-surface-variant">
                      Sync your transactions directly with QuickBooks, Xero, or
                      your custom ERP system via our robust API.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary-container">
                    <span className="material-symbols-outlined">public</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-white mb-2">
                      Global Tax Compliance
                    </h4>
                    <p className="text-on-surface-variant">
                      Automated W8/W9 collection and 1099 generation for your
                      international clients and partners.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-on-tertiary-fixed-variant/20 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">api</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-white mb-2">
                      Developer First SDK
                    </h4>
                    <p className="text-on-surface-variant">
                      Integrate Revifi's payout infrastructure into your own
                      platform with just 12 lines of code.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-2 lg:order-2">
              <div className="absolute inset-0 bg-secondary-container/5 blur-3xl"></div>
              <div className="relative glass-card rounded-2xl overflow-hidden border border-white/10 p-4">
                <div className="bg-gradient-to-br from-purple-500/10 to-teal-500/10 rounded-xl p-8 text-center">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="material-symbols-outlined text-primary-container">
                        payments
                      </span>
                      <p className="text-xs mt-2">Instant Payout</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="material-symbols-outlined text-secondary-container">
                        trending_up
                      </span>
                      <p className="text-xs mt-2">Analytics</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="material-symbols-outlined text-primary-container">
                        handshake
                      </span>
                      <p className="text-xs mt-2">Smart Escrow</p>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-t from-primary-container/20 to-transparent rounded-lg flex items-end p-4">
                    <div className="w-full space-y-2">
                      <div className="h-8 bg-primary-container/30 rounded w-3/4"></div>
                      <div className="h-8 bg-secondary-container/30 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-24 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-container/5 blur-[120px] rounded-full"></div>
          <div className="relative space-y-8 z-10">
            <h2 className="font-display-xl text-display-xl text-white">
              Stop waiting 60 days to get paid.
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
              Join over 4,500 creators and agencies who use Revifi to stabilize
              their cash flow and focus on building.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Link href="/creator/dashboard">
                <button className="w-full md:w-auto px-12 py-5 bg-white text-slate-950 rounded-2xl font-headline-md text-headline-md hover:bg-slate-100 transition-all">
                  Join the waitlist
                </button>
              </Link>
              <button className="w-full md:w-auto px-12 py-5 glass-card text-white rounded-2xl font-headline-md text-headline-md hover:bg-white/10 transition-all">
                Talk to Sales
              </button>
            </div>
            <p className="font-label-sm text-label-sm text-slate-500 uppercase tracking-widest">
              No credit check required for initial approval.
            </p>
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
              <span className="text-lg font-bold text-white font-space-grotesk">
                Revifi
              </span>
            </div>
            <p className="font-space-grotesk text-sm text-slate-400 text-center md:text-left">
              © 2026 Revifi. Built for the high-velocity creator economy.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href="#"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              Smart Contracts
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              Instant Payouts
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              Security
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-white transition-colors text-sm"
            >
              Terms
            </a>
          </div>
          <div className="flex gap-4">
            <a
              href="#"
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-white">
                language
              </span>
            </a>
            <a
              href="#"
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-white">
                share
              </span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}