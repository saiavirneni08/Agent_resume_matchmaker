"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import MatchResult, { MatchResponse } from "@/components/MatchResult";

export default function ScanResultsPage() {
  const [result, setResult] = useState<MatchResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("latestScanResult");
    if (!raw) {
      setResult(null);
      return;
    }

    try {
      setResult(JSON.parse(raw) as MatchResponse);
    } catch {
      setResult(null);
    }
  }, []);

  return (
    <AppShell
      title="Scan Results"
      subtitle="Match score, matched skills, and missing skills from your latest scan."
    >
      {result ? (
        <MatchResult result={result} />
      ) : (
        <div className="rounded-2xl bg-[var(--bg-card)] p-6">
          <p className="text-lg text-[var(--text-muted)]">
            No scan result found. Run a scan first to view the meter and missing
            skills.
          </p>
          <Link
            href="/scan"
            className="mt-4 inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 font-semibold text-[#141414]"
          >
            Go To Scan
          </Link>
        </div>
      )}
    </AppShell>
  );
}
