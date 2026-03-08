"use client";

type AccordionProps = {
  skill: string;
  bullets: string[];
  placements?: string[];
};

export default function Accordion({
  skill,
  bullets,
  placements = [],
}: AccordionProps) {
  const copyAll = async () => {
    const placementText =
      placements.length > 0
        ? `\n\nWhere to add:\n${placements.map((item) => `- ${item}`).join("\n")}`
        : "";
    const plainText = `${bullets.join("\n")}${placementText}`;
    await navigator.clipboard.writeText(plainText);
  };

  return (
    <details className="rounded-xl border border-[var(--line)] bg-[#12173a] p-4">
      <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--text-main)]">
        {skill}
      </summary>
      <div className="mt-3 space-y-3">
        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        {placements.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Where To Add
            </p>
            <ul className="space-y-1 text-sm text-[var(--text-muted)]">
              {placements.map((placement) => (
                <li key={placement}>- {placement}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="button"
          onClick={copyAll}
          className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--text-main)] transition hover:bg-[#1e244f]"
        >
          Copy All
        </button>
      </div>
    </details>
  );
}
