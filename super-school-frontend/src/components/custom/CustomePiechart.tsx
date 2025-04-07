'use client';

import { LabelList, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useStudentInSubject } from '@/modules/Dashboards/action/dashboard.actions';
import useGlobalState from '@/store';

export const description = 'A pie chart with a label list';

const chartConfig: ChartConfig = {
  students: {
    label: 'Students',
  },
};

export function CustomePiechart() {
  const user = useGlobalState((state) => state.user);
  const { data: useStudentPerSubject } = useStudentInSubject({ year: user?.cur_batch?.start_year, grade_id: 11 });

  // Transform API data into the required format for the chart
  const chartData = useStudentPerSubject?.map((subject: any) => ({
    subject_name: subject.subject_name,
    student_count: subject.student_count,
    fill: `hsl(var(--chart-${Math.floor(Math.random() * 5) + 1}))`, // Generate random colors
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Students Per Subjects</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig} // Pass the required config prop here
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="subject_name" hideLabel />} />
            <Pie
              data={chartData}
              offset={12}
              dataKey="student_count"
              nameKey="subject_name"
              cx="50%"
              cy="50%"
              outerRadius={100}
            >
              <LabelList
                dataKey="subject_name"
                className="p-4 m-5 text-center"
                stroke="none"
                fontSize={12}
                width={100}
                height={50}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
