"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreatorDashboard() {
  const router = useRouter();
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const dashboardData = {
    availableLiquidity: 142500.0,
    liquidityUtilization: 64,
    totalEarnings: 89250.0,
    monthlyGrowth: 12.5,
    upcomingPayouts: [
      {
        id: 1,
        platform: "Instagram",
        project: "Instagram Ads",
        amount: 12450,
        date: "Oct 24",
        status: "Pending",
        icon: "instagram",
      },
      {
        id: 2,
        platform: "YouTube",
        project: "YouTube Partner",
        amount: 8900,
        date: "Oct 28",
        status: "Pending",
        icon: "youtube",
      },
      {
        id: 3,
        platform: "TikTok",
        project: "TikTok Creator Fund",
        amount: 4200,
        date: "Nov 02",
        status: "Verified",
        icon: "tiktok",
      },
    ],
    recentSettlements: [
      {
        id: 1,
        amount: 1200,
        txid: "8v92...f02",
        status: "settled",
        date: "Oct 24",
      },
      {
        id: 2,
        amount: 3450,
        txid: "4x11...e88",
        status: "settled",
        date: "Oct 23",
      },
      {
        id: 3,
        amount: 15000,
        txid: "2m09...a11",
        status: "processing",
        date: "Oct 22",
      },
    ],
    monthlyData: [25, 40, 35, 60, 55, 80, 42], // Chart data
  };

  const handleAdvanceRequest = async (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowAdvanceModal(true);
  };

  const processAdvance = async () => {
    // API call to process advance
    console.log("Processing advance for:", selectedInvoice);
    setShowAdvanceModal(false);
    // Show success message
    alert(`Advance of $${selectedInvoice?.amount} requested successfully!`);
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
          <section className="glass-card rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4 glow-purple">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-gradient-to-l from-primary to-transparent pointer-events-none"></div>
            <div className="relative z-10 space-y-4">
              <p className="text-primary font-label-sm tracking-widest uppercase">
                Available Liquidity
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="font-display-xl text-on-surface">
                  ${dashboardData.availableLiquidity.toLocaleString()}
                </h2>
                <span className="font-data-mono text-secondary-container text-lg">
                  SOL
                </span>
              </div>
              <p className="text-slate-400 font-body-md max-w-md">
                Your earnings are ready for instant withdrawal. No hidden fees,
                powered by real-time revenue streaming.
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="glass-card rounded-xl p-6 h-[450px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-md text-on-surface">
                    Monthly Performance
                  </h3>
                  <div className="flex gap-2">
                    <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-label-sm text-slate-300">
                      Last 30 Days
                    </span>
                    <button className="material-symbols-outlined text-slate-500 hover:text-white transition-colors">
                      more_vert
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative mt-4">
                  <div className="absolute inset-0 flex items-end gap-2 pb-2">
                    {dashboardData.monthlyData.map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-white/5 rounded-t-lg hover:bg-primary/20 transition-all cursor-pointer relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-950 text-xs px-2 py-1 rounded font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          $
                          {(
                            (dashboardData.availableLiquidity * height) /
                            100
                          ).toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-b border-slate-400 w-full"></div>
                    <div className="border-b border-slate-400 w-full"></div>
                    <div className="border-b border-slate-400 w-full"></div>
                    <div className="border-b border-slate-400 w-full"></div>
                    <div className="border-b border-slate-400 w-full"></div>
                  </div>
                </div>

                <div className="flex justify-between mt-4 text-xs font-data-mono text-slate-500">
                  <span>MON</span>
                  <span>TUE</span>
                  <span>WED</span>
                  <span>THU</span>
                  <span>FRI</span>
                  <span>SAT</span>
                  <span>SUN</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-md text-sm text-slate-300">
                    Liquidity Utilization
                  </h3>
                  <span className="font-data-mono text-primary text-sm">
                    {dashboardData.liquidityUtilization}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary-container shadow-[0_0_10px_rgba(216,185,255,0.4)]"
                    style={{ width: `${dashboardData.liquidityUtilization}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">
                  You have used $
                  {(
                    (dashboardData.availableLiquidity *
                      dashboardData.liquidityUtilization) /
                    100
                  ).toLocaleString()}{" "}
                  of your total $
                  {dashboardData.availableLiquidity.toLocaleString()} credit
                  line. Next settlement in 4 days.
                </p>
              </div>

              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="font-headline-md text-on-surface mb-2">
                  Upcoming Payouts
                </h3>
                <div className="space-y-4">
                  {dashboardData.upcomingPayouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full bg-gradient-to-br ${
                            payout.platform === "Instagram"
                              ? "from-pink-500 to-orange-400"
                              : payout.platform === "YouTube"
                                ? "from-red-600 to-red-700"
                                : "from-slate-700 to-slate-800"
                          } flex items-center justify-center`}
                        >
                          <span className="material-symbols-outlined text-white text-sm">
                            {payout.platform === "Instagram"
                              ? "photo_camera"
                              : payout.platform === "YouTube"
                                ? "smart_display"
                                : "music_note"}
                          </span>
                        </div>
                        <div>
                          <p className="font-body-md text-sm font-semibold">
                            {payout.project}
                          </p>
                          <p className="text-xs text-slate-500">
                            Expected {payout.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-data-mono text-sm text-on-surface">
                          ${payout.amount.toLocaleString()}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded ${
                            payout.status === "Pending"
                              ? "bg-secondary-container/10 text-secondary-container"
                              : "bg-slate-400/10 text-slate-400"
                          }`}
                        >
                          {payout.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 text-xs font-label-sm text-purple-400 hover:text-purple-300 transition-colors mt-2">
                  View All Payouts
                </button>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-on-surface">
                Recent Settlements
              </h3>
              <button className="text-primary font-label-sm hover:underline">
                Download CSV
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.recentSettlements.map((settlement) => (
                <div
                  key={settlement.id}
                  className={`glass-card p-4 rounded-xl ${
                    settlement.status === "processing"
                      ? "border-l-4 border-primary"
                      : "border-l-4 border-secondary-container"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`material-symbols-outlined ${
                        settlement.status === "processing"
                          ? "text-primary"
                          : "text-secondary-container"
                      }`}
                    >
                      {settlement.status === "processing"
                        ? "sync"
                        : "check_circle"}
                    </span>
                    <span className="font-data-mono text-[10px] text-slate-500">
                      TXID: {settlement.txid}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {settlement.status === "processing"
                      ? "Processing Advance"
                      : "Settled to Wallet"}
                  </p>
                  <h4 className="font-headline-md text-lg text-on-surface">
                    ${settlement.amount.toLocaleString()}
                  </h4>
                </div>
              ))}
            </div>
          </section>
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
                  ${dashboardData.availableLiquidity.toLocaleString()}
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
                <p className="text-xs text-slate-500 mt-1">Max: $142,500.00</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAdvanceModal(false)}
                  className="flex-1 border border-white/10 text-white py-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={processAdvance}
                  className="flex-1 bg-gradient-to-r from-primary-container to-inverse-primary text-white py-3 rounded-lg hover:brightness-110 transition-all font-semibold"
                >
                  Confirm Advance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .glow-purple {
          box-shadow: 0 0 20px rgba(153, 69, 255, 0.15);
        }
      `}</style>
    </div>
  );
}