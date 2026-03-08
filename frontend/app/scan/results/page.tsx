"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import MatchResult, { MatchResponse } from "@/components/MatchResult";
import {
  getScanInput,
  getScanResult,
  setScanInput,
  setScanResult,
} from "@/lib/scanSession";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ScanResultsPage() {
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const inMemory = getScanResult();
    if (inMemory) {
      setResult(inMemory);
      return;
    }

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

  const runSuggest = async () => {
    if (!result || result.missing_skills.length === 0) {
      setError("No missing skills found for generating suggestions.");
      return;
    }

    const { resumeFile, jobDescription } = getScanInput();
    if (!resumeFile || !jobDescription) {
      setError(
        "Scan context missing. Please go back, upload resume, and scan again.",
      );
      return;
    }

    setLoadingSuggest(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_description", jobDescription);
      formData.append("missing_skills", JSON.stringify(result.missing_skills));

      const response = await fetch(`${API_BASE_URL}/suggest`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Failed to generate suggestions.");
      }

      const payload = (await response.json()) as MatchResponse;
      setResult(payload);
      setScanInput(resumeFile, jobDescription);
      setScanResult(payload);
      sessionStorage.setItem("latestScanResult", JSON.stringify(payload));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error while generating suggestions.",
      );
    } finally {
      setLoadingSuggest(false);
    }
  };

  return (
    <AppShell
      title="Scan Results"
      subtitle="Match score, matched skills, and missing skills from your latest scan."
    >
      {result ? (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={runSuggest}
              disabled={loadingSuggest}
              className="rounded-xl border border-[var(--accent)] px-6 py-2.5 text-base font-semibold text-[var(--text-main)] transition hover:bg-[var(--accent)]/12"
            >
              {loadingSuggest ? "Generating Suggestions..." : "Suggested"}
            </button>
          </div>
          {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
          <MatchResult result={result} />
        </>
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
