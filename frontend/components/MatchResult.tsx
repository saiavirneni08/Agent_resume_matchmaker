import Accordion from "./Accordion";
import MatchMeter from "./MatchMeter";
import SkillBadge from "./SkillBadge";

export type MatchResponse = {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  supporting_points: Record<string, string[]>;
  placement_suggestions: Record<string, string[]>;
};

type MatchResultProps = {
  result: MatchResponse;
};

export default function MatchResult({ result }: MatchResultProps) {
  return (
    <section className="rounded-2xl bg-[var(--bg-card)] p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-[var(--text-main)]">
        Results Snapshot
      </h2>

      <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <div>
          <MatchMeter score={result.match_score} />
          <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
            Overall match score
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.matched_skills.length > 0 ? (
                result.matched_skills.map((skill) => (
                  <SkillBadge key={skill} skill={skill} type="matched" />
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  No matched skills found.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.length > 0 ? (
                result.missing_skills.map((skill) => (
                  <SkillBadge key={skill} skill={skill} type="missing" />
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  No missing skills identified.
                </p>
              )}
            </div>
          </div>

          {result.missing_skills.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Supporting Points
              </h3>
              <div className="space-y-3">
                {result.missing_skills.map((skill) => (
                  <Accordion
                    key={skill}
                    skill={skill}
                    bullets={result.supporting_points[skill] ?? []}
                    placements={result.placement_suggestions?.[skill] ?? []}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
