"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthButton from "@/components/AuthButton";
import NotificationBell from "@/components/NotificationBell";
import GlobalSearch from "@/components/GlobalSearch";
import { downloadCsv } from "@/lib/csv";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: "Settled" | "Processing" | "Completed";
  amount: number;
  platform: string;
}

interface AdvanceableInvoice {
  id: string;
  deal_name: string;
  amount: number;
}

interface PlatformItem {
  key: string;
  name: string;
  icon: string;
  connected: boolean;
  limit: number;
  handle?: string;
}

interface PaymentsData {
  availableToAdvance: number;
  activeAdvances: number;
  repaymentProgress: number;
  totalPaidMTD: number;
  monthlyGrowth: number;
  recentActivity: ActivityItem[];
  advanceableInvoices: AdvanceableInvoice[];
  platforms: PlatformItem[];
  totalAdvanceLimit: number;
}

const DEFAULT_PLATFORMS: PlatformItem[] = [
  { key: "youtube", name: "YouTube", icon: "smart_display", connected: false, limit: 25000 },
  { key: "twitch", name: "Twitch", icon: "stadia_controller", connected: false, limit: 15000 },
  { key: "instagram", name: "Instagram", icon: "photo_camera", connected: false, limit: 20000 },
  { key: "tiktok", name: "TikTok", icon: "music_note", connected: false, limit: 18000 },
];

const DEFAULT_DATA: PaymentsData = {
  availableToAdvance: 0,
  activeAdvances: 0,
  repaymentProgress: 0,
  totalPaidMTD: 0,
  monthlyGrowth: 0,
  recentActivity: [],
  advanceableInvoices: [],
  platforms: DEFAULT_PLATFORMS,
  totalAdvanceLimit: 10000,
};

