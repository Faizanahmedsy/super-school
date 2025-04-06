'use client';

import { useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTeacherinGrade } from '@/modules/Dashboards/action/dashboard.actions';
import useGlobalState from '@/store';
import { Button, Modal } from 'antd';
import { Download, Expand } from 'lucide-react';
import html2canvas from 'html2canvas';
import BtnLoader from '@/components/custom/buttons/btn-loader';

export const description = 'A bar chart with a label';

const chartConfig = {
  students: {
    label: 'Teachers',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function TeachersPerGradeChart() {
  const user = useGlobalState((state) => state.user);
  const { data: numberOfTeacherinGrade } = useTeacherinGrade({ year: user?.cur_batch?.start_year });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadImage = async () => {
    if (chartRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      html2canvas(chartRef.current, { scale: 2, useCORS: true }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'teachers_per_grade_chart.png';
        link.click();
      });
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between">
          <CardHeader className="mb-5">
            <CardTitle>Teachers Per Grade</CardTitle>
            <CardDescription>
              A bar chart showing the number of teachers per grade for the current academic year.
            </CardDescription>
          </CardHeader>
          <div className="relative top-4 mx-5 cursor-pointer">
            <Expand onClick={() => setIsModalOpen(true)} />
          </div>
        </div>
        <CardContent>
          {numberOfTeacherinGrade && numberOfTeacherinGrade.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <BarChart data={numberOfTeacherinGrade} margin={{ top: 50, bottom: 50 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="grade"
                  label={{
                    value: 'Grade',
                    position: 'insideBottom',
                    offset: -5,
                    dy: 10,
                    style: { fill: 'black', fontSize: 14 },
                  }}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(value) => `Teacher Count : ${value}`} />}
                />
                <Bar dataKey="teacher_count" fill="var(--color-students)" radius={8} barSize={75} maxBarSize={10}>
                  <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="text-center text-gray-500 flex justify-center items-center h-[400px]">
              No Data Available
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        title="Teachers Per Grade"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        <div className="absolute top-4 right-10 mx-4">
          {isLoading ? (
            <BtnLoader />
          ) : (
            <>
              {' '}
              <Download
                onClick={() => {
                  setIsLoading(true);
                  handleDownloadImage();
                }}
              />
            </>
          )}
        </div>
        <div ref={chartRef} className="p-4 ">
          <Card>
            <CardHeader className="mb-5">
              <CardTitle>Teachers Per Grade</CardTitle>
              <CardDescription>
                A bar chart showing the number of teachers per grade for the current academic year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {numberOfTeacherinGrade && numberOfTeacherinGrade.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <BarChart data={numberOfTeacherinGrade} margin={{ top: 50, bottom: 50 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="grade"
                      label={{
                        value: 'Grade',
                        position: 'insideBottom',
                        offset: -5,
                        dy: 10,
                        style: { fill: 'black', fontSize: 14 },
                      }}
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent formatter={(value) => `Teacher Count : ${value}`} />}
                    />
                    <Bar dataKey="teacher_count" fill="var(--color-students)" radius={8} barSize={70}>
                      <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="text-center text-gray-500 flex justify-center items-center h-[400px]">
                  No Data Available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Modal>
    </>
  );
}
