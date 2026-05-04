"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface UserProfileRow {
  user_type?: string | null;
}

function initialsFor(user: User | null): string {
  if (!user) return "?";
  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "";
  if (!name) return "?";
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileRow | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setUserProfile((profile as UserProfileRow) ?? null);
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

    return (
      <div className="px-6 mt-6 flex items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={user.user_metadata?.full_name || "Profile"}
            className="w-8 h-8 rounded-full border border-purple-500/30 object-cover"
            src={avatarUrl}
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-purple-500/30 bg-purple-500/20 text-purple-200 flex items-center justify-center text-xs font-bold">
            {initialsFor(user)}
          </div>
        )}
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-on-surface truncate">
            {user.user_metadata?.full_name || user.email?.split("@")[0]}
          </p>
          <p className="text-[10px] text-slate-500 uppercase">
            {userProfile?.user_type || "Creator"}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 mt-6">
      <button
        onClick={handleSignIn}
        className="w-full bg-primary-container text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all text-sm"
      >
        Sign In with Google
      </button>
    </div>
  );
}
