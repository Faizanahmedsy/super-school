import HorizontalTimeline from "./HorizontalTimeline";

type Milestone = {
  title: string;
  date: string;
  status: "completed" | "active" | "upcoming";
};

const timelineData: Milestone[] = [
  { title: "Start Project", date: "2025-01-01", status: "completed" },
  { title: "Milestone 1", date: "2025-02-01", status: "completed" },
  { title: "Milestone 2", date: "2025-03-01", status: "active" },
  { title: "Final Submission", date: "2025-04-01", status: "upcoming" },
];

export default function MilestonePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Writing Milestone Tracker</h1>
      <HorizontalTimeline timeline={timelineData} />
    </div>
  );
}
