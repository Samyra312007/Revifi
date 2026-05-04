"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthButton from "@/components/AuthButton";
import NotificationBell from "@/components/NotificationBell";
import GlobalSearch from "@/components/GlobalSearch";

interface Brand {
  id: string;
  company_name: string;
}

interface Deal {
  id: string;
  name: string;
  contractId: string;
  client: string;
  totalValue: number;
  deadline: string;
  status: "Active" | "In Review" | "Completed" | "Cancelled" | "Pending";
  statusColor: "primary" | "secondary" | "error";
  milestone: string;
  progress: number;
  icon: string;
  rawStatus: string;
  amount: number;
}

function statusToDisplay(status: string): {
  label: Deal["status"];
  color: Deal["statusColor"];
  progress: number;
  icon: string;
  milestone: string;
} {
  switch (status) {
    case "paid_to_escrow":
      return {
        label: "In Review",
        color: "secondary",
        progress: 85,
        icon: "rocket_launch",
        milestone: "Awaiting Settlement",
      };
    case "factored":
      return {
        label: "Active",
        color: "primary",
        progress: 60,
        icon: "bolt",
        milestone: "Advance Issued",
      };
    case "settled":
      return {
        label: "Completed",
        color: "secondary",
        progress: 100,
        icon: "diamond",
        milestone: "Settled",
      };
    case "expired":
    case "cancelled":
      return {
        label: "Cancelled",
        color: "error",
        progress: 30,
        icon: "cancel",
        milestone: "Closed",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        color: "primary",
        progress: 15,
        icon: "campaign",
        milestone: "Awaiting Payment",
      };
  }
}

