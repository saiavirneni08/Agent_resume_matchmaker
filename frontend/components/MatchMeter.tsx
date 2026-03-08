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
          textColor: "#f4f6ff",
          pathColor: "#ff6b4a",
          trailColor: "#2c3350",
          textSize: "18px",
        })}
      />
    </div>
  );
}
