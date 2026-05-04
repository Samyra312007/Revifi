"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  metadata?: any;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await fetchNotifications(user.id);

      channel = supabase
        .channel(`notifications_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchNotifications(user.id),
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function fetchNotifications(uid: string) {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  }

  async function markAllRead() {
    if (!userId) return;
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    fetchNotifications(userId);
  }

  async function markOneRead(id: string) {
    if (!userId) return;
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    fetchNotifications(userId);
  }

  function iconFor(type: string) {
    if (type === "payment") return "payments";
    if (type === "advance") return "bolt";
    if (type === "deal") return "handshake";
    if (type === "system") return "info";
    return "notifications";
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="hover:bg-white/5 rounded-full p-2 transition-all text-slate-400 relative"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold flex items-center justify-center rounded-full bg-purple-500 text-white border-2 border-slate-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-[480px] overflow-y-auto rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-purple-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-4 flex gap-3 cursor-pointer hover:bg-white/5 ${
                    n.read ? "opacity-60" : ""
                  }`}
                  onClick={() => !n.read && markOneRead(n.id)}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.type === "advance"
                        ? "bg-secondary/10 text-secondary"
                        : n.type === "payment"
                          ? "bg-primary/10 text-primary"
                          : "bg-white/5 text-slate-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {iconFor(n.type)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white truncate">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
