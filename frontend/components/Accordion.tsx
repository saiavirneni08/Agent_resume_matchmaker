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
    <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer select-none text-sm font-semibold text-slate-800">
        {skill}
      </summary>
      <div className="mt-3 space-y-3">
        <ul className="space-y-2 text-sm text-slate-700">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        {placements.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Where To Add
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              {placements.map((placement) => (
                <li key={placement}>- {placement}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="button"
          onClick={copyAll}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Copy All
        </button>
      </div>
    </details>
  );
}
