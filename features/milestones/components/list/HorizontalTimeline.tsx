import React from "react";
import { cn } from "@/lib/utils"; // Optional utility for conditional classnames

type Milestone = {
  title: string;
  date: string;
  status: "completed" | "active" | "upcoming"; // Status of each milestone
};

type TimelineProps = {
  timeline: Milestone[];
};

export const HorizontalTimeline: React.FC<TimelineProps> = ({ timeline }) => {
  return (
    <div className="w-full overflow-x-auto py-6">
      <div className="flex items-center gap-8">
        {timeline.map((milestone, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center min-w-[120px]"
          >
            {/* Connector Line */}
            {index > 0 && (
              <div
                className={cn(
                  "absolute top-8 left-[-50%] h-[2px] w-full",
                  milestone.status === "completed"
                    ? "bg-green-500"
                    : "bg-gray-300"
                )}
              />
            )}

            {/* Milestone Circle */}
            <div
              className={cn(
                "flex items-center justify-center h-12 w-12 rounded-full border-2 text-sm font-semibold",
                milestone.status === "completed"
                  ? "border-green-500 bg-green-500 text-white"
                  : milestone.status === "active"
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 bg-white text-gray-500"
              )}
            >
              {index + 1}
            </div>

            {/* Tooltip Title */}
            <div className="mt-2 text-sm text-center">
              <span
                className={cn(
                  "font-medium",
                  milestone.status === "completed"
                    ? "text-green-500"
                    : milestone.status === "active"
                    ? "text-blue-500"
                    : "text-gray-500"
                )}
              >
                {milestone.title}
              </span>
            </div>

            {/* Date */}
            <div className="text-xs text-gray-400">{milestone.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalTimeline;
