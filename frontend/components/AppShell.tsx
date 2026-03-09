"use client";

import Link from "next/link";

import AuthHeaderActions from "./AuthHeaderActions";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

const sideLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "History", href: "/history" },
  { label: "Shared With You", href: "#" },
  { label: "Archived Projects", href: "#" },
  { label: "Trashed Projects", href: "#" },
];

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid w-full max-w-[1600px] gap-4 md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="glass flex min-h-[calc(100vh-3rem)] flex-col rounded-2xl p-5 md:min-h-[calc(100vh-4rem)]">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-grid h-11 w-11 place-items-center rounded-xl border border-[#ff6b4a66] text-xl">
              ✶
            </span>
            <div>
              <p className="text-lg font-semibold">Resume Craft</p>
              <p className="text-sm text-[var(--text-muted)]">AI</p>
            </div>
          </Link>

          <nav className="mt-8 space-y-2">
            {sideLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`block rounded-xl px-3 py-2 text-sm ${
                  link.href === "/dashboard" || link.href === "/scan"
                    ? "hover:bg-[#ff6b4a1a] hover:text-white"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="mt-auto pt-8 text-sm text-[var(--text-muted)]">Help</p>
        </aside>

        <section className="glass min-h-[calc(100vh-3rem)] rounded-2xl p-6 md:min-h-[calc(100vh-4rem)] md:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div>
              <h1 className="text-3xl font-semibold">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <AuthHeaderActions compact />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
