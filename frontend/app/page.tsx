"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import Header from "@/components/Header";

export default function HomePage() {
  const router = useRouter();
  const [agentName, setAgentName] = useState("");

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const slug = (agentName.trim() || "default-agent").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    router.push(`/agent/${slug}`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[900px] items-center justify-center p-6">
      <section className="w-full rounded-2xl bg-white p-8 shadow-soft">
        <Header />
        <form onSubmit={handleCreate} className="mx-auto max-w-md space-y-4" aria-label="Create new agent">
          <label htmlFor="agent-name" className="block text-sm font-medium text-slate-700">
            Agent Name
          </label>
          <input
            id="agent-name"
            value={agentName}
            onChange={(event) => setAgentName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm"
            placeholder="e.g. backend-engineer-agent"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create Agent
          </button>
        </form>
      </section>
    </main>
  );
}
