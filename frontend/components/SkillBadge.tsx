type SkillBadgeProps = {
  skill: string;
  type: "matched" | "missing";
};

export default function SkillBadge({ skill, type }: SkillBadgeProps) {
  const classes =
    type === "matched"
      ? "bg-[#1f3a38] text-[#8ff0d6] border-[#2f6a61]"
      : "bg-[#472338] text-[#ffb4cc] border-[#7b3a5e]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${classes}`}
    >
      {skill}
    </span>
  );
}
