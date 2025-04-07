'use client';
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export const description = 'A radial chart with stacked sections';
const chartData = [{ month: 'january', desktop: 1260, mobile: 570 }];
const chartConfig = {
  desktop: {
    label: 'Completed',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Pending',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function ExamStatusChart() {
  const totalVisitors = chartData[0].desktop + chartData[0].mobile;
  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Assessment Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center p-0">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <RadialBarChart data={chartData} endAngle={180} innerRadius="50%" outerRadius="100%" width={500} height={300}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 16} className="fill-foreground text-2xl font-bold">
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 4} className="fill-muted-foreground">
                          Assessments Registered
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="desktop"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-desktop)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="mobile"
              fill="var(--color-mobile)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <div>Assessments Completed: {chartData[0]?.desktop}</div>
          <div>Assessments Pending: {chartData[0]?.mobile}</div>
        </div>
      </CardFooter>
    </Card>
  );
}
