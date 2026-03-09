import Link from "next/link";

import AuthHeaderActions from "@/components/AuthHeaderActions";

const brands = ["Apple", "Amazon", "Meta", "Uber", "Bank of America"];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1320px] px-6 pb-10 pt-8 md:px-8">
      <header className="fade-up flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="inline-grid h-12 w-12 place-items-center rounded-xl border border-[#ff6b4a88] text-xl">
            ✶
          </span>
          <div>
            <p className="text-2xl font-semibold leading-tight">Resume</p>
            <p className="text-2xl font-semibold leading-tight">
              Craft <span className="text-[var(--accent)]">AI</span>
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-10 text-lg text-[var(--text-muted)] md:flex">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Our Products</Link>
          <Link href="/scan">Cover Letter</Link>
          <Link href="/scan">LinkedIn</Link>
        </nav>

        <AuthHeaderActions />
      </header>

      <section className="fade-up-delayed mt-24 max-w-[720px]">
        <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
          Optimize your resume
          <br />
          to land more interviews
        </h1>
        <p className="mt-8 text-2xl text-[var(--text-muted)]">
          ResumeCraft AI analyzes job descriptions and helps you craft a resume
          that highlights the skills, experience, and keywords recruiters are
          looking for.
        </p>
        <Link
          href="/dashboard"
          className="mt-10 inline-flex rounded-xl bg-[var(--accent)] px-8 py-4 text-xl font-semibold text-[#141414] transition hover:bg-[var(--accent-2)]"
        >
          Explore Tools
        </Link>
      </section>

      <section className="mt-28 text-center">
        <p className="text-lg text-[var(--text-muted)]">
          ResumeCraft AI users have landed interviews at top companies
          including:
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-8 text-5xl font-semibold">
          {brands.map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
