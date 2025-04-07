'use client';

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

import { ChartConfig, ChartContainer } from '@/components/ui/chart';

export const description = 'A radial chart with text';

// Function to determine grade based on percentage
const getGrade = (percentage: number) => {
  if (percentage >= 90 && percentage <= 100) return 'O';
  if (percentage >= 80 && percentage < 90) return 'A';
  if (percentage >= 70 && percentage < 80) return 'B';
  if (percentage >= 60 && percentage < 70) return 'C';
  if (percentage >= 50 && percentage < 60) return 'D';
  return 'F'; // For percentage below 50
};

const chartConfig = {
  visitors: {
    label: 'Grade',
  },
} satisfies ChartConfig;

export function GradeCircularProgress({ percentage }: { percentage: number }) {
  const grade = getGrade(percentage); // Get grade based on percentage

  const chartData = [{ name: 'progress', percentage, fill: 'var(--color-safari)' }];

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[150px]" // Reduced height
    >
      <RadialBarChart
        data={chartData}
        startAngle={90} // Start from top
        endAngle={90 + (360 * percentage) / 100} // Calculate end angle based on percentage
        innerRadius={60} // Decreased inner radius
        outerRadius={80} // Decreased outer radius
        barSize={10} // Control bar thickness
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[66, 54]} // Adjusted the polar radius for a smaller grid
        />
        <RadialBar dataKey="percentage" background cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                      {grade}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20} // Adjusted spacing
                      className="fill-muted-foreground text-sm"
                    >
                      Grade
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}
