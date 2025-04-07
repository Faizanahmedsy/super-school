'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Sample data for grade trends over two terms
const gradeData = [
  { week: 1, lastTerm: 75, currentTerm: 78 },
  { week: 2, lastTerm: 73, currentTerm: 80 },
  { week: 3, lastTerm: 77, currentTerm: 79 },
  { week: 4, lastTerm: 76, currentTerm: 82 },
  { week: 5, lastTerm: 78, currentTerm: 81 },
  { week: 6, lastTerm: 80, currentTerm: 83 },
  { week: 7, lastTerm: 79, currentTerm: 85 },
  { week: 8, lastTerm: 81, currentTerm: 84 },
  { week: 9, lastTerm: 82, currentTerm: 86 },
  { week: 10, lastTerm: 83, currentTerm: 88 },
];

export default function TermGradeTrends() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Grade Trends: Last Term vs Current Term</CardTitle>
        <CardDescription>Average class grades over the course of 10 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            lastTerm: {
              label: 'Last Term',
              color: 'hsl(var(--chart-1))',
            },
            currentTerm: {
              label: 'Current Term',
              color: 'hsl(var(--chart-2))',
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={gradeData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                label={{
                  value: 'Week',
                  position: 'insideBottomRight',
                  offset: -10,
                }}
              />
              <YAxis
                label={{
                  value: 'Average Grade',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="lastTerm"
                stroke="var(--color-lastTerm)"
                activeDot={{ r: 8 }}
                name="Last Term"
              />
              <Line
                type="monotone"
                dataKey="currentTerm"
                stroke="var(--color-currentTerm)"
                activeDot={{ r: 8 }}
                name="Current Term"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