export default function DealsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [creatorId, setCreatorId] = useState<string | null>(null);

  const [form, setForm] = useState({
    deal_name: "",
    brand_id: "",
    new_brand_name: "",
    new_brand_industry: "",
    new_brand_contact_email: "",
    amount: "",
    due_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/?signin=1");
      return;
    }
    setAuthed(true);

    const { data: creator } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!creator) {
      setDeals([]);
      setLoading(false);
      return;
    }
    setCreatorId(creator.id);

    const { data: brandList } = await supabase
      .from("brands")
      .select("id, company_name")
      .order("company_name", { ascending: true });
    setBrands((brandList as Brand[]) || []);

    const { data: invoices } = await supabase
      .from("invoices")
      .select("*, brands:brand_id(company_name)")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false });

    type InvoiceRow = {
      id: string;
      deal_name: string;
      amount: number;
      due_date: string | null;
      status: string;
      brands?: { company_name?: string } | { company_name?: string }[] | null;
    };

    const mapped: Deal[] = ((invoices as InvoiceRow[]) || []).map((inv) => {
      const display = statusToDisplay(inv.status);
      const brandName = Array.isArray(inv.brands)
        ? inv.brands?.[0]?.company_name
        : inv.brands?.company_name;
      return {
        id: inv.id,
        name: inv.deal_name || "Untitled Deal",
        contractId: `RV-${String(inv.id).slice(0, 5).toUpperCase()}`,
        client: brandName || "—",
        totalValue: Number(inv.amount || 0),
        amount: Number(inv.amount || 0),
        deadline: inv.due_date
          ? new Date(inv.due_date).toLocaleDateString()
          : "No deadline",
        status: display.label,
        statusColor: display.color,
        milestone: display.milestone,
        progress: display.progress,
        icon: display.icon,
        rawStatus: inv.status,
      };
    });

    setDeals(mapped);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      await fetchData();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`deals_invoices_changes_${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "invoices" },
          () => fetchData(),
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchData, supabase]);

  const filteredDeals = useMemo(() => {
    if (filterStatus === "all") return deals;
    return deals.filter((d) => d.status.toLowerCase() === filterStatus);
  }, [deals, filterStatus]);

  const recentActivity = useMemo(() => {
    return deals.slice(0, 5).map((d) => ({
      id: d.id,
      name: d.name,
      counterparty: d.client,
      date: d.deadline,
      amount: d.totalValue,
      status: d.status,
    }));
  }, [deals]);

  const activePipeline = useMemo(
    () =>
      deals
        .filter((d) => d.status !== "Completed" && d.status !== "Cancelled")
        .reduce((sum, d) => sum + d.totalValue, 0),
    [deals],
  );
  const pipelineProgress = useMemo(() => {
    if (deals.length === 0) return 0;
    const totalProgress = deals.reduce((sum, d) => sum + d.progress, 0);
    return Math.round(totalProgress / deals.length);
  }, [deals]);

  async function createDeal() {
    if (!form.deal_name.trim() || !form.amount || !form.due_date) {
      alert("Please fill in deal name, amount, and deadline.");
      return;
    }
    if (!creatorId) {
      alert("Creator profile not found. Please complete onboarding first.");
      return;
    }

    let brandId = form.brand_id;
    if (!brandId && form.new_brand_name.trim()) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: newBrand, error: brandErr } = await supabase
        .from("brands")
        .insert({
          company_name: form.new_brand_name.trim(),
          industry: form.new_brand_industry.trim() || null,
          contact_email: form.new_brand_contact_email.trim() || null,
          user_id: user?.id || null,
        })
        .select()
        .single();
      if (brandErr) {
        alert("Failed to create brand: " + brandErr.message);
        return;
      }
      brandId = newBrand.id;
    }

    if (!brandId) {
      alert("Select an existing brand or enter a new brand name.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/deals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_name: form.deal_name.trim(),
          creator_id: creatorId,
          brand_id: brandId,
          amount: Number(form.amount),
          due_date: form.due_date,
        }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        if (result.checkout_url) {
          alert(
            "Deal created! Redirecting brand to Dodo Payments checkout...",
          );
          window.open(result.checkout_url, "_blank", "noopener,noreferrer");
        } else {
          alert("Deal created!");
        }
        setShowCreateModal(false);
        setForm({
          deal_name: "",
          brand_id: "",
          new_brand_name: "",
          new_brand_industry: "",
          new_brand_contact_email: "",
          amount: "",
          due_date: "",
        });
        fetchData();
      } else {
        alert("Failed to create deal: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Create deal error:", err);
      alert("Failed to create deal. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusBadge = (status: string, color: string) => {
    const colors = {
      primary: "bg-primary/10 border-primary/20 text-primary",
      secondary: "bg-secondary/10 border-secondary/20 text-secondary",
      error: "bg-error/10 border-error/20 text-error",
    };
    return `px-2 py-1 ${colors[color as keyof typeof colors]} text-[10px] uppercase font-bold rounded tracking-wider border`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading deals...</p>
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
            className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">payments</span>
            <span>Payments</span>
          </Link>
          <Link
            href="/creator/deals"
            className="flex items-center gap-3 px-6 py-3 text-purple-400 bg-purple-500/5 border-r-2 border-purple-500 font-semibold"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              handshake
            </span>
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
          <GlobalSearch placeholder="Search deals, brands, transactions..." />
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-container text-on-primary-container font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-purple-500/20 active:scale-95"
          >
            New Deal
          </button>
        </div>
      </header>

      <main className="ml-64 p-8 min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto space-y-8">
          {!authed && (
            <div className="glass-card rounded-xl p-6 border border-yellow-500/20 bg-yellow-500/5">
              <p className="text-yellow-400 text-sm">
                Sign in to see and create your deals.
              </p>
            </div>
          )}

          <section className="relative rounded-3xl overflow-hidden p-10 mesh-gradient border border-white/5">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <p className="text-primary font-data-mono text-sm uppercase tracking-widest mb-2">
                  Portfolio Analytics
                </p>
                <h2 className="text-on-surface text-headline-lg font-headline-lg mb-4">
                  Active Pipeline
                </h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-on-surface font-display-xl text-display-xl">
                    ${activePipeline.toLocaleString()}
                  </span>
                  <span className="text-secondary font-data-mono text-body-md">
                    {deals.length} deal{deals.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Pipeline Fulfillment</span>
                  <span className="text-on-surface font-data-mono">
                    {pipelineProgress}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_12px_rgba(153,69,255,0.4)]"
                    style={{ width: `${pipelineProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 italic">
                  {deals.filter((d) => d.status === "Completed").length} of{" "}
                  {deals.length} completed
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-sm font-medium border border-white/10 hover:border-primary/50 transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="in review">In Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-xl font-headline-md text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-secondary-container/10"
            >
              <span className="material-symbols-outlined">add</span>
              Create New Deal
            </button>
          </section>

          {filteredDeals.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-slate-500">
                  inbox
                </span>
              </div>
              <h3 className="text-white font-headline-md mb-2">
                {deals.length === 0 ? "No deals yet" : "No deals match this filter"}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {deals.length === 0
                  ? "Create your first deal to start tracking sponsorship contracts and instant advances."
                  : "Try changing the status filter."}
              </p>
              {deals.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary-container text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
                >
                  Create First Deal
                </button>
              )}
            </div>
          ) : (
            <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="glass-card rounded-2xl p-6 flex flex-col group hover:border-primary/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10">
                        <span
                          className={`material-symbols-outlined ${
                            deal.statusColor === "primary"
                              ? "text-primary"
                              : deal.statusColor === "secondary"
                                ? "text-secondary"
                                : "text-error"
                          }`}
                        >
                          {deal.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-on-surface">
                          {deal.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Contract ID: {deal.contractId}
                        </p>
                      </div>
                    </div>
                    <div className={getStatusBadge(deal.status, deal.statusColor)}>
                      {deal.status}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Client</span>
                      <span className="text-on-surface font-medium">
                        {deal.client}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Value</span>
                      <span className="text-on-surface font-data-mono">
                        ${deal.totalValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Deadline</span>
                      <span className="text-on-surface">{deal.deadline}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">
                        Milestone: {deal.milestone}
                      </span>
                      <span className="text-on-surface">{deal.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          deal.statusColor === "primary"
                            ? "bg-primary"
                            : deal.statusColor === "secondary"
                              ? "bg-secondary"
                              : "bg-error"
                        }`}
                        style={{ width: `${deal.progress}%` }}
                      ></div>
                    </div>
                  </div>

                </div>
              ))}

              <div className="glass-card rounded-2xl p-6 flex flex-col group hover:border-primary/30 transition-all border-dashed border-white/10 bg-transparent">
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-slate-500 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-3xl">
                      add_circle
                    </span>
                  </div>
                  <h3 className="font-headline-md text-slate-300 mb-2">
                    New Partnership?
                  </h3>
                  <p className="text-sm text-slate-500 max-w-[180px]">
                    Draft a new deal and generate a secure Revifi contract link.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-6 text-primary text-sm font-medium hover:underline"
                  >
                    Create deal
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-headline-md text-on-surface">
                Recent Contract Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 text-xs font-data-mono uppercase tracking-widest border-b border-white/5">
                    <th className="px-8 py-4 font-medium">Agreement Name</th>
                    <th className="px-8 py-4 font-medium">Counterparty</th>
                    <th className="px-8 py-4 font-medium">Deadline</th>
                    <th className="px-8 py-4 font-medium">Amount</th>
                    <th className="px-8 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-slate-500 py-12"
                      >
                        No deals to show
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((activity) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-500 group-hover:text-primary">
                              description
                            </span>
                            <span className="text-on-surface font-medium text-sm">
                              {activity.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-300">
                          {activity.counterparty}
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-300">
                          {activity.date}
                        </td>
                        <td className="px-8 py-5 text-sm text-on-surface font-data-mono">
                          ${activity.amount.toLocaleString()}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                activity.status === "Completed"
                                  ? "bg-secondary shadow-[0_0_8px_rgba(0,236,147,0.5)]"
                                  : "bg-slate-500"
                              }`}
                            ></span>
                            <span className="text-xs text-on-surface">
                              {activity.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Deal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Deal Name
                </label>
                <input
                  type="text"
                  value={form.deal_name}
                  onChange={(e) =>
                    setForm({ ...form, deal_name: e.target.value })
                  }
                  placeholder="e.g., Summer Campaign 2024"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Brand
                </label>
                <select
                  value={form.brand_id}
                  onChange={(e) =>
                    setForm({ ...form, brand_id: e.target.value })
                  }
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">— Select existing brand —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.company_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Or add a new brand:
                </p>
                <input
                  type="text"
                  value={form.new_brand_name}
                  onChange={(e) =>
                    setForm({ ...form, new_brand_name: e.target.value })
                  }
                  placeholder="New brand name"
                  className="mt-2 w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {form.new_brand_name.trim() && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={form.new_brand_industry}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          new_brand_industry: e.target.value,
                        })
                      }
                      placeholder="Industry (optional)"
                      className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="email"
                      value={form.new_brand_contact_email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          new_brand_contact_email: e.target.value,
                        })
                      }
                      placeholder="Brand contact email"
                      className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Total Value (USD)
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="Amount"
                    className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm({ ...form, due_date: e.target.value })
                    }
                    className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="bg-secondary-container/10 rounded-xl p-4 border border-secondary-container/20">
                <p className="text-xs text-secondary-container font-bold uppercase tracking-widest mb-1">
                  How it works
                </p>
                <p className="text-sm text-slate-300">
                  Creating a deal generates a Dodo Payments checkout link for
                  the brand. Once they pay, the funds enter escrow and you can
                  request an instant advance against the invoice.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-white/10 text-white py-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createDeal}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-primary-container to-inverse-primary text-white py-3 rounded-lg hover:brightness-110 transition-all font-semibold disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Deal"}
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
        .mesh-gradient {
          background:
            radial-gradient(
              at 0% 0%,
              rgba(153, 69, 255, 0.15) 0px,
              transparent 50%
            ),
            radial-gradient(
              at 100% 100%,
              rgba(0, 236, 145, 0.1) 0px,
              transparent 50%
            );
        }
      `}</style>
    </div>
  );
}
