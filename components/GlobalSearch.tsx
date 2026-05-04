"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

interface Props {
  placeholder?: string;
}

export default function GlobalSearch({
  placeholder = "Search transactions, deals, brands...",
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
        );
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

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

  function iconFor(type: string) {
    switch (type) {
      case "deal":
        return "handshake";
      case "transaction":
        return "payments";
      case "brand":
        return "business";
      case "notification":
        return "notifications";
      default:
        return "search";
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors text-sm">
        search
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-white/5 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-purple-500/50 text-slate-200 placeholder-slate-500 transition-all"
      />

      {open && query.trim() && (
        <div className="absolute left-0 right-0 mt-2 w-full max-h-[480px] overflow-y-auto rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl z-50">
          {loading ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No matches for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {results.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <Link
                    href={r.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/5 text-slate-300 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-base">
                        {iconFor(r.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {r.title}
                      </p>
                      {r.subtitle && (
                        <p className="text-xs text-slate-400 truncate">
                          {r.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">
                      {r.type}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
