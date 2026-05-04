"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import NotificationBell from "@/components/NotificationBell";
import PhantomConnect from "@/components/PhantomConnect";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [solanaWallet, setSolanaWallet] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }
    setUser(user);

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profile);
    setSolanaWallet(profile?.solana_wallet || "");
    if (profile?.metadata?.email_notifications !== undefined) {
      setEmailNotifications(Boolean(profile.metadata.email_notifications));
    }
    if (profile?.metadata?.push_notifications !== undefined) {
      setPushNotifications(Boolean(profile.metadata.push_notifications));
    }
    setLoading(false);
  }

  async function updateProfile() {
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        solana_wallet: solanaWallet || null,
        metadata: {
          ...(profile?.metadata || {}),
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
        },
      })
      .eq("id", user.id);

    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
      fetchProfile();
    }
    setSaving(false);
  }

  async function deleteAccount() {
    if (
      confirm(
        "Are you sure? This action cannot be undone. To proceed, our support team will reach out to verify your identity.",
      )
    ) {
      alert("Account deletion request received. Support will contact you within 48 hours.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading settings...</p>
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
            className="flex items-center gap-3 px-6 py-3 text-purple-400 bg-purple-500/5 border-r-2 border-purple-500 font-semibold"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              settings
            </span>
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

      <header className="h-16 ml-64 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 flex justify-between items-center px-8">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button
            onClick={updateProfile}
            disabled={saving}
            className="bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      <main className="ml-64 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-card rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              Profile Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.user_metadata?.full_name || ""}
                  disabled
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Solana Wallet Address
                </label>
                <input
                  type="text"
                  value={solanaWallet}
                  onChange={(e) => setSolanaWallet(e.target.value)}
                  placeholder="Enter your Solana wallet address"
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-slate-500 mt-1">
                  This is where your advances will be sent
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <PhantomConnect
                    initialAddress={solanaWallet || null}
                    onChange={(addr) => {
                      setSolanaWallet(addr || "");
                      fetchProfile();
                    }}
                  />
                  <p className="text-xs text-slate-500">
                    Or connect Phantom to fill this automatically
                  </p>
                </div>
              </div>

              <button
                onClick={updateProfile}
                disabled={saving}
                className="w-full bg-primary-container text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-xs text-slate-500">
                    Receive payment and advance updates
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? "bg-primary-container" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  ></span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-xs text-slate-500">
                    Get real-time alerts
                  </p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pushNotifications ? "bg-primary-container" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  ></span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-8 border border-red-500/20">
            <h2 className="text-xl font-bold text-red-400 mb-6">Danger Zone</h2>

            <div className="space-y-4">
              <button
                onClick={deleteAccount}
                className="w-full border border-red-500 text-red-400 py-3 rounded-lg font-semibold hover:bg-red-500/10 transition-all"
              >
                Delete Account
              </button>
            </div>
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
