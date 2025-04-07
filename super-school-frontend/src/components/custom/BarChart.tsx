// "use client";

// import { TrendingUp } from "lucide-react";
// import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// export const description = "A multiple bar chart";

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "hsl(var(--chart-1))",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "hsl(var(--chart-2))",
//   },
// } satisfies ChartConfig;

// export function BarChartExample() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Bar Chart - Multiple</CardTitle>
//         <CardDescription>January - June 2024</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <BarChart accessibilityLayer data={chartData}>
//             <CartesianGrid vertical={false} />
{
  /* <XAxis
  dataKey="month"
  tickLine={false}
  tickMargin={10}
  axisLine={false}
  tickFormatter={(value) => value.slice(0, 3)}
/> */
}
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent indicator="dashed" />}
//             />
//             <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
//             <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
//           </BarChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter className="flex-col items-start gap-2 text-sm">
//         <div className="flex gap-2 font-medium leading-none">
//           Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
//         </div>
//         <div className="leading-none text-muted-foreground">
//           Showing total visitors for the last 6 months
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }

('use client');

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeacherinGrade } from '@/modules/Dashboards/action/dashboard.actions';
import useGlobalState from '@/store';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

// Dummy data for the number of teachers in each class
// const chartData = [
//   { month: 'January', class: 'Class 1', teachers: 5, students: 5 },
//   { month: 'Febuary', class: 'Class 2', teachers: 6, students: 5 },
//   { month: 'March', class: 'Class 3', teachers: 4, students: 5 },
//   { month: 'April', class: 'Class 4', teachers: 7, students: 5 },
//   { month: 'May', class: 'Class 5', teachers: 5, students: 5 },
//   { month: 'Jun', class: 'Class 5', teachers: 5, students: 5 },
// ];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function BarChartExample() {
  const user = useGlobalState((state) => state.user);
  const { data: numberOfTeacherinGrade } = useTeacherinGrade({ year: user?.cur_batch?.start_year });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Number of Teachers in Each Grade</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={numberOfTeacherinGrade}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="grade" />
            {/* <YAxis /> */}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
              formatter={(value) => `Teacher Count ${value}`}
            />
            {/* <Bar dataKey="students" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="teachers" fill="var(--color-mobile)" radius={4} /> */}
            <Bar dataKey="teacher_count" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
