'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartData = [
  { subject: 'Math', score: 78 },
  { subject: 'English', score: 82 },
  { subject: 'Science', score: 75 },
  { subject: 'History', score: 68 },
  { subject: 'Geography', score: 71 },
  { subject: 'Physics', score: 73 },
  { subject: 'Chemistry', score: 70 },
  { subject: 'Biology', score: 76 },
  { subject: 'Literature', score: 79 },
  { subject: 'Art', score: 85 },
  { subject: 'Music', score: 80 },
  { subject: 'Physical Education', score: 88 },
];

const chartConfig = {
  score: {
    label: 'Average Score',
    color: 'hsl(var(--chart-1))',
    type: 'bar',
  },
};

export default function AverageScorePerSubjectPerGrade() {
  return (
    <Card className="w-full  ">
      <CardHeader>
        <CardTitle>Average Learner Scores by Subject</CardTitle>
        <CardDescription>Academic Year 2023-2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickCount={6} />
            <YAxis dataKey="subject" type="category" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="score" fill={chartConfig.score.color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
