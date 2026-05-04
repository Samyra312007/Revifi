"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthButton from "@/components/AuthButton";

interface DashboardStats {
  availableLiquidity: number;
  totalEarned: number;
  activeAdvances: number;
  pendingPayments: number;
  completedPayments: number;
}

interface UpcomingPayout {
  id: string;
  deal_name: string;
  brand_name?: string;
  amount: number;
  due_date: string;
  status: string;
}

interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  deal_name?: string;
}

export default function CreatorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingPayouts, setUpcomingPayouts] = useState<UpcomingPayout[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  const filteredTransactions = recentTransactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.deal_name?.toLowerCase().includes(q) ||
      tx.type.toLowerCase().includes(q) ||
      tx.status.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    fetchDashboardData();

    const subscription = supabase
      .channel("transactions_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          console.log("New transaction:", payload);
          fetchDashboardData();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: creator } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!creator) {
      setLoading(false);
      return;
    }

    const { data: statsData, error: statsError } = await supabase.rpc(
      "get_creator_dashboard_stats",
      { p_user_id: user.id },
    );

    if (!statsError && statsData && statsData.length > 0) {
      setStats(statsData[0]);
    }

    const { data: payouts } = await supabase
      .from("invoices")
      .select(
        `
        id,
        deal_name,
        amount,
        due_date,
        status,
        brands:brand_id (company_name)
      `,
      )
      .eq("creator_id", creator.id)
      .in("status", ["paid_to_escrow", "pending"])
      .order("due_date", { ascending: true })
      .limit(5);

    if (payouts) {
      setUpcomingPayouts(
        payouts.map((p: any) => ({
          id: p.id,
          deal_name: p.deal_name,
          brand_name: Array.isArray(p.brands)
            ? p.brands?.[0]?.company_name
            : p.brands?.company_name,
          amount: p.amount,
          due_date: p.due_date,
          status: p.status,
        })),
      );
    }

    const { data: transactions } = await supabase
      .from("transactions")
      .select(
        `
        id,
        type,
        amount,
        status,
        created_at,
        invoice:invoices (deal_name)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (transactions) {
      setRecentTransactions(
        transactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          status: t.status,
          created_at: t.created_at,
          deal_name: Array.isArray(t.invoice)
            ? t.invoice?.[0]?.deal_name
            : t.invoice?.deal_name,
        })),
      );
    }

    setLoading(false);
  }

  async function requestAdvance(invoiceId: string, amount: number) {
    try {
      const response = await fetch("/api/advances/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId, advance_amount: amount }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Advance of $${amount} approved! Fee: $${result.fee}`);
        fetchDashboardData(); // Refresh data
        setShowAdvanceModal(false);
      } else {
        alert("❌ Failed to process advance: " + result.error);
      }
    } catch (error) {
      console.error("Advance request error:", error);
      alert("An error occurred. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
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
            className="flex items-center gap-3 px-6 py-3 text-purple-400 bg-purple-500/5 border-r-2 border-purple-500 font-semibold transition-all"
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
            className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">contact_support</span>
            <span>Support</span>
          </Link>
          <AuthButton />
        </div>
      </aside>

      <header className="h-16 w-full border-b border-slate-800 sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 pl-[288px]">
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-purple-500/50 text-slate-200 placeholder-slate-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hover:bg-white/5 rounded-full p-2 transition-all text-slate-400 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-slate-950"></span>
          </button>
          <button className="hover:bg-white/5 rounded-full p-2 transition-all text-slate-400">
            <span className="material-symbols-outlined">history</span>
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <button
            onClick={() => setShowAdvanceModal(true)}
            className="bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-purple-500/20 active:scale-95"
          >
            Instant Advance
          </button>
          <img
            alt="Creator Profile"
            className="h-10 w-10 rounded-full border-2 border-purple-500/30 object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl_NVkyW8cyz9fizMsYf_e-H4gioVKYojBbAgEnhCkEX4Pc_yNkMumxkS6Af3EGQri09xvAWBX0KqVCMkmkKizeRo99AahLCBv_yBg0k5QI51ayNXWYqLn_ueWiBiyLaUnh1bajooI-YteZSS-mtK34WoABDmSUUUOVnMUoZ-MtI1Isfwcr7ZohWQ2SqyAjyqozccoD_m8gu7sUcGCCgVVUGgYxAUOQX6YCZ3iCPgUJ5JV9jZq0rFh-PAt4xkf92HFNhUmcuPI7j1Q"
          />
        </div>
      </header>

      <main className="ml-64 p-8 min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto space-y-8">
          <section className="glass-card rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-gradient-to-l from-primary to-transparent pointer-events-none"></div>
            <div className="relative z-10 space-y-4">
              <p className="text-primary font-label-sm tracking-widest uppercase">
                Available Liquidity
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="font-display-xl text-on-surface">
                  ${stats?.availableLiquidity?.toLocaleString() || "0"}
                </h2>
                <span className="font-data-mono text-secondary-container text-lg">
                  USDC
                </span>
              </div>
              <p className="text-slate-400 font-body-md max-w-md">
                Your earnings ready for instant withdrawal. Real-time revenue
                streaming.
              </p>
            </div>
            <div className="relative z-10">
              <button
                onClick={() => setShowAdvanceModal(true)}
                className="bg-gradient-to-br from-primary-container to-inverse-primary text-white font-headline-md px-10 py-5 rounded-xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3"
              >
                Request Instant Advance
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-xl p-6">
              <p className="text-slate-400 text-sm">Total Earned</p>
              <p className="text-2xl font-bold text-white">
                ${stats?.totalEarned?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-green-500 mt-2">Lifetime earnings</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <p className="text-slate-400 text-sm">Active Advances</p>
              <p className="text-2xl font-bold text-white">
                ${stats?.activeAdvances?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-yellow-500 mt-2">To be repaid</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <p className="text-slate-400 text-sm">Pending Payments</p>
              <p className="text-2xl font-bold text-white">
                ${stats?.pendingPayments?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-blue-500 mt-2">Awaiting settlement</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <p className="text-slate-400 text-sm">Completed Deals</p>
              <p className="text-2xl font-bold text-white">
                {stats?.completedPayments || 0}
              </p>
              <p className="text-xs text-purple-500 mt-2">Successfully paid</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="font-headline-md text-on-surface mb-4">
              Upcoming Payouts
            </h3>
            <div className="space-y-4">
              {upcomingPayouts.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No upcoming payouts
                </p>
              ) : (
                upcomingPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {payout.deal_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {payout.brand_name || "Brand"} • Due{" "}
                        {new Date(payout.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        ${payout.amount.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          payout.status === "paid_to_escrow"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {payout.status === "paid_to_escrow"
                          ? "Ready for Advance"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-on-surface">
                Recent Transactions
              </h3>
              <button className="text-primary text-sm hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No transactions yet
                </p>
              ) : filteredTransactions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No transactions match &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === "payment"
                            ? "bg-green-500/20"
                            : tx.type === "advance"
                              ? "bg-purple-500/20"
                              : "bg-slate-500/20"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${
                            tx.type === "payment"
                              ? "text-green-400"
                              : tx.type === "advance"
                                ? "text-purple-400"
                                : "text-slate-400"
                          }`}
                        >
                          {tx.type === "payment"
                            ? "arrow_downward"
                            : tx.type === "advance"
                              ? "bolt"
                              : "swap_horiz"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white capitalize">
                          {tx.type}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tx.deal_name ||
                            new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          tx.type === "payment"
                            ? "text-green-400"
                            : tx.type === "advance"
                              ? "text-purple-400"
                              : "text-white"
                        }`}
                      >
                        {tx.type === "payment"
                          ? "+"
                          : tx.type === "advance"
                            ? "→"
                            : ""}
                        ${Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <span
                        className={`text-xs ${
                          tx.status === "completed"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Request Instant Advance
              </h2>
              <button
                onClick={() => setShowAdvanceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-primary-container/10 rounded-xl p-4 border border-primary-container/20">
                <p className="text-sm text-slate-400 mb-1">
                  Available to Advance
                </p>
                <p className="text-3xl font-bold text-white">
                  ${stats?.availableLiquidity?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-secondary-container mt-2">
                  Fee: 5% • Instant settlement on Solana
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Invoice
                </label>
                <select
                  onChange={(e) => {
                    const selected = upcomingPayouts.find(
                      (p) => p.id === e.target.value,
                    );
                    setSelectedInvoice(selected);
                  }}
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select an invoice...</option>
                  {upcomingPayouts
                    .filter((p) => p.status === "paid_to_escrow")
                    .map((payout) => (
                      <option key={payout.id} value={payout.id}>
                        {payout.deal_name} - ${payout.amount.toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>

              {selectedInvoice && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Advance Amount
                  </label>
                  <input
                    type="number"
                    defaultValue={selectedInvoice.amount}
                    max={selectedInvoice.amount}
                    className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    You'll receive: $
                    {(selectedInvoice.amount * 0.95).toLocaleString()} (after 5%
                    fee)
                  </p>
                </div>
              )}

              <button
                onClick={() =>
                  selectedInvoice &&
                  requestAdvance(selectedInvoice.id, selectedInvoice.amount)
                }
                disabled={!selectedInvoice}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  selectedInvoice
                    ? "bg-gradient-to-r from-primary-container to-inverse-primary text-white hover:brightness-110"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                Confirm Advance
              </button>
            </div>
          </div>
        </div>
      )}

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
