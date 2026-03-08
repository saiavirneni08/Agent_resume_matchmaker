import Link from "next/link";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

const sideLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Resume Matcher", href: "/scan" },
  { label: "Shared With You", href: "#" },
  { label: "Archived Projects", href: "#" },
  { label: "Trashed Projects", href: "#" },
];

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-[240px_1fr]">
        <aside className="glass rounded-2xl p-5">
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

          <p className="mt-14 text-sm text-[var(--text-muted)]">Help</p>
        </aside>

        <section className="glass rounded-2xl p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div>
              <h1 className="text-3xl font-semibold">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <div className="h-12 w-12 rounded-full bg-[var(--accent)]/85" />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
