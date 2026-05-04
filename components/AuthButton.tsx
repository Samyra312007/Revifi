"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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
        setUserProfile(profile);
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
    return (
      <div className="px-6 mt-6 flex items-center gap-3">
        <img
          alt="Creator Profile"
          className="w-8 h-8 rounded-full border border-purple-500/30"
          src={
            user.user_metadata?.avatar_url ||
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBniduSkFuNtTPhbh8s0f9NDOMNFQwuFPdYofe6JSM3N_yNnm5UYTUR78sTIrELHeevXppWRLtub3AOxfZWitYv9VdjLMvGF3MHdJHoLE2_-pzac27mX1hUUhGlR0oeAv-xgleMikb-lIkkyCJmVAuo9Hw-PltYlZSs3H2Vl-oBmxbYKvxTkfIMIrfydnstxjH6GwW62Op7voDex6eq7iFZTQi0NuYp6ImWiTQJwRJe1I4JjGkdCGSMx1lWjM5bZfvxE1F14TYqEZ0F"
          }
        />
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
