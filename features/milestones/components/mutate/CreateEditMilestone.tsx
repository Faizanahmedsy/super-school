"use client";
import { useState } from "react";
import dayjs from "dayjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Milestone {
  title: string;
  date: Date | undefined;
}

function CreateEditMilestone() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "", date: undefined },
  ]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: "", date: undefined }]);
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof Milestone,
    value: string | Date | undefined
  ) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index][field] = value as string & Date & undefined;
    setMilestones(updatedMilestones);
  };

  const handleSaveMilestones = () => {
    console.log("Saved Milestones:", milestones);
    // Send `milestones` to your backend here
  };

  return (
    <Card className="max-w-3xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>
          <div className="text-2xl font-bold mb-6 text-gray-800">
            Set Milestones
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.map((milestone, index) => (
          <div key={index} className="mb-4 flex space-x-4">
            <Input
              placeholder="Milestone Title"
              className="flex-grow text-base py-2.5"
              value={milestone.title}
              onChange={(e) =>
                handleMilestoneChange(index, "title", e.target.value)
              }
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !milestone.date && "text-muted-foreground",
                    "text-base py-2.5"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {milestone.date ? (
                    dayjs(milestone.date).format("MMM D, YYYY")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={milestone.date}
                  onSelect={(date) =>
                    handleMilestoneChange(index, "date", date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        ))}

        <div className="flex space-x-4 mt-6">
          <Button
            onClick={handleAddMilestone}
            className="flex-grow text-base py-3 "
          >
            Add Milestone
          </Button>
          <Button
            onClick={handleSaveMilestones}
            variant="outline"
            className="flex-grow text-base py-3"
          >
            Save Milestones
          </Button>
        </div>

        {/* Timeline View */}
        <div className="mt-10 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Your Milestones
          </h3>
          <div className="space-y-3">
            {milestones.map(
              (milestone, index) =>
                milestone.title &&
                milestone.date && (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm"
                  >
                    <span className="font-medium">{milestone.title}</span>
                    <span className="text-gray-500">
                      {milestone.date
                        ? dayjs(milestone.date).format("MMM D, YYYY")
                        : ""}
                    </span>
                  </div>
                )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreateEditMilestone;
