// ('use client');

// import BtnLoader from '@/components/custom/buttons/btn-loader';
// import UIText from '@/components/global/Text/UIText';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { ChartContainer } from '@/components/ui/chart';
// import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
// import { useListOption } from '@/hooks/use-select-option';
// import { useGradePassFailRate } from '@/modules/Dashboards/action/dashboard.actions';
// import { useGradeList } from '@/services/master/grade/grade.hook';
// import useGlobalState from '@/store';
// import { Modal, Select } from 'antd';
// import html2canvas from 'html2canvas';
// import { Download, Expand } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';
// import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// export default function PassRateChart() {
//   const user = useGlobalState((state) => state.user);
//   const [selectedGrade, setSelectedGrade] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const chartRef = useRef(null);
//   const cur_batch_id = useRoleBasedCurrentBatch();
//   const [isLoading, setIsLoading] = useState(false);
//   const { data: passFailRateData } = useGradePassFailRate(
//     {
//       year: user?.cur_batch?.start_year,
//       grade_id: selectedGrade,
//     },
//     Boolean(selectedGrade)
//   );

//   const gradeData = passFailRateData
//     ? [
//         { name: 'Pass Rate', value: passFailRateData.pass_percentage, color: 'hsl(var(--chart-2))' },
//         { name: 'Fail Rate', value: passFailRateData.fail_percentage, color: 'hsl(var(--chart-1))' },
//       ]
//     : [];

//   const gradeListQuery = useGradeList({ sort: 'asc', batch_id: cur_batch_id });
//   const { options: gradeOptions } = useListOption({
//     listData: gradeListQuery?.data?.list,
//     labelKey: 'grade_number',
//     valueKey: 'id',
//   });

//   useEffect(() => {
//     if (gradeListQuery?.isSuccess && gradeListQuery?.data?.list?.length > 0) {
//       setSelectedGrade(gradeListQuery.data.list[0].id);
//     }
//   }, [gradeListQuery?.isSuccess, gradeListQuery?.data?.list]);

//   const handleSaveImage = () => {
//     if (chartRef.current) {
//       html2canvas(chartRef.current).then((canvas) => {
//         const link = document.createElement('a');
//         link.href = canvas.toDataURL('image/png');
//         link.download = 'pass_rate_chart.png';
//         link.click();
//         setIsLoading(false);
//       });
//     }
//   };

//   console.log('gradeData', gradeData);

//   return (
//     <Card className="w-full h-full">
//       <CardHeader>
//         <div className="flex justify-between gap-5">
//           <div className="pt-2">
//             <CardTitle>Pass and Failure Rates</CardTitle>
//             <CardDescription>Pass and fail percentages for the selected grade</CardDescription>
//           </div>
//           <div>
//             <div className="space-y-1">
//               <div className="text-slate-500 text-sm font-semibold">
//                 <UIText>Filter by Grade</UIText>
//               </div>
//               <Select
//                 className="w-36"
//                 value={selectedGrade}
//                 allowClear
//                 showSearch
//                 options={gradeOptions}
//                 onChange={setSelectedGrade}
//               />
//             </div>
//           </div>
//           <div className="relative top-0 right-0 mx-3 cursor-pointer">
//             <Expand onClick={() => setIsModalOpen(true)} />
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent>
//         <ChartContainer
//           config={{
//             passRate: {
//               label: 'Pass Rate',
//               color: 'hsl(var(--chart-2))',
//             },
//             failRate: {
//               label: 'Fail Rate',
//               color: 'hsl(var(--chart-1))',
//             },
//           }}
//         >
//           {gradeData.length > 0 ? (
//             <div ref={chartRef}>
//               <ResponsiveContainer width="100%" height={400}>
//                 <PieChart>
//                   <Pie data={gradeData} dataKey="value" nameKey="name" outerRadius="80%" label>
//                     {gradeData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div className="text-center text-gray-500">No Data Available</div>
//           )}
//         </ChartContainer>
//       </CardContent>

