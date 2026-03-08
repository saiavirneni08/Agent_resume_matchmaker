"use client";

import { useRef, useState } from "react";

import AppShell from "@/components/AppShell";

export default function ScanPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 w-full rounded-xl border border-[var(--accent)] px-4 py-3 text-lg font-medium text-[var(--text-main)] transition hover:bg-[var(--accent)]/12"
            >
              Upload Resume (PDF)
            </button>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {resumeFile ? `Selected: ${resumeFile.name}` : "No file selected"}
            </p>
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
              className="w-full rounded-xl border border-[var(--line)] bg-[#0f1230] p-4 text-base text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-4">
        <button
          type="button"
          className="rounded-xl border border-[var(--accent)] px-7 py-3 text-lg font-semibold text-[var(--text-main)] transition hover:bg-[var(--accent)]/12"
        >
          One Click Optimization
        </button>
        <button
          type="button"
          className="rounded-xl bg-[var(--accent)] px-8 py-3 text-lg font-semibold text-[#141414] transition hover:bg-[var(--accent-2)]"
        >
          Scan
        </button>
      </div>
    </AppShell>
  );
}
