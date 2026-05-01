"use client";

import { useState } from "react";
import Link from "next/link";

export default function WalletPage() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "crypto">(
    "bank",
  );

  const walletData = {
    totalBalance: 124592.8,
    solBalance: 842.12,
    solValue: 92633.2,
    usdcBalance: 31959.6,
    assetAllocation: {
      sol: 74.3,
      usdc: 25.7,
    },
    recentActivity: [
      {
        id: 1,
        type: "advance",
        title: "Instant Advance",
        description: "From YouTube Sponsorship",
        date: "Oct 24, 2023",
        status: "Settled",
        amount: 12000,
        transactionType: "credit",
        platform: "youtube",
      },
      {
        id: 2,
        type: "withdrawal",
        title: "Bank Withdrawal",
        description: "Chase Bank (****4829)",
        date: "Oct 23, 2023",
        status: "Processing",
        amount: 4500,
        transactionType: "debit",
        platform: "bank",
      },
      {
        id: 3,
        type: "reward",
        title: "Referral Reward",
        description: "Program Incentive",
        date: "Oct 21, 2023",
        status: "Settled",
        amount: 250,
        transactionType: "credit",
        platform: "revifi",
      },
      {
        id: 4,
        type: "swap",
        title: "Currency Swap",
        description: "USDC to SOL",
        date: "Oct 20, 2023",
        status: "Settled",
        amount: 1500,
        transactionType: "exchange",
        platform: "revifi",
      },
      {
        id: 5,
        type: "payment",
        title: "Sponsorship Payment",
        description: "From Nebula Tech",
        date: "Oct 18, 2023",
        status: "Settled",
        amount: 8500,
        transactionType: "credit",
        platform: "brand",
      },
    ],
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      Settled: "check_circle",
      Processing: "schedule",
      Pending: "hourglass_empty",
    };
    return icons[status] || "check_circle";
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, string> = {
      advance: "trending_up",
      withdrawal: "trending_down",
      reward: "card_giftcard",
      swap: "swap_horiz",
      payment: "payments",
    };
    return icons[type] || "receipt";
  };

  const getTransactionColor = (type: string) => {
    const colors: Record<string, string> = {
      advance: "text-secondary-container",
      withdrawal: "text-slate-400",
      reward: "text-primary",
      swap: "text-primary",
      payment: "text-secondary-container",
    };
    return colors[type] || "text-white";
  };

  const chartData = [40, 55, 45, 70, 60, 85, 75, 90, 65, 80, 95, 88];

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
            className="flex items-to-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">handshake</span>
            <span>Deals</span>
          </Link>
          <Link
            href="/creator/wallet"
            className="flex items-center gap-3 px-6 py-3 text-purple-400 bg-purple-500/5 border-r-2 border-purple-500 font-semibold"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
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
          <div className="px-6 mt-6 flex items-center gap-3">
            <img
              alt="Creator Profile"
              className="w-8 h-8 rounded-full border border-purple-500/30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBniduSkFuNtTPhbh8s0f9NDOMNFQwuFPdYofe6JSM3N_yNnm5UYTUR78sTIrELHeevXppWRLtub3AOxfZWitYv9VdjLMvGF3MHdJHoLE2_-pzac27mX1hUUhGlR0oeAv-xgleMikb-lIkkyCJmVAuo9Hw-PltYlZSs3H2Vl-oBmxbYKvxTkfIMIrfydnstxjH6GwW62Op7voDex6eq7iFZTQi0NuYp6ImWiTQJwRJe1I4JjGkdCGSMx1lWjM5bZfvxE1F14TYqEZ0F"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-on-surface truncate">
                Alex Rivera
              </p>
              <p className="text-[10px] text-slate-500 uppercase">
                Pro Creator
              </p>
            </div>
          </div>
        </div>
      </aside>

      <header className="h-16 ml-64 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 flex justify-between items-center px-8">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-500 text-sm">
              search
            </span>
            <input
              className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-purple-500/50 text-on-surface placeholder:text-slate-600"
              placeholder="Search transactions, creators..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="hover:bg-white/5 rounded-full p-2 transition-all text-slate-400 relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary-container rounded-full border-2 border-slate-950"></span>
            </button>
            <button className="hover:bg-white/5 rounded-full p-2 transition-all text-slate-400">
              <span className="material-symbols-outlined">history</span>
            </button>
          </div>
          <button className="bg-primary-container hover:bg-primary-container/90 text-on-primary-container px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20">
            <span className="material-symbols-outlined text-sm">bolt</span>
            Instant Advance
          </button>
        </div>
      </header>

      <main className="ml-64 p-8 max-w-[1440px] mx-auto">
        <section className="mb-8 relative overflow-hidden rounded-xl bg-surface-container-high p-12 border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <label className="text-slate-500 font-label-sm uppercase tracking-widest mb-2 block">
                Total Wallet Balance
              </label>
              <h2 className="text-display-xl font-display-xl text-white tracking-tighter">
                ${walletData.totalBalance.toLocaleString()}
              </h2>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-3 bg-surface-container/50 px-4 py-2 rounded-lg border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">
                      currency_bitcoin
                    </span>
                  </div>
                  <div>
                    <p className="text-data-mono font-data-mono text-white">
                      {walletData.solBalance} SOL
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-label-sm">
                      ≈ ${walletData.solValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-surface-container/50 px-4 py-2 rounded-lg border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">
                      attach_money
                    </span>
                  </div>
                  <div>
                    <p className="text-data-mono font-data-mono text-white">
                      {walletData.usdcBalance.toLocaleString()} USDC
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-label-sm">
                      STABLE
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowAddFundsModal(true)}
                className="flex-1 md:flex-none border border-primary text-primary px-8 py-3 rounded-xl font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Add Funds
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex-1 md:flex-none bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">outbound</span>
                Withdraw
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-xl h-full">
              <h3 className="text-headline-md font-headline-md text-white mb-6">
                Withdrawal Options
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setSelectedMethod("bank");
                    setShowWithdrawModal(true);
                  }}
                  className="w-full flex items-center justify-between p-5 rounded-xl bg-surface-container hover:bg-surface-container-highest transition-all group border border-white/5"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary-container group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">
                        account_balance
                      </span>
                    </div>
                    <div>
                      <p className="text-body-md font-bold text-white">
                        Instant Bank Transfer
                      </p>
                      <p className="text-xs text-slate-500">
                        2-5 minutes • 1% fee
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-600 group-hover:text-primary">
                    chevron_right
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedMethod("crypto");
                    setShowWithdrawModal(true);
                  }}
                  className="w-full flex items-center justify-between p-5 rounded-xl bg-surface-container hover:bg-surface-container-highest transition-all group border border-white/5"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">
                        currency_bitcoin
                      </span>
                    </div>
                    <div>
                      <p className="text-body-md font-bold text-white">
                        Crypto Payout
                      </p>
                      <p className="text-xs text-slate-500">
                        Instant • Network fees only
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-600 group-hover:text-primary">
                    chevron_right
                  </span>
                </button>
              </div>

              <div className="mt-8 p-4 rounded-lg bg-surface-container-low border border-dashed border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary-container text-sm">
                    security
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Security Note
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Withdrawals over $10,000 may require a 24-hour verification
                  period for your security. Revifi uses AES-256 bank-grade
                  encryption.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="glass-card p-8 rounded-xl h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-headline-md font-headline-md text-white">
                  Asset Allocation
                </h3>
                <div className="flex gap-2 bg-surface-container p-1 rounded-lg">
                  <button className="px-3 py-1 text-xs font-bold rounded bg-slate-800 text-white">
                    All
                  </button>
                  <button className="px-3 py-1 text-xs font-bold rounded text-slate-500 hover:text-slate-300">
                    1M
                  </button>
                  <button className="px-3 py-1 text-xs font-bold rounded text-slate-500 hover:text-slate-300">
                    1W
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase">
                        Solana (SOL)
                      </span>
                      <span className="text-white">
                        {walletData.assetAllocation.sol}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_8px_rgba(153,69,255,0.4)]"
                        style={{ width: `${walletData.assetAllocation.sol}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase">
                        USDC Stablecoin
                      </span>
                      <span className="text-white">
                        {walletData.assetAllocation.usdc}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary-container shadow-[0_0_8px_rgba(0,236,145,0.4)]"
                        style={{ width: `${walletData.assetAllocation.usdc}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="relative h-40 bg-surface-container-lowest rounded-xl border border-white/5 flex items-end px-4 py-2 gap-2 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent"></div>
                  {chartData.map((height, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t-sm transition-all duration-300 hover:opacity-100 ${
                        index === chartData.length - 1
                          ? "bg-primary/40 border-t-2 border-primary shadow-[0_0_15px_rgba(153,69,255,0.2)]"
                          : "bg-primary/20"
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="glass-card rounded-xl overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-headline-md font-headline-md text-white">
              Recent Activity
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">
              Download CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 font-label-sm uppercase tracking-widest text-[10px]">
                  <th className="px-8 py-4">Transaction</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Type</th>
                  <th className="px-8 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {walletData.recentActivity.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${getTransactionColor(activity.type)}`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {getTransactionIcon(activity.type)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {activity.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-sm ${
                            activity.status === "Settled"
                              ? "text-secondary"
                              : activity.status === "Processing"
                                ? "text-yellow-500"
                                : "text-slate-500"
                          }`}
                        >
                          {getStatusIcon(activity.status)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {activity.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-400">
                      {activity.date}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          activity.transactionType === "credit"
                            ? "bg-secondary/10 text-secondary"
                            : activity.transactionType === "debit"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        {activity.transactionType}
                      </span>
                    </td>
                    <td
                      className={`px-8 py-5 text-right font-data-mono text-sm ${
                        activity.transactionType === "credit"
                          ? "text-secondary"
                          : activity.transactionType === "debit"
                            ? "text-red-400"
                            : "text-white"
                      }`}
                    >
                      {activity.transactionType === "credit"
                        ? "+"
                        : activity.transactionType === "debit"
                          ? "-"
                          : "≈"}
                      ${Math.abs(activity.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-surface-container/30 text-center">
            <button className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
              View All Transaction History
            </button>
          </div>
        </section>
      </main>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-primary-container/10 rounded-xl p-4 border border-primary-container/20">
                <p className="text-sm text-slate-400 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-white">
                  ${walletData.totalBalance.toLocaleString()}
                </p>
                <div className="flex gap-3 mt-2">
                  <p className="text-xs text-slate-500">
                    {walletData.solBalance} SOL
                  </p>
                  <p className="text-xs text-slate-500">
                    {walletData.usdcBalance.toLocaleString()} USDC
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Withdrawal Method
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedMethod("bank")}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      selectedMethod === "bank"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/10 text-slate-400 hover:border-primary/50"
                    }`}
                  >
                    <span className="material-symbols-outlined block mx-auto mb-1">
                      account_balance
                    </span>
                    <span className="text-xs">Bank Transfer</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod("crypto")}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      selectedMethod === "crypto"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/10 text-slate-400 hover:border-primary/50"
                    }`}
                  >
                    <span className="material-symbols-outlined block mx-auto mb-1">
                      currency_bitcoin
                    </span>
                    <span className="text-xs">Crypto</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Min: $10 • Max: ${walletData.totalBalance.toLocaleString()}
                </p>
              </div>

              {selectedMethod === "bank" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bank Account
                  </label>
                  <select className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>Chase Bank (****4829)</option>
                    <option>Bank of America (****1234)</option>
                    <option>Add new bank account</option>
                  </select>
                </div>
              )}

              {selectedMethod === "crypto" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Asset
                  </label>
                  <div className="flex gap-3">
                    <button className="flex-1 p-3 rounded-lg border border-primary bg-primary/10 text-primary">
                      <span className="material-symbols-outlined block mx-auto mb-1">
                        currency_bitcoin
                      </span>
                      <span className="text-xs">SOL</span>
                    </button>
                    <button className="flex-1 p-3 rounded-lg border border-white/10 text-slate-400 hover:border-primary/50">
                      <span className="material-symbols-outlined block mx-auto mb-1">
                        attach_money
                      </span>
                      <span className="text-xs">USDC</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Wallet address"
                    className="w-full mt-3 bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 border border-white/10 text-white py-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    alert("Withdrawal request submitted successfully!");
                  }}
                  className="flex-1 bg-gradient-to-r from-primary-container to-inverse-primary text-white py-3 rounded-lg hover:brightness-110 transition-all font-semibold"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Funds</h2>
              <button
                onClick={() => setShowAddFundsModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Asset
                </label>
                <div className="flex gap-3">
                  <button className="flex-1 p-3 rounded-lg border border-primary bg-primary/10 text-primary">
                    <span className="material-symbols-outlined block mx-auto mb-1">
                      currency_bitcoin
                    </span>
                    <span className="text-xs">SOL</span>
                  </button>
                  <button className="flex-1 p-3 rounded-lg border border-white/10 text-slate-400 hover:border-primary/50">
                    <span className="material-symbols-outlined block mx-auto mb-1">
                      attach_money
                    </span>
                    <span className="text-xs">USDC</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="bg-secondary-container/10 rounded-xl p-4 border border-secondary-container/20">
                <p className="text-sm text-slate-400 mb-1">Network</p>
                <p className="text-white font-semibold">Solana (SOL) Network</p>
                <p className="text-xs text-slate-500 mt-2">Deposit address:</p>
                <p className="text-xs font-mono text-primary break-all mt-1">
                  9njVeTjPJrBRQCnDPejVViijMq6pNMDVjoRaqBZRvwYP
                </p>
                <button className="mt-2 text-xs text-primary hover:underline">
                  Copy Address
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddFundsModal(false)}
                  className="flex-1 border border-white/10 text-white py-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddFundsModal(false);
                    alert("Deposit instructions sent to your email!");
                  }}
                  className="flex-1 bg-gradient-to-r from-primary-container to-inverse-primary text-white py-3 rounded-lg hover:brightness-110 transition-all font-semibold"
                >
                  Get Deposit Address
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
      `}</style>
    </div>
  );
}
