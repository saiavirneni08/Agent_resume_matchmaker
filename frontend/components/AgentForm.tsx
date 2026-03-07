"use client";

import { useState } from "react";

import MatchButton from "./MatchButton";
import MatchResult, { MatchResponse } from "./MatchResult";

type AgentFormProps = {
  agentId: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function AgentForm({ agentId }: AgentFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    console.log("Analyze clicked for agent", agentId);

    if (!resumeFile) {
      setError("No resume uploaded.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Paste job description.");
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
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Failed to analyze resume.");
      }

      const payload: MatchResponse = await response.json();
      console.log("Analyze response", payload);
      setResult(payload);
    } catch (err) {
      console.error("Analyze request failed", err);
      setError(err instanceof Error ? err.message : "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-900">Agent: {agentId}</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="resume-upload">
            Upload Resume (PDF)
          </label>
          <input
            id="resume-upload"
            type="file"
            accept="application/pdf"
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
            onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="job-description">
            Job Description
          </label>
          <textarea
            id="job-description"
            rows={6}
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Paste the job description here..."
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>}

      <MatchButton loading={loading} onClick={handleAnalyze} />

      {result && <MatchResult result={result} />}
    </section>
  );
}
