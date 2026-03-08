import Link from "next/link";

import AppShell from "@/components/AppShell";

const cards = [
  {
    title: "Resume Matcher",
    description:
      "Compare your resume with a job description and identify missing skills and optimization opportunities.",
    cta: "Start Now",
    href: "/scan",
  },
  {
    title: "Cover Letter AI",
    description: "Generate tailored letters from resume + JD context.",
  },
  {
    title: "LinkedIn Rewrite",
    description: "Rewrite profile summary and experience for role fit.",
  },
  {
    title: "Keyword Booster",
    description: "Inject role-specific terms while preserving readability.",
  },
  {
    title: "Interview Storybank",
    description: "Turn projects into structured STAR interview responses.",
  },
  {
    title: "ATS Preview",
    description: "Preview ATS match behavior before submission.",
  },
];

export default function DashboardPage() {
  return (
    <AppShell
      title="Welcome Agent Resume!"
      subtitle="Pick a tool and start your next application sprint."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl bg-[var(--bg-card)] p-6"
          >
            <h2 className="text-2xl font-semibold">{card.title}</h2>
            <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">
              {card.description}
            </p>
            {card.href ? (
              <Link
                href={card.href}
                className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 font-semibold text-[#141414] transition hover:bg-[var(--accent-2)]"
              >
                {card.cta}
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </AppShell>
  );
}