export default function PaymentsPage() {
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [paymentsData, setPaymentsData] = useState<PaymentsData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [advanceAmountInput, setAdvanceAmountInput] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectForm, setConnectForm] = useState({
    platform: "youtube",
    handle: "",
    follower_count: "",
    monthly_revenue: "",
  });
  const supabase = createClient();

  useEffect(() => {
    let invoiceChannel: ReturnType<typeof supabase.channel> | null = null;
    let txChannel: ReturnType<typeof supabase.channel> | null = null;
    fetchPaymentsData();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      invoiceChannel = supabase
        .channel("payments_invoices_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "invoices" },
          () => fetchPaymentsData(),
        )
        .subscribe();

      txChannel = supabase
        .channel(`payments_tx_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "transactions",
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchPaymentsData(),
        )
        .subscribe();
    })();

    return () => {
      if (invoiceChannel) supabase.removeChannel(invoiceChannel);
      if (txChannel) supabase.removeChannel(txChannel);
    };
  }, []);

  function exportActivityCsv() {
    const rows = paymentsData.recentActivity.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      date: a.date,
      status: a.status,
      amount_usd: a.amount,
    }));
    downloadCsv(rows, `revifi-payments-${Date.now()}.csv`);
  }

  async function fetchPaymentsData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthed(false);
      setPaymentsData(DEFAULT_DATA);
      setLoading(false);
      return;
    }
    setAuthed(true);

    const { data: creator } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!creator) {
      setPaymentsData(DEFAULT_DATA);
      setLoading(false);
      return;
    }

    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("creator_id", creator.id);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("id, type, amount, status, created_at, metadata, invoice:invoices(deal_name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const advanceableInvoices: AdvanceableInvoice[] = (invoices || [])
      .filter((i) => i.status === "paid_to_escrow")
      .map((i) => ({ id: i.id, deal_name: i.deal_name, amount: i.amount }));

    const availableToAdvance = advanceableInvoices.reduce(
      (sum, i) => sum + Number(i.amount || 0),
      0,
    );

    const activeAdvances =
      invoices
        ?.filter((i) => i.status === "factored")
        .reduce((sum, i) => sum + Number(i.advance_amount || 0), 0) || 0;

    const { data: platformRows } = await supabase
      .from("creator_platforms")
      .select("platform, handle, advance_limit")
      .eq("user_id", user.id);

    const platforms: PlatformItem[] = DEFAULT_PLATFORMS.map((p) => {
      const found = platformRows?.find((row: any) => row.platform === p.key);
      return found
        ? {
            ...p,
            connected: true,
            limit: Number(found.advance_limit || p.limit),
            handle: found.handle || undefined,
          }
        : p;
    });

    const totalAdvanceLimit = Math.max(
      10000,
      platforms
        .filter((p) => p.connected)
        .reduce((sum, p) => sum + Number(p.limit || 0), 0),
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalPaidMTD =
      transactions
        ?.filter(
          (t) =>
            t.type === "payment" &&
            t.status === "completed" &&
            new Date(t.created_at) >= startOfMonth,
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

    const recentActivity: ActivityItem[] = (transactions || []).map((t: any) => {
      const dealName: string | undefined = Array.isArray(t.invoice)
        ? t.invoice?.[0]?.deal_name
        : t.invoice?.deal_name;
      const description = t.metadata?.description || dealName || "Transaction";
      const title =
        t.type === "payment"
          ? "Payment Received"
          : t.type === "advance"
            ? "Instant Advance Payout"
            : t.type === "repayment"
              ? "Advance Repayment"
              : "Transaction";
      const status: ActivityItem["status"] =
        t.status === "completed"
          ? "Settled"
          : t.status === "pending"
            ? "Processing"
            : "Completed";
      return {
        id: t.id,
        type: t.type,
        title,
        description,
        date: new Date(t.created_at).toLocaleDateString(),
        status,
        amount: t.type === "repayment" ? -Math.abs(Number(t.amount)) : Number(t.amount),
        platform: t.type === "advance" || t.type === "repayment" ? "revifi" : "brand",
      };
    });

    setPaymentsData({
      availableToAdvance,
      activeAdvances,
      repaymentProgress:
        activeAdvances > 0
          ? Math.min(
              99,
              Math.round((activeAdvances / totalAdvanceLimit) * 100),
            )
          : 0,
      totalPaidMTD,
      monthlyGrowth: 12.4,
      recentActivity,
      advanceableInvoices,
      platforms,
      totalAdvanceLimit,
    });

    setLoading(false);
  }

  async function connectPlatform() {
    if (!connectForm.handle.trim()) {
      alert("Please enter your handle/channel name");
      return;
    }
    setConnecting(connectForm.platform);
    try {
      const res = await fetch("/api/platforms/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: connectForm.platform,
          handle: connectForm.handle.trim(),
          follower_count: Number(connectForm.follower_count) || 0,
          monthly_revenue: Number(connectForm.monthly_revenue) || 0,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(
          `${connectForm.platform} connected! New advance limit: $${Math.round(
            Number(result.platform.advance_limit),
          ).toLocaleString()}`,
        );
        setShowConnectModal(false);
        setSelectedPlatform(null);
        setConnectForm({
          platform: "youtube",
          handle: "",
          follower_count: "",
          monthly_revenue: "",
        });
        fetchPaymentsData();
      } else {
        alert("Failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Connection failed: " + (err?.message || err));
    } finally {
      setConnecting(null);
    }
  }

  async function disconnectPlatform(platform: string) {
    if (!confirm(`Disconnect ${platform}?`)) return;
    try {
      const res = await fetch(
        `/api/platforms/connect?platform=${encodeURIComponent(platform)}`,
        { method: "DELETE" },
      );
      const result = await res.json();
      if (res.ok && result.success) {
        fetchPaymentsData();
      } else {
        alert("Failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Disconnect failed: " + (err?.message || err));
    }
  }

  async function requestAdvance() {
    if (!selectedInvoiceId) {
      alert("Please select an invoice");
      return;
    }
    const invoice = paymentsData.advanceableInvoices.find((i) => i.id === selectedInvoiceId);
    if (!invoice) return;

    const requestedAmount = Number(advanceAmountInput) || invoice.amount;
    if (requestedAmount <= 0 || requestedAmount > invoice.amount) {
      alert(`Amount must be between 1 and ${invoice.amount}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/advances/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: selectedInvoiceId,
          advance_amount: requestedAmount,
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(`Advance approved! Fee: $${result.fee.toFixed(2)}`);
        setShowAdvanceModal(false);
        setSelectedInvoiceId("");
        setAdvanceAmountInput("");
        fetchPaymentsData();
      } else {
        alert("Failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Advance request error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      Settled: "bg-secondary/10 text-secondary",
      Processing: "bg-white/10 text-slate-400",
      Completed: "bg-primary/10 text-primary",
    };
    return `inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${colors[status as keyof typeof colors] || colors.Settled}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading payments...</p>
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
            className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/creator/payments"
            className="flex items-center gap-3 px-6 py-3 text-purple-400 bg-purple-500/5 border-r-2 border-purple-500 font-semibold"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              payments
            </span>
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
          <GlobalSearch placeholder="Search transactions, deals..." />
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <button
            onClick={exportActivityCsv}
            className="hover:bg-white/5 rounded-full p-2 transition-all text-slate-400"
            title="Download CSV"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
          <button
            onClick={() => setShowAdvanceModal(true)}
            className="bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-semibold px-5 py-2 rounded-full text-sm transition-all active:scale-[0.98]"
          >
            Instant Advance
          </button>
        </div>
      </header>

      <main className="ml-64 p-8 min-h-screen bg-background">
        <div className="max-w-6xl mx-auto space-y-8">
          {!authed && (
            <div className="glass-card rounded-xl p-6 border border-yellow-500/20 bg-yellow-500/5">
              <p className="text-yellow-400 text-sm">
                Sign in to see your real payments data.
              </p>
            </div>
          )}

          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-headline-lg text-white">
                Payments &amp; Advances
              </h1>
              <p className="text-on-surface-variant font-body-md mt-1">
                Manage your creator earnings and instant liquidity
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-secondary font-data-mono bg-secondary/10 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-xs"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
                Liquidity Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 glass-card p-6 rounded-xl flex flex-col justify-between group hover:border-primary/30 transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-label-sm text-slate-500 uppercase tracking-widest">
                    Available to Advance
                  </span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-sm">
                      account_balance
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-xl text-white">
                    ${paymentsData.availableToAdvance.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-secondary">
                  Ready for instant payout
                </p>
                <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors cursor-pointer">
                  arrow_forward
                </span>
              </div>
            </div>

            <div className="md:col-span-4 glass-card p-6 rounded-xl group hover:border-secondary/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-label-sm text-slate-500 uppercase tracking-widest">
                  Active Advances
                </span>
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display-xl text-white">
                  ${paymentsData.activeAdvances.toLocaleString()}
                </span>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-[10px] uppercase text-slate-500 font-bold mb-2">
                  <span>Repayment Progress</span>
                  <span>{paymentsData.repaymentProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_8px_rgba(0,236,145,0.3)]"
                    style={{ width: `${paymentsData.repaymentProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 glass-card p-6 rounded-xl group hover:border-slate-500 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-label-sm text-slate-500 uppercase tracking-widest">
                  Total Paid (MTD)
                </span>
                <div className="p-2 rounded-lg bg-white/5 text-slate-300">
                  <span className="material-symbols-outlined text-sm">
                    done_all
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display-xl text-white">
                  ${paymentsData.totalPaidMTD.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-400">
                  <span className="text-secondary font-bold">
                    +{paymentsData.monthlyGrowth}%
                  </span>{" "}
                  vs last month
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-white">Recent Activity</h2>
                <div className="flex p-1 bg-surface-container rounded-lg border border-white/5">
                  <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-white/10 text-white shadow-sm">
                    All
                  </button>
                  <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors">
                    Payments
                  </button>
                  <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors">
                    Advances
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-container-low/30">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        Date
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paymentsData.recentActivity.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-slate-500 py-12">
                          No recent activity yet
                        </td>
                      </tr>
                    ) : (
                      paymentsData.recentActivity.map((activity) => (
                        <tr
                          key={activity.id}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  activity.type === "payment"
                                    ? "bg-purple-500/10 text-primary"
                                    : activity.type === "advance"
                                      ? "bg-secondary/10 text-secondary"
                                      : "bg-white/5 text-slate-400"
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {activity.type === "payment"
                                    ? "input"
                                    : activity.type === "advance"
                                      ? "bolt"
                                      : "output"}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {activity.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {activity.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-data-mono text-xs text-slate-400">
                            {activity.date}
                          </td>
                          <td className="px-6 py-4">
                            <span className={getStatusBadge(activity.status)}>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  activity.status === "Settled"
                                    ? "bg-secondary"
                                    : activity.status === "Processing"
                                      ? "bg-slate-500"
                                      : "bg-primary"
                                }`}
                              ></span>
                              {activity.status}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-data-mono text-sm ${
                              activity.amount < 0
                                ? "text-slate-400"
                                : "text-white"
                            }`}
                          >
                            {activity.amount < 0 ? "-" : "+"}$
                            {Math.abs(activity.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="p-4 flex justify-center border-t border-white/5">
                  <button
                    onClick={exportActivityCsv}
                    className="text-xs font-bold text-primary hover:underline transition-all"
                  >
                    Download history (CSV)
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="gradient-border p-[1px]">
                <div className="bg-slate-950/80 rounded-[0.7rem] p-8 overflow-hidden relative group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700"></div>
                  <h3 className="font-headline-md text-white relative z-10 leading-tight">
                    Need a bigger advance?
                  </h3>
                  <p className="text-slate-400 text-sm mt-4 font-body-md relative z-10">
                    Connect your platform analytics to unlock limits up to{" "}
                    <span className="text-white font-bold">$100k</span> with
                    reduced fees.
                  </p>
                  <div className="mt-8 space-y-4 relative z-10">
                    {paymentsData.platforms.map((platform) => (
                      <div
                        key={platform.key}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                          platform.connected
                            ? "bg-secondary/5 border-secondary/30"
                            : "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center ${
                            platform.name === "YouTube"
                              ? "bg-red-600"
                              : platform.name === "Twitch"
                                ? "bg-purple-600"
                                : platform.name === "Instagram"
                                  ? "bg-gradient-to-br from-pink-500 to-orange-500"
                                  : "bg-black"
                          }`}
                        >
                          <span className="material-symbols-outlined text-white text-sm">
                            {platform.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {platform.connected
                              ? platform.handle || platform.name
                              : `Connect ${platform.name}`}
                          </p>
                          {platform.connected && (
                            <p className="text-[10px] text-secondary">
                              Limit: ${Math.round(platform.limit).toLocaleString()}
                            </p>
                          )}
                        </div>
                        {platform.connected ? (
                          <button
                            onClick={() => disconnectPlatform(platform.key)}
                            className="text-[10px] text-slate-400 hover:text-red-400"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setConnectForm({
                                ...connectForm,
                                platform: platform.key,
                              });
                              setSelectedPlatform(platform.key);
                              setShowConnectModal(true);
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="w-full mt-8 bg-white text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-[0.98] relative z-10"
                    >
                      Connect Another Platform
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-secondary">
                <div className="p-2 bg-secondary/10 text-secondary rounded-full">
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Bank-Grade Security
                  </p>
                  <p className="text-[10px] text-slate-500">
                    256-bit encryption active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Request Instant Advance
              </h2>
              <button
                onClick={() => setShowAdvanceModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
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
                  ${paymentsData.availableToAdvance.toLocaleString()}
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
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = paymentsData.advanceableInvoices.find(
                      (i) => i.id === e.target.value,
                    );
                    setAdvanceAmountInput(inv ? String(inv.amount) : "");
                  }}
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select an invoice...</option>
                  {paymentsData.advanceableInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.deal_name} - ${Number(inv.amount).toLocaleString()}
                    </option>
                  ))}
                </select>
                {paymentsData.advanceableInvoices.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    No invoices available for advance yet.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Advance Amount
                </label>
                <input
                  type="number"
                  value={advanceAmountInput}
                  onChange={(e) => setAdvanceAmountInput(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Max: ${paymentsData.availableToAdvance.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAdvanceModal(false)}
                  className="flex-1 border border-white/10 text-white py-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={requestAdvance}
                  disabled={submitting || !selectedInvoiceId}
                  className="flex-1 bg-gradient-to-r from-primary-container to-inverse-primary text-white py-3 rounded-lg hover:brightness-110 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing..." : "Confirm Advance"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Connect Your Platform
              </h2>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <p className="text-slate-400 text-sm">
                Provide your channel/handle and stats. Verified analytics
                increase your advance limit.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Platform
                </label>
                <select
                  value={connectForm.platform}
                  onChange={(e) =>
                    setConnectForm({ ...connectForm, platform: e.target.value })
                  }
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="youtube">YouTube</option>
                  <option value="twitch">Twitch</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">X / Twitter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Handle / Channel
                </label>
                <input
                  type="text"
                  value={connectForm.handle}
                  onChange={(e) =>
                    setConnectForm({ ...connectForm, handle: e.target.value })
                  }
                  placeholder="@yourhandle"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Followers
                  </label>
                  <input
                    type="number"
                    value={connectForm.follower_count}
                    onChange={(e) =>
                      setConnectForm({
                        ...connectForm,
                        follower_count: e.target.value,
                      })
                    }
                    placeholder="50000"
                    className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monthly Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={connectForm.monthly_revenue}
                    onChange={(e) =>
                      setConnectForm({
                        ...connectForm,
                        monthly_revenue: e.target.value,
                      })
                    }
                    placeholder="3000"
                    className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-slate-400 text-center">
                  Limits use formula: <code>3× monthly revenue + $0.05/follower</code>{" "}
                  (capped at $100k).
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 border border-white/10 text-white py-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={connectPlatform}
                  disabled={connecting !== null}
                  className="flex-1 bg-gradient-to-r from-primary-container to-inverse-primary text-white py-3 rounded-lg hover:brightness-110 transition-all font-semibold disabled:opacity-50"
                >
                  {connecting ? "Connecting..." : "Connect"}
                </button>
              </div>
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
        .gradient-border {
          position: relative;
          border-radius: 0.75rem;
        }
        .gradient-border::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          padding: 1px;
          background: linear-gradient(to bottom right, #9945ff, #00ec91);
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
