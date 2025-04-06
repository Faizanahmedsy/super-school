'use client';

import UIText from '@/components/global/Text/UIText';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useListOption } from '@/hooks/use-select-option';
import { useCompareTwoYearGrade } from '@/modules/Dashboards/action/dashboard.actions';
import { useGradeList } from '@/services/master/grade/grade.hook';
import useGlobalState from '@/store';
import { Select, Modal, Button } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import html2canvas from 'html2canvas';
import { Download, Expand } from 'lucide-react';
import BtnLoader from '@/components/custom/buttons/btn-loader';

const CompareTwoYearGrade = () => {
  const user = useGlobalState((state) => state.user);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cur_batch_id = useRoleBasedCurrentBatch();
  const chartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: compareTwoYearData } = useCompareTwoYearGrade({
    year: user?.cur_batch?.start_year ? user.cur_batch.start_year : cur_batch_id,
    grade_id: selectedGrade,
  });

  const gradeListQuery = useGradeList({
    sort: 'asc',
    batch_id: cur_batch_id,
  });

  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.data?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  useEffect(() => {
    if (gradeListQuery?.isSuccess && gradeListQuery?.data?.list?.length > 0) {
      setSelectedGrade(gradeListQuery.data.list[0].id);
    }
  }, [gradeListQuery?.isSuccess, gradeListQuery?.data?.list]);

  const chartData =
    compareTwoYearData?.grade_comparison_data?.map((gradeData: any) => ({
      grade: `${gradeData.grade_number}`,
      currentYearPass: gradeData.current_year_stats.pass_percentage,
      previousYearPass: gradeData.previous_year_stats.pass_percentage,
      currentYearFail: gradeData.current_year_stats.fail_percentage,
      previousYearFail: gradeData.previous_year_stats.fail_percentage,
    })) || [];

  const aggregatedData = chartData.reduce((acc: any, item: any) => {
    const existingGrade = acc.find((g: any) => g.grade === item.grade);

    if (existingGrade) {
      // Aggregate pass and fail percentages (Taking Average)
      existingGrade.currentYearPass = (existingGrade.currentYearPass + item.currentYearPass) / 2;
      existingGrade.previousYearPass = (existingGrade.previousYearPass + item.previousYearPass) / 2;
      existingGrade.currentYearFail = (existingGrade.currentYearFail + item.currentYearFail) / 2;
      existingGrade.previousYearFail = (existingGrade.previousYearFail + item.previousYearFail) / 2;
    } else {
      acc.push({ ...item });
    }

    return acc;
  }, []);

  const handleDownloadImage = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current, { useCORS: true, scale: 2 }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png', 1.0);
        link.download = 'chart.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsLoading(false);
      });
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex justify-between gap-5">
          <div className="pt-2">
            <CardTitle>Grade-wise Pass Rate Comparison</CardTitle>
            <CardDescription>Comparison of pass and fail rates between current and previous years</CardDescription>
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
          <div className="relative top-0 right-0 mx-3 cursor-pointer">
            <Expand onClick={() => setIsModalOpen(true)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-5 rounded-lg h-full">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={aggregatedData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="grade"
                label={{ value: 'Grade', position: 'insideBottom', dy: 20, style: { fill: 'black', fontSize: 14 } }}
              />
              <YAxis
                domain={[0, 100]}
                label={{
                  value: 'Percentage (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: 'black', fontSize: 14, textAnchor: 'middle' },
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentYearPass" fill="#10b981" name="Current Year Pass">
                <LabelList dataKey="currentYearPass" position="top" formatter={(value: any) => `${value}%`} />
              </Bar>
              <Bar dataKey="previousYearPass" fill="#3b82f6" name="Previous Year Pass">
                <LabelList dataKey="previousYearPass" position="top" formatter={(value: any) => `${value}%`} />
              </Bar>
              <Bar dataKey="currentYearFail" fill="#ef4444" name="Current Year Fail">
                <LabelList dataKey="currentYearFail" position="top" formatter={(value: any) => `${value}%`} />
              </Bar>
              <Bar dataKey="previousYearFail" fill="#f97316" name="Previous Year Fail">
                <LabelList dataKey="previousYearFail" position="top" formatter={(value: any) => `${value}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <Modal
        title="Grade wise Pass & Fail Compairison Chart"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsLoading(false);
        }}
        footer={null}
        width={1200}
      >
        <div className="absolute top-4 right-10 mx-3">
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
        <div ref={chartRef} className="relative bg-white p-5 rounded-lg">
          <ResponsiveContainer width="100%" height={600}>
            <BarChart data={aggregatedData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" label={{ value: 'Grade', position: 'insideBottom', dy: 20 }} />
              <YAxis
                domain={[0, 100]}
                label={{
                  value: 'Percentage (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentYearPass" fill="#10b981" name="Current Year Pass" />
              <Bar dataKey="previousYearPass" fill="#3b82f6" name="Previous Year Pass" />
              <Bar dataKey="currentYearFail" fill="#ef4444" name="Current Year Fail" />
              <Bar dataKey="previousYearFail" fill="#f97316" name="Previous Year Fail" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Modal>
    </Card>
  );
};

export default CompareTwoYearGrade;
