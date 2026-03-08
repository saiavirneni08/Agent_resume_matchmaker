"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import AppShell from "@/components/AppShell";
import { MatchResponse } from "@/components/MatchResult";
import { setScanInput, setScanResult } from "@/lib/scanSession";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ScanPage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!resumeFile) {
      setResumePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(resumeFile);
    setResumePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [resumeFile]);

  const runAnalyze = async () => {
    if (!resumeFile) {
      setError("Please upload your resume PDF before scanning.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste a job description before scanning.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_description", jobDescription);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Failed to analyze resume.");
      }

      const payload = (await response.json()) as MatchResponse;
      setScanInput(resumeFile, jobDescription);
      setScanResult(payload);
      sessionStorage.setItem("latestScanResult", JSON.stringify(payload));
      router.push("/scan/results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error while scanning.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="New Scan"
      subtitle="Upload your resume and paste job description to start matching."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-[var(--bg-card)]">
          <header className="border-b border-[var(--line)] px-6 py-5 text-2xl font-semibold">
            Step 1: Upload a Resume
          </header>
          <div className="px-6 py-5">
            <textarea
              rows={15}
              placeholder="Copy & Paste your resume here"
              className="w-full rounded-xl border border-[var(--line)] bg-[#0f1230] p-4 text-base text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) =>
                setResumeFile(event.target.files?.[0] ?? null)
              }
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 w-full rounded-xl border border-[var(--accent)] px-4 py-3 text-lg font-medium text-[var(--text-main)] transition hover:bg-[var(--accent)]/12"
            >
              Upload Resume (PDF)
            </button>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <p className="text-[var(--text-muted)]">
                {resumeFile
                  ? `Selected: ${resumeFile.name}`
                  : "No file selected"}
              </p>
              {resumePreviewUrl ? (
                <a
                  href={resumePreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-2)]"
                >
                  Preview Resume
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[var(--bg-card)]">
          <header className="border-b border-[var(--line)] px-6 py-5 text-2xl font-semibold">
            Step 2: Paste a Job Description
          </header>
          <div className="px-6 py-5">
            <textarea
              rows={20}
              placeholder="Copy & Paste your Job Description here."
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[#0f1230] p-4 text-base text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </section>
      </div>

      {error ? <p className="mt-4 text-base text-rose-300">{error}</p> : null}

      <div className="mt-6 flex flex-wrap justify-end gap-4">
        <button
          type="button"
          onClick={runAnalyze}
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-8 py-3 text-lg font-semibold text-[#141414] transition hover:bg-[var(--accent-2)]"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>
    </AppShell>
  );
}