//       <Modal
//         title="Pass & Fail Rate Chart"
//         open={isModalOpen}
//         onCancel={() => {
//           setIsLoading(false);
//           setIsModalOpen(false);
//         }}
//         footer={null}
//         width={1200}
//       >
//         <div ref={chartRef} className="absolute top-4 right-10 mx-3">
//           {isLoading ? (
//             <BtnLoader />
//           ) : (
//             <>
//               {' '}
//               <Download
//                 onClick={() => {
//                   setIsLoading(true);
//                   handleSaveImage();
//                 }}
//               />
//             </>
//           )}
//         </div>
//         <ResponsiveContainer width="100%" height={600}>
//           <PieChart>
//             <Pie data={gradeData} dataKey="value" nameKey="name" outerRadius="80%" label>
//               {gradeData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={entry.color} />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend />
//           </PieChart>
//         </ResponsiveContainer>
//       </Modal>
//     </Card>
//   );
// }

'use client';

import BtnLoader from '@/components/custom/buttons/btn-loader';
import UIText from '@/components/global/Text/UIText';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useListOption } from '@/hooks/use-select-option';
import { useGradePassFailRate } from '@/modules/Dashboards/action/dashboard.actions';
import { useGradeList } from '@/services/master/grade/grade.hook';
import useGlobalState from '@/store';
import { Modal, Select } from 'antd';
import html2canvas from 'html2canvas';
import { Download, Expand } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function PassRateChart() {
  const user = useGlobalState((state) => state.user);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const modalChartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cur_batch_id = useRoleBasedCurrentBatch();

  // Fetching pass/fail data
  const { data: passFailRateData } = useGradePassFailRate(
    {
      year: user?.cur_batch?.start_year,
      grade_id: selectedGrade,
    },
    Boolean(selectedGrade)
  );

  // Ensure the chart renders even when pass or fail rate is zero
  const gradeData = passFailRateData
    ? [
        { name: 'Pass Rate', value: passFailRateData.pass_percentage || 0, color: 'hsl(var(--chart-2))' },
        { name: 'Fail Rate', value: passFailRateData.fail_percentage || 0, color: 'hsl(var(--chart-1))' },
      ]
    : [];

  // Grade List Query
  const gradeListQuery = useGradeList({ sort: 'asc', batch_id: cur_batch_id });
  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.data?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  // Set default grade on load
  useEffect(() => {
    if (gradeListQuery?.isSuccess && gradeListQuery?.data?.list?.length > 0) {
      setSelectedGrade(gradeListQuery.data.list[0].id);
    }
  }, [gradeListQuery?.isSuccess, gradeListQuery?.data?.list]);

  // Function to handle chart download
  const handleSaveImage = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (ref.current) {
      html2canvas(ref.current).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = filename;
        link.click();
        setIsLoading(false);
      });
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex justify-between gap-5">
          <div className="pt-2">
            <CardTitle>Pass and Failure Rates</CardTitle>
            <CardDescription>Pass and fail percentages for the selected grade</CardDescription>
          </div>

          <div>
            <div className="space-y-1">
              <div className="text-slate-500 text-sm font-semibold">
                <UIText>Filter by Grade</UIText>
              </div>
              <Select
                className="w-36"
                value={selectedGrade}
                allowClear
                showSearch
                options={gradeOptions}
                onChange={setSelectedGrade}
              />
            </div>
          </div>

          <div className="relative top-0 right-0 mx-3 cursor-pointer">
            <Expand onClick={() => setIsModalOpen(true)} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={{
            passRate: {
              label: 'Pass Rate',
              color: 'hsl(var(--chart-2))',
            },
            failRate: {
              label: 'Fail Rate',
              color: 'hsl(var(--chart-1))',
            },
          }}
        >
          {gradeData.some((item) => item.value > 0) ? (
            <div ref={chartRef}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={gradeData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius="80%"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500 flex justify-center items-center h-full">No Data Available</div>
          )}
        </ChartContainer>
      </CardContent>

      <Modal
        title="Pass & Fail Rate Chart"
        open={isModalOpen}
        onCancel={() => {
          setIsLoading(false);
          setIsModalOpen(false);
        }}
        footer={null}
        width={1200}
      >
        <div className="absolute top-4 right-10 mx-3">
          {isLoading ? (
            <BtnLoader />
          ) : (
            <Download
              onClick={() => {
                setIsLoading(true);
                handleSaveImage(modalChartRef, 'pass_rate_chart.png');
              }}
            />
          )}
        </div>

        <div ref={modalChartRef}>
          {gradeData.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={600}>
              <PieChart>
                <Pie
                  data={gradeData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="80%"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 flex justify-center items-center h-[400px]  ">
              No Data Available
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
}
