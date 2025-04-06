'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Updated data to show continuous timeline from Jan 2023 to current month 2024
const gradeData = [
  { month: 'Jan 2023', grades: 78 },
  { month: 'Feb 2023', grades: 76 },
  { month: 'Mar 2023', grades: 79 },
  { month: 'Apr 2023', grades: 77 },
  { month: 'May 2023', grades: 80 },
  { month: 'Jun 2023', grades: 82 },
  { month: 'Jul 2023', grades: 81 },
  { month: 'Aug 2023', grades: 83 },
  { month: 'Sep 2023', grades: 82 },
  { month: 'Oct 2023', grades: 84 },
  { month: 'Nov 2023', grades: 83 },
  { month: 'Dec 2023', grades: 85 },
  { month: 'Jan 2024', grades: 86 },
  { month: 'Feb 2024', grades: 87 },
  { month: 'Mar 2024', grades: 88 },
  { month: 'Apr 2024', grades: 89 },
];

export default function YearGradeTrends() {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Grade Trends: January 2023 - April 2024</CardTitle>
        <CardDescription>Monthly average class grades over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            grades: {
              label: 'Average Grade',
              color: 'hsl(var(--chart-1))',
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gradeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={{
                  value: 'Month',
                  position: 'insideBottomRight',
                  offset: -10,
                }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                label={{
                  value: 'Average Grade',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="grades"
                stroke="var(--color-grades)"
                activeDot={{ r: 8 }}
                name="Average Grade"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
