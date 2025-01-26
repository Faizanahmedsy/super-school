import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function MilestoneTracker() {
  const milestones = [
    { chapter: "Chapter 1", targetDate: "2025-01-30", progress: 75 },
    { chapter: "Chapter 2", targetDate: "2025-02-15", progress: 40 },
    { chapter: "Chapter 3", targetDate: "2025-03-10", progress: 0 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {milestones.map((milestone, index) => (
        <Card key={index} className="p-4 shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold">{milestone.chapter}</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Target Date: {milestone.targetDate}
            </p>
            <Progress value={milestone.progress} className="mt-2" />
            <p className="text-sm mt-1">
              Progress:{" "}
              <span className="font-medium">{milestone.progress}%</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
