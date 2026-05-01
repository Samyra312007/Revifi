"use client";

import { useState } from "react";
import Link from "next/link";

export default function PaymentsPage() {
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const paymentsData = {
    availableToAdvance: 12450,
    activeAdvances: 4200,
    repaymentProgress: 65,
    totalPaidMTD: 28910.82,
    monthlyGrowth: 12.4,
    recentActivity: [
      {
        id: 1,
        type: "payment",
        title: "YouTube Adsense Payment",
        description: "Ad revenue share Jan 2024",
        date: "Feb 24, 2024",
        status: "Settled",
        amount: 8420,
        platform: "youtube",
      },
      {
        id: 2,
        type: "advance",
        title: "Instant Advance Payout",
        description: "Liquidity request #ADV-9021",
        date: "Feb 22, 2024",
        status: "Settled",
        amount: 2500,
        platform: "revifi",
      },
      {
        id: 3,
        type: "repayment",
        title: "Advance Repayment",
        description: "Automatic deduction (15%)",
        date: "Feb 21, 2024",
        status: "Processing",
        amount: -1263,
        platform: "revifi",
      },
      {
        id: 4,
        type: "payment",
        title: "Twitch Subscription Payout",
        description: "Monthly sub revenue",
        date: "Feb 18, 2024",
        status: "Settled",
        amount: 1840.5,
        platform: "twitch",
      },
      {
        id: 5,
        type: "advance",
        title: "Sponsorship Advance",
        description: "Liquidity request #ADV-8891",
        date: "Feb 15, 2024",
        status: "Completed",
        amount: 5000,
        platform: "revifi",
      },
    ],
    platforms: [
      { name: "YouTube", icon: "smart_display", connected: true, limit: 25000 },
      {
        name: "Twitch",
        icon: "stadia_controller",
        connected: true,
        limit: 15000,
      },
      {
        name: "Instagram",
        icon: "photo_camera",
        connected: false,
        limit: 20000,
      },
      { name: "TikTok", icon: "music_note", connected: false, limit: 18000 },
    ],
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Settled: "bg-secondary/10 text-secondary",
      Processing: "bg-white/10 text-slate-400",
      Completed: "bg-primary/10 text-primary",
    };
    return `inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${colors[status as keyof typeof colors] || colors.Settled}`;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      youtube: "smart_display",
      twitch: "stadia_controller",
      instagram: "photo_camera",
      tiktok: "music_note",
      revifi: "bolt",
    };
    return icons[platform] || "payments";
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
              placeholder="Search transactions or tools..."
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
                  <span className="font-data-mono text-slate-500 text-sm">
                    .00
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
                <span className="font-data-mono text-slate-500 text-sm">
                  .00
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
                <span className="font-data-mono text-slate-500 text-sm">
                  .82
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
                    {paymentsData.recentActivity.map((activity) => (
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
                    ))}
                  </tbody>
                </table>
                <div className="p-4 flex justify-center border-t border-white/5">
                  <button className="text-xs font-bold text-primary hover:underline transition-all">
                    View all history
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
                        key={platform.name}
                        onClick={() =>
                          !platform.connected &&
                          setSelectedPlatform(platform.name)
                        }
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer ${
                          platform.connected
                            ? "bg-white/5 border-white/10 hover:bg-white/10"
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
                        <span className="text-sm font-semibold text-white flex-1">
                          Connect {platform.name}
                        </span>
                        {platform.connected ? (
                          <span className="text-xs text-secondary">
                            Connected
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-xs text-slate-500">
                            add
                          </span>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="w-full mt-8 bg-white text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-[0.98] relative z-10"
                    >
                      Upgrade Account
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
                  Fee: 1.2% • Instant settlement
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Invoice
                </label>
                <select className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>YouTube Partner Program - $8,900</option>
                  <option>Instagram Sponsorship - $12,450</option>
                  <option>TikTok Creator Fund - $4,200</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Advance Amount
                </label>
                <input
                  type="number"
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
                  onClick={() => {
                    setShowAdvanceModal(false);
                    alert("Advance request submitted successfully!");
                  }}
                  className="flex-1 bg-gradient-to-r from-primary-container to-inverse-primary text-white py-3 rounded-lg hover:brightness-110 transition-all font-semibold"
                >
                  Confirm Advance
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

            <div className="space-y-6">
              <p className="text-slate-400 text-sm">
                Connect your social media accounts to verify your earnings and
                unlock higher advance limits.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedPlatform("YouTube");
                    setShowConnectModal(false);
                    alert(
                      "YouTube connected successfully! Your limit has been increased.",
                    );
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-container border border-white/10 hover:border-primary/50 transition-all"
                >
                  <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">
                      smart_display
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white">Connect YouTube</p>
                    <p className="text-xs text-slate-500">
                      Verify channel analytics
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-500">
                    chevron_right
                  </span>
                </button>

                <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-container border border-white/10 hover:border-primary/50 transition-all">
                  <div className="w-10 h-10 rounded bg-[#1DA1F2] flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">
                      alternate_email
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white">
                      Connect X / Twitter
                    </p>
                    <p className="text-xs text-slate-500">
                      Verify engagement metrics
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-500">
                    chevron_right
                  </span>
                </button>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-slate-400 text-center">
                  By connecting, you agree to share analytics data for
                  verification purposes.
                </p>
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
