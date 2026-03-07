"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type MatchMeterProps = {
  score: number;
};

export default function MatchMeter({ score }: MatchMeterProps) {
  return (
    <div className="mx-auto h-44 w-44">
      <CircularProgressbar
        value={score}
        text={`${Math.round(score)}%`}
        styles={buildStyles({
          textColor: "#0f172a",
          pathColor: "#2563eb",
          trailColor: "#e2e8f0",
          textSize: "18px"
        })}
      />
    </div>
  );
}
