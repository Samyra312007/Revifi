"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthButton from "@/components/AuthButton";
import NotificationBell from "@/components/NotificationBell";

export default function SupportPage() {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const supabase = createClient();

  async function sendSupportTicket() {
    if (!subject.trim() || !message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSending(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You need to be signed in to contact support.");
      setSending(false);
      return;
    }

    try {
      const response = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (response.ok) {
        alert("Support ticket sent! We'll get back to you within 24 hours.");
        setSubject("");
        setMessage("");
      } else {
        const result = await response.json().catch(() => ({}));
        alert("Failed to send ticket: " + (result.error || "Please try again."));
      }
    } catch (error) {
      console.error("Send ticket error:", error);
      alert("Failed to send ticket. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="h-screen w-64 border-r border-slate-800 fixed left-0 top-0 bg-slate-950 flex flex-col py-6 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-bold tracking-tighter text-white bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Revifi
          </h1>
          <p className="text-xs text-slate-500 mt-1">Creator Finance</p>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            href="/creator/dashboard"
            className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/creator/payments"
            className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">payments</span>
            <span>Payments</span>
          </Link>
          <Link
            href="/creator/deals"
            className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">handshake</span>
            <span>Deals</span>
          </Link>
          <Link
            href="/creator/wallet"
            className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">
              account_balance_wallet
            </span>
            <span>Wallet</span>
          </Link>
        </nav>

        <div className="mt-auto border-t border-white/5 pt-6 space-y-1">
          <Link
            href="/creator/settings"
            className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
          <Link
            href="/creator/support"
            className="flex items-center gap-3 px-6 py-3 text-purple-400 bg-purple-500/5 border-r-2 border-purple-500 font-semibold"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              contact_support
            </span>
            <span>Support</span>
          </Link>
          <AuthButton />
        </div>
      </aside>

      <header className="h-16 ml-64 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 flex justify-between items-center px-8">
        <h1 className="text-xl font-semibold text-white">Support Center</h1>
        <NotificationBell />
      </header>

      <main className="ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="glass-card rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">
                  How do I request an advance?
                </h3>
                <p className="text-slate-400 text-sm">
                  Go to your Dashboard and click &ldquo;Request Instant
                  Advance&rdquo; on any eligible invoice with &ldquo;Ready for
                  Advance&rdquo; status.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">
                  What are the fees?
                </h3>
                <p className="text-slate-400 text-sm">
                  Instant advances have a 5% fee. Standard settlements have no
                  fees.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">
                  How fast do I get paid?
                </h3>
                <p className="text-slate-400 text-sm">
                  Advances are processed instantly on Solana (2-3 seconds).
                  Standard settlements take 30-60 days.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">
                  Is my money safe?
                </h3>
                <p className="text-slate-400 text-sm">
                  Yes! We use bank-grade encryption and multi-signature wallets.
                  Funds are held in escrow smart contracts.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              Contact Support
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is your issue about?"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <button
                onClick={sendSupportTicket}
                disabled={sending}
                className="w-full bg-primary-container text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-xl p-8 text-center">
            <h3 className="text-white font-semibold mb-2">
              support@revifi.com
            </h3>
            <p className="text-slate-400 text-sm">Response time: 24-48 hours</p>
          </div>
        </div>
      </main>

      <style jsx>{`
        .glass-card {
          background: rgba(29, 32, 34, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
