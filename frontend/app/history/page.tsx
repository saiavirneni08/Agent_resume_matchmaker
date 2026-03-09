"use client";

import { useEffect, useState } from "react";

import AppShell from "@/components/AppShell";

type HistoryItem = {
  session_id: string;
  uploaded_file_id: string;
  original_filename: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  created_at: string;
};

type HistoryResponse = {
  items: HistoryItem[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Login required to view your history.");
          setItems([]);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.detail || "Failed to load history.");
        }

        const payload = (await response.json()) as HistoryResponse;
        setItems(payload.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <AppShell
      title="History"
      subtitle="Saved sessions from your signed-in resume scans."
    >
      {loading ? (
        <div className="rounded-2xl bg-[var(--bg-card)] p-6 text-[var(--text-muted)]">
          Loading history...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl bg-[var(--bg-card)] p-6 text-rose-300">
          {error}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="rounded-2xl bg-[var(--bg-card)] p-6 text-[var(--text-muted)]">
          No sessions yet. Run a scan while signed in and it will appear here.
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.session_id}
              className="rounded-2xl bg-[var(--bg-card)] p-5"
            >
              <p className="truncate text-base font-semibold">
                {item.original_filename}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Score: {Math.round(item.match_score)}%
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {new Date(item.created_at).toLocaleString()}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Missing Skills
              </p>
              <p className="mt-2 text-sm text-white/90">
                {item.missing_skills.length > 0
                  ? item.missing_skills.slice(0, 6).join(", ")
                  : "None"}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
