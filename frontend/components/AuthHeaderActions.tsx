"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type StoredAuthUser = {
  full_name?: string | null;
  email?: string | null;
};

type AuthHeaderActionsProps = {
  compact?: boolean;
};

function getInitial(user: StoredAuthUser | null): string {
  if (!user) {
    return "U";
  }

  const firstName = user.full_name?.trim().split(/\s+/)[0];
  if (firstName && firstName.length > 0) {
    return firstName[0].toUpperCase();
  }

  if (user.email && user.email.length > 0) {
    return user.email[0].toUpperCase();
  }

  return "U";
}

function getDisplayName(user: StoredAuthUser | null): string {
  if (!user) {
    return "User";
  }
  if (user.full_name && user.full_name.trim().length > 0) {
    return user.full_name.trim();
  }
  return user.email || "User";
}

export default function AuthHeaderActions({ compact = false }: AuthHeaderActionsProps) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const [user, setUser] = useState<StoredAuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("authUser");
      const token = localStorage.getItem("authToken");
      if (token && rawUser) {
        setUser(JSON.parse(rawUser) as StoredAuthUser);
      }
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  const initial = useMemo(() => getInitial(user), [user]);
  const displayName = useMemo(() => getDisplayName(user), [user]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Ignore network/logout API failures; local logout still applies.
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      setUser(null);
      setMenuOpen(false);
    }
  };

  if (!ready) {
    return <div className="h-12 w-12 rounded-full bg-[var(--line)]/40" />;
  }

  if (user) {
    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--accent)]/85 text-lg font-semibold text-[#0e1530]"
          aria-label="Open profile menu"
          title="Profile"
        >
          {initial}
        </button>

        {menuOpen ? (
          <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-[var(--line)] bg-[var(--bg-card)] p-3 shadow-lg">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            {user.email ? (
              <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{user.email}</p>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-white"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[#141414] transition hover:bg-[var(--accent-2)]"
        >
          Signup
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Link
        href="/login"
        className="rounded-xl border border-[var(--line)] px-6 py-2.5 font-semibold text-white"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="rounded-xl bg-[var(--accent)] px-6 py-2.5 font-semibold text-[#141414] transition hover:bg-[var(--accent-2)]"
      >
        Signup
      </Link>
    </div>
  );
}
