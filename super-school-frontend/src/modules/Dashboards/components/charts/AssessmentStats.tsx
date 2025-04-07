import { Label, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useEffect, useMemo, useState } from 'react';
import { useDashboardAssessmentAnalytics } from '../../action/dashboard.actions';
import UIText from '@/components/global/Text/UIText';

const chartConfig = {
  count: {
    label: 'Count',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-2))',
  },
  ongoing: {
    label: 'Ongoing',
    color: 'hsl(var(--chart-1))',
  },
  upcoming: {
    label: 'Upcoming',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export default function Component() {
  const curBatchId = useRoleBasedCurrentBatch();
  const [selectedYear, setSelectedYear] = useState<number>(Number(curBatchId));

  useEffect(() => {
    setSelectedYear(Number(curBatchId));
  }, [curBatchId]);

  const dashboardAssessmentAnalytics = useDashboardAssessmentAnalytics({ batch_id: selectedYear });

  const totalAssessments = useMemo(() => {
    return dashboardAssessmentAnalytics?.data?.total_assessments || 0;
  }, [dashboardAssessmentAnalytics?.data?.total_assessments]);

  const chartData = useMemo(() => {
    return [
      { status: 'Completed', count: dashboardAssessmentAnalytics?.data?.completed || 0, fill: 'hsl(var(--chart-2))' },
      { status: 'Cancelled', count: dashboardAssessmentAnalytics?.data?.cancelled || 0, fill: 'hsl(var(--chart-3))' },
      { status: 'Ongoing', count: dashboardAssessmentAnalytics?.data?.ongoing || 0, fill: 'hsl(var(--chart-1))' },
      { status: 'Upcoming', count: dashboardAssessmentAnalytics?.data?.upcoming || 0, fill: 'hsl(var(--chart-4))' },
    ];
  }, [
    dashboardAssessmentAnalytics?.data?.cancelled,
    dashboardAssessmentAnalytics?.data?.completed,
    dashboardAssessmentAnalytics?.data?.ongoing,
    dashboardAssessmentAnalytics?.data?.upcoming,
  ]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Assessment Status</CardTitle>
        <CardDescription>Assessments Completed and Pending</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
          {totalAssessments > 0 ? (
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {totalAssessments.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                            Assessments
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          ) : (
            <div className="text-center text-gray-500 flex justify-center items-center h-full">No Data Available</div>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex items-center justify-center space-x-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-full bg-chart-1" />
            <span>
              <UIText>Ongoing</UIText>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-full bg-chart-2" />
            <span>
              <UIText>Completed</UIText>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-full bg-chart-3" />
            <span>
              <UIText>Cancelled</UIText>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-full bg-chart-4" />
            <span>
              <UIText>Upcoming</UIText>
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
