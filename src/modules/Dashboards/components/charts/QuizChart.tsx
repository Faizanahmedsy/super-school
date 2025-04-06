'use client';

import * as React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useDashboardQuizAnalytics } from '../../action/dashboard.actions';
import { chartConfig } from '../../constants/chartData';
import useGlobalState from '@/store';
import { useRoleBasedLearnerId } from '@/hooks/role-based-ids/use-rolebased-learner-id';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { Modal, Select } from 'antd';
import { Download, Expand } from 'lucide-react';
import html2canvas from 'html2canvas';
import BtnLoader from '@/components/custom/buttons/btn-loader';

const chartOptions = [
  { value: 'completed', label: chartConfig['completed'].label },
  { value: 'pending', label: chartConfig['pending'].label },
];

export function QuizChart() {
  const [activeChart, setActiveChart] = React.useState<'completed' | 'pending'>('completed');
  const user = useGlobalState((state) => state.user);
  const studentId = useRoleBasedLearnerId();
  const school_id = useRoleBasedSchoolId();
  const chartRef = React.useRef(null);
  const modalChartRef = React.useRef(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const quizAnalytics = useDashboardQuizAnalytics({
    ...(user?.role_name == ROLE_NAME.PARENT && {
      student_id: studentId ? studentId : undefined,
    }),
    ...(user?.role_name == ROLE_NAME.DEPARTMENT_OF_EDUCATION && {
      school_id: school_id ? school_id : undefined,
    }),
  });

  const chartData = quizAnalytics?.data ?? [];

  const total = React.useMemo(
    () => ({
      completed: chartData.reduce((acc: any, curr: any) => acc + curr.completed.manual + curr.completed.ai, 0),
      pending: chartData.reduce((acc: any, curr: any) => acc + curr.pending.manual + curr.pending.ai, 0),
    }),
    [chartData]
  );

  const yMax = React.useMemo(() => {
    if (chartData.length === 0) return 10; // Default when no data

    const values = chartData.flatMap((data: any) => [
      data.completed.manual,
      data.completed.ai,
      data.pending.manual,
      data.pending.ai,
    ]);

    const maxValue = Math.max(...values, 10);
    const scaleFactor = Math.ceil(chartData.length / 30); // Adjust based on data length
    return Math.ceil(maxValue / (10 * scaleFactor)) * (10 * scaleFactor);
  }, [chartData]);

  const xAxisDomain = chartData.length === 1 ? [chartData[0].date, chartData[0].date] : undefined;

  const downloadChart = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'subject-pass-rates.png';
      link.click();
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row bg-gradient-to-r from-secondary to-secondary rounded-t-lg text-primary">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-primary">Quizzes Assigned and Quizzes Completed</CardTitle>
          <CardDescription className="text-primary">
            A line chart showing the number of quizzes assigned and completed over the past 3 months
          </CardDescription>
        </div>
        <div className="flex align-center gap-2 pt-10">
          <Select
            value={activeChart}
            onChange={(value) => setActiveChart(value as 'completed' | 'pending')}
            options={chartOptions}
            className="w-full sm:w-40"
          />
          <div className="text-lg font-bold leading-none sm:text-3xl">{total[activeChart].toLocaleString()}</div>
        </div>
        <div className="relative top-1 right-0 mx-3 cursor-pointer">
          <Expand onClick={() => setIsModalOpen(true)} />
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6" ref={chartRef}>
        <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              domain={xAxisDomain}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
              padding={{ left: 30, right: 30 }}
            />
            <YAxis
              domain={[0, yMax]}
              label={{
                value: `Number of Quiz`,
                style: { textAnchor: 'middle' },
                angle: -90,
                position: 'left',
                offset: 0,
              }}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={`${activeChart}.manual`}
              name="Manual"
              stroke={chartConfig.manual.color}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey={`${activeChart}.ai`}
              name="AI"
              stroke={chartConfig.ai.color}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>

      <Modal
        title="Quizzes Assigned and Quizzes Completed"
        width={1200}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
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
                  downloadChart();
                }}
              />
            </>
          )}
        </div>
        <div ref={modalChartRef} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  domain={xAxisDomain}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  padding={{ left: 30, right: 30 }}
                />
                <YAxis
                  domain={[0, yMax]}
                  label={{
                    value: `Number of Quiz`,
                    style: { textAnchor: 'middle' },
                    angle: -90,
                    position: 'left',
                    offset: 0,
                  }}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      className="w-[200px]"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                      }}
                    />
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={`${activeChart}.manual`}
                  name="Manual"
                  stroke={chartConfig.manual.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey={`${activeChart}.ai`}
                  name="AI"
                  stroke={chartConfig.ai.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>

        {/* Subject Labels with Color Codes in Modal */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {chartData.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-sm">{entry.subject}</span>
            </div>
          ))}
        </div>
      </Modal>
    </Card>
  );
}
