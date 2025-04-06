'use client';

import { useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useStudentPerGrade } from '@/modules/Dashboards/action/dashboard.actions';
import useGlobalState from '@/store';
import { Button, Modal } from 'antd';
import { Download, Expand } from 'lucide-react';
import html2canvas from 'html2canvas';
import BtnLoader from '@/components/custom/buttons/btn-loader';

export const description = 'A bar chart with a label';

const chartConfig = {
  students: {
    label: 'Students',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function StudentsPerGradeChart() {
  const user = useGlobalState((state) => state.user);
  const { data: studentsPerGrade } = useStudentPerGrade({ year: user?.cur_batch?.start_year });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadImage = async () => {
    if (chartRef.current) {
      // Add a background color to prevent transparency issues
      chartRef.current.style.backgroundColor = 'white';

      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay to ensure rendering

      html2canvas(chartRef.current, { scale: 2, useCORS: true }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'chart.png';
        link.click();
        setIsLoading(false);
      });

      // Reset background after capture
      chartRef.current.style.backgroundColor = '';
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between">
          <CardHeader className="mb-5">
            <CardTitle>Learner Per Grade</CardTitle>
            <CardDescription>
              A bar chart showing the number of learners per grade for the current academic year.
            </CardDescription>
          </CardHeader>
          <div className="relative top-4 mx-5 cursor-pointer">
            <Expand onClick={() => setIsModalOpen(true)} />
          </div>
        </div>
        <CardContent>
          {studentsPerGrade && studentsPerGrade.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <BarChart data={studentsPerGrade} margin={{ top: 50, bottom: 50 }}>
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
                  formatter={(value) => [`Learner Count: ${value}`]}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="student_count" fill="var(--color-students)" radius={8} barSize={70}>
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
        title="Learner Per Grade"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsLoading(false);
        }}
        footer={null}
        width={900}
        height={200}
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
        <div ref={chartRef} className="p-4">
          <Card>
            <CardHeader className="mb-5">
              <CardTitle>Learner Per Grade</CardTitle>
              <CardDescription>
                A bar chart showing the number of learners per grade for the current academic year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsPerGrade && studentsPerGrade.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <BarChart data={studentsPerGrade} margin={{ top: 50, bottom: 50 }}>
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
                      formatter={(value) => [`Learner Count: ${value}`]}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="student_count" fill="var(--color-students)" radius={8} barSize={70}>
                      <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="text-center text-gray-500">No Data Available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </Modal>
    </>
  );
}
