"use client";

import { useState } from "react";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";

export default function DealsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const dealsData = {
    activePipeline: 142850.0,
    growth: 12.5,
    pipelineProgress: 68,
    deals: [
      {
        id: 1,
        name: "Project Nebula Review",
        contractId: "RV-00921",
        client: "Nebula Tech Systems",
        totalValue: 24500,
        deadline: "Oct 24, 2024",
        status: "In Review",
        statusColor: "secondary",
        milestone: "Script Approval",
        progress: 85,
        icon: "rocket_launch",
      },
      {
        id: 2,
        name: "Summer Gear Drop",
        contractId: "RV-01242",
        client: "Waveform Apparel",
        totalValue: 12000,
        deadline: "Nov 12, 2024",
        status: "Active",
        statusColor: "primary",
        milestone: "Content Production",
        progress: 40,
        icon: "tsunami",
      },
      {
        id: 3,
        name: "Long-term Ambassadorship",
        contractId: "RV-00891",
        client: "Aura Energy Drink",
        totalValue: 85000,
        deadline: "Sep 15, 2024",
        status: "Completed",
        statusColor: "secondary",
        milestone: "Final Delivery",
        progress: 100,
        icon: "diamond",
      },
      {
        id: 4,
        name: "Autumn Campaign V2",
        contractId: "RV-01123",
        client: "Lume Lighting",
        totalValue: 4200,
        deadline: "Aug 28, 2024",
        status: "Completed",
        statusColor: "secondary",
        milestone: "Campaign Launch",
        progress: 100,
        icon: "campaign",
      },
      {
        id: 5,
        name: "Product Integration #4",
        contractId: "RV-00765",
        client: "Zenith Keyboards",
        totalValue: 1850,
        deadline: "Aug 12, 2024",
        status: "Cancelled",
        statusColor: "error",
        milestone: "Integration Testing",
        progress: 30,
        icon: "integration_instructions",
      },
    ],
    recentActivity: [
      {
        id: 1,
        name: "Long-term Ambassadorship",
        counterparty: "Aura Energy Drink",
        date: "Sep 15, 2024",
        amount: 85000,
        status: "Settled",
      },
      {
        id: 2,
        name: "Autumn Campaign V2",
        counterparty: "Lume Lighting",
        date: "Aug 28, 2024",
        amount: 4200,
        status: "Settled",
      },
      {
        id: 3,
        name: "Product Integration #4",
        counterparty: "Zenith Keyboards",
        date: "Aug 12, 2024",
        amount: 1850,
        status: "Cancelled",
      },
    ],
  };

  const getStatusBadge = (status: string, color: string) => {
    const colors = {
      primary: "bg-primary/10 border-primary/20 text-primary",
      secondary: "bg-secondary/10 border-secondary/20 text-secondary",
      error: "bg-error/10 border-error/20 text-error",
    };
    return `px-2 py-1 ${colors[color as keyof typeof colors]} text-[10px] uppercase font-bold rounded tracking-wider border`;
  };

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
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search deals, brands, or contracts..."
              className="w-full bg-white/5 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-purple-500/50 text-slate-200 placeholder-slate-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hover:bg-white/5 rounded-full p-2 transition-all text-slate-400">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hover:bg-white/5 rounded-full p-2 transition-all text-slate-400">
            <span className="material-symbols-outlined">history</span>
          </button>
          <button className="bg-primary-container text-on-primary-container font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-purple-500/20 active:scale-95">
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
                    ${dealsData.activePipeline.toLocaleString()}
                  </span>
                  <span className="text-secondary font-data-mono text-body-md">
                    +{dealsData.growth}% vs last mo
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Campaign Fulfillment</span>
                  <span className="text-on-surface font-data-mono">
                    {dealsData.pipelineProgress}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_12px_rgba(153,69,255,0.4)]"
                    style={{ width: `${dealsData.pipelineProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 italic">
                  4 of 7 key milestones reached this week
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button className="bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-sm font-medium border border-white/10 hover:border-primary/50 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  filter_list
                </span>
                All Status
              </button>
              <button className="bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-sm font-medium border border-white/10 hover:border-primary/50 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  calendar_today
                </span>
                Date Range
              </button>
              <button className="bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-sm font-medium border border-white/10 hover:border-primary/50 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  payments
                </span>
                Value Tier
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-xl font-headline-md text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-secondary-container/10"
            >
              <span className="material-symbols-outlined">add</span>
              Create New Deal
            </button>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dealsData.deals.map((deal) => (
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
                  <div
                    className={getStatusBadge(deal.status, deal.statusColor)}
                  >
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

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 py-2 bg-surface-container-highest border border-white/5 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors">
                    View Contract
                  </button>
                  <button className="w-10 h-10 bg-surface-container-highest border border-white/5 rounded-lg flex items-center justify-center hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      more_horiz
                    </span>
                  </button>
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
                  Browse Templates
                </button>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-headline-md text-on-surface">
                Recent Contract Activity
              </h3>
              <button className="text-primary text-sm font-medium">
                View Archive
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 text-xs font-data-mono uppercase tracking-widest border-b border-white/5">
                    <th className="px-8 py-4 font-medium">Agreement Name</th>
                    <th className="px-8 py-4 font-medium">Counterparty</th>
                    <th className="px-8 py-4 font-medium">Execution Date</th>
                    <th className="px-8 py-4 font-medium">Amount</th>
                    <th className="px-8 py-4 font-medium">Status</th>
                    <th className="px-8 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dealsData.recentActivity.map((activity) => (
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
                              activity.status === "Settled"
                                ? "bg-secondary shadow-[0_0_8px_rgba(0,236,147,0.5)]"
                                : "bg-slate-500"
                            }`}
                          ></span>
                          <span className="text-xs text-on-surface">
                            {activity.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <button className="text-slate-500 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-lg">
                            {activity.status === "Settled"
                              ? "download"
                              : "history"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  placeholder="e.g., Summer Campaign 2024"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Client / Brand
                </label>
                <input
                  type="text"
                  placeholder="Brand name"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Total Value (USD)
                  </label>
                  <input
                    type="number"
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
                    className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Milestones
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Milestone name"
                      className="flex-1 bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="%"
                      className="w-24 bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button className="text-primary text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      add
                    </span>
                    Add Milestone
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Template
                </label>
                <select className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Standard Service Agreement</option>
                  <option>Sponsorship Deal</option>
                  <option>Content Creation Contract</option>
                  <option>Affiliate Partnership</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-white/10 text-white py-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    alert("Deal created successfully!");
                  }}
                  className="flex-1 bg-gradient-to-r from-primary-container to-inverse-primary text-white py-3 rounded-lg hover:brightness-110 transition-all font-semibold"
                >
                  Create Deal
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
