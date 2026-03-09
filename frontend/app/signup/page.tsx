"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SignupResponse = {
  token: string;
  user_id: string;
  email: string;
  full_name: string | null;
  expires_at: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Signup failed.");
      }

      const payload = (await response.json()) as SignupResponse;
      localStorage.setItem("authToken", payload.token);
      localStorage.setItem("authUser", JSON.stringify(payload));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[700px] items-center px-6 py-10">
      <section className="w-full rounded-2xl bg-[var(--bg-card)] p-7 shadow-soft md:p-9">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--text-muted)] hover:text-white"
        >
          Back to home
        </Link>

        <h1 className="mt-4 text-4xl font-semibold">Create your account</h1>
        <p className="mt-2 text-base text-[var(--text-muted)]">
          Sign up to save sessions and track resume scans.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[#0f1230] px-4 py-3 text-base text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[#0f1230] px-4 py-3 text-base text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[#0f1230] px-4 py-3 text-base text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </div>

          {error ? <p className="text-sm font-medium text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--accent)] px-5 py-3 text-base font-semibold text-[#141414] transition hover:bg-[var(--accent-2)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
      </section>
    </main>
  );
}
