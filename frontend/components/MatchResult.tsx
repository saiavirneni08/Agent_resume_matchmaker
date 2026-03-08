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
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold text-slate-900">Results</h2>

      <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <div>
          <MatchMeter score={result.match_score} />
          <p className="mt-3 text-center text-sm text-slate-600">
            Overall match score
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.matched_skills.length > 0 ? (
                result.matched_skills.map((skill) => (
                  <SkillBadge key={skill} skill={skill} type="matched" />
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No matched skills found.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.length > 0 ? (
                result.missing_skills.map((skill) => (
                  <SkillBadge key={skill} skill={skill} type="missing" />
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No missing skills identified.
                </p>
              )}
            </div>
          </div>

          {result.missing_skills.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
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
