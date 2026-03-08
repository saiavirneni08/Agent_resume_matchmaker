type SkillBadgeProps = {
  skill: string;
  type: "matched" | "missing";
};

export default function SkillBadge({ skill, type }: SkillBadgeProps) {
  const classes =
    type === "matched"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${classes}`}
    >
      {skill}
    </span>
  );
}
