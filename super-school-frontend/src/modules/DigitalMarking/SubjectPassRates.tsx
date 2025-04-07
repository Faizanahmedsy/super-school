'use client';

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Modal, Button, Select } from 'antd';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useListOption } from '@/hooks/use-select-option';
import { useStudentInSubject } from '@/modules/Dashboards/action/dashboard.actions';
import { useGradeList } from '@/services/master/grade/grade.hook';
import useGlobalState from '@/store';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import UIText from '@/components/global/Text/UIText';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { Download, Expand } from 'lucide-react';
import { ChartTooltip } from '@/components/ui/chart';
import BtnLoader from '@/components/custom/buttons/btn-loader';

export default function SubjectPassRates() {
  const user = useGlobalState((state) => state.user);
  const [selectedGrade, setSelectedGrade] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chartRef = useRef(null);
  const modalChartRef = useRef(null);
  const cur_batch_id = useRoleBasedCurrentBatch();
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useStudentInSubject(
    {
      year: user?.cur_batch?.start_year,
      grade_id: selectedGrade,
    },
    Boolean(selectedGrade)
  );

  const colorPool = [
    '#3DB047',
    '#E6BC66',
    '#C34141',
    '#D47E33',
    '#FFA552',
    '#1B7C22',
    '#C49E44',
    '#950707',
    '#BE6518',
    '#F67820',
    '#6A5ACD',
    '#FF6347',
    '#40E0D0',
    '#FFD700',
    '#DC143C',
  ];

  const assignedColors = new Map();

  const getUniqueGraphColor = (subjectName: string) => {
    if (assignedColors.has(subjectName)) {
      return assignedColors.get(subjectName);
    }
    const availableColors = colorPool.filter((color) => !Array.from(assignedColors.values()).includes(color));
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    assignedColors.set(subjectName, randomColor);
    return randomColor;
  };

  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((subject) => {
      return {
        subject: subject.subject_name,
        passRate: subject.student_count,
        fill: getUniqueGraphColor(subject.subject_name),
      };
    });
  }, [data]);

  const gradeListQuery = useGradeList({ sort: 'asc', batch_id: cur_batch_id });
  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.data?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  React.useEffect(() => {
    if (gradeListQuery?.isSuccess && gradeListQuery?.data?.list?.length > 0) {
      setSelectedGrade(gradeListQuery.data.list[0].id);
    }
  }, [gradeListQuery?.isSuccess, gradeListQuery?.data?.list]);

  const downloadChart = async () => {
    if (modalChartRef.current) {
      const canvas = await html2canvas(modalChartRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'subject_wise_learner.png';
      link.click();
      setIsModalOpen(false);
      setIsLoading(false);
    }
  };

  const renderCustomLabel = (entry: any) => {
    return `${'Learner'} (${entry.passRate})`;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between gap-5">
            <div className="pt-2">
              <CardTitle>Subject Wise Learners</CardTitle>
              <CardDescription>The number of learners enrolled in each subject for the selected grade</CardDescription>
            </div>
            <div>
              <UIText>Filter by Grade</UIText>
              <Select
                className="w-36"
                value={selectedGrade}
                allowClear
                showSearch
                options={gradeOptions}
                onChange={setSelectedGrade}
              />
            </div>
            <div className="relative top-0 cursor-pointer">
              <Expand onClick={() => setIsModalOpen(true)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 bg-white h-full">
          {chartData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <ChartTooltip
                    content={({ payload }) => (
                      <div className="bg-white p-2 shadow rounded">
                        {payload?.[0]?.payload?.subject}: {payload?.[0]?.value} students
                      </div>
                    )}
                  />
                  <Pie
                    data={chartData}
                    dataKey="passRate"
                    nameKey="subject"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* <div className="flex flex-wrap justify-center gap-4 mt-6">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.fill }} />
                    <span className="text-sm">
                      {entry.subject} ({entry.passRate})
                    </span>
                  </div>
                ))}
              </div> */}
            </div>
          ) : (
            <div className="text-center text-gray-500 flex justify-center items-center h-[400px]">
              No Data Available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Chart */}
      <Modal
        title="Subject Wise Learners"
        width={1200}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsLoading(false);
        }}
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
        <div ref={modalChartRef}>
          {chartData.length > 0 && chartData ? (
            <div className="py-5">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <ChartTooltip
                    content={({ payload }) => (
                      <div className="bg-white p-2 shadow rounded">
                        {payload?.[0]?.payload?.subject}: {payload?.[0]?.value} Learners
                      </div>
                    )}
                  />
                  <Pie
                    data={chartData}
                    dataKey="passRate"
                    nameKey="subject"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.fill }} />
                    <span className="text-sm">
                      {entry.subject} ({entry.passRate})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 flex justify-center items-center h-[400px]">
              No Data Available
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
