import { Card, CardContent } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';
import { Modal } from 'antd';
import html2canvas from 'html2canvas';
import { Download, Expand } from 'lucide-react';
import { useRef, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { useUserCounts } from '../../action/dashboard.actions';
import BtnLoader from '@/components/custom/buttons/btn-loader';

const UserStatsChart = () => {
  const user = useGlobalState((state) => state.user);
  const school_id = useRoleBasedSchoolId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: useUserCount } = useUserCounts({
    year: user?.cur_batch?.start_year,
    ...(user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION && {
      school_id: school_id ? school_id : undefined,
    }),
  });

  const additionalData = useUserCount || {
    user_limit: '0/0',
    total_admins: 0,
    total_teachers: 0,
    total_students: 0,
    total_parents: 0,
  };

  const dynamicData = [
    { name: 'Admins', value: additionalData.total_admins, color: '#3DB047' },
    { name: 'Teachers', value: additionalData.total_teachers, color: '#E6BC66' },
    { name: 'Learners', value: additionalData.total_students, color: '#C34141' },
    { name: 'Parents', value: additionalData.total_parents, color: '#D47E33' },
  ];

  const totalUsers = dynamicData.reduce((sum, item) => sum + item.value, 0);
  const userLimit =
    typeof additionalData.user_limit === 'string' ? additionalData.user_limit.split('/')[1] : additionalData.user_limit;

  const chartWidth = 300;
  const chartHeight = 300;
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;

  // Increased radius proportionally
  const innerRadius = 85;
  const outerRadius = 125;

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
      <Card className="p-6 shadow-lg rounded-2xl w-full mx-auto h-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl mb-0">Total Users</h2>
          <div className="relative mx-5 cursor-pointer">
            <Expand onClick={() => setIsModalOpen(true)} />
          </div>
        </div>
        <CardContent className="p-0 flex flex-col lg:flex-row items-center lg:items-center gap-2 h-full">
          <div className="relative flex items-center justify-center">
            <div className={`relative w-[${chartWidth}px] h-[${chartHeight}px]`}>
              <PieChart width={chartWidth} height={chartHeight}>
                <Pie
                  data={dynamicData}
                  cx={centerX}
                  cy={centerY}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {dynamicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} users`, null]}
                  contentStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    border: 'none',
                  }}
                />
              </PieChart>
              {totalUsers ? (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xl font-bold text-gray-800 p-0 m-0">{`${totalUsers}/${userLimit}`}</p>
                    <p className="text-sm font-medium text-gray-600 p-0 m-0">User Limit</p>
                  </div>
                </>
              ) : (
                <>
                  <div className=" text-gray-500 absolute inset-0 flex flex-col items-center justify-center text-center">
                    No Data Available
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col justify-center">
            <div className="space-y-4">
              {dynamicData.map((item) => (
                <div
                  key={item.name}
                  className="flex justify-around items-center p-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center">
                    <span
                      className="inline-block w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-md font-medium text-gray-700 p-0">{item.name}</span>
                  </div>
                  <data>:</data>
                  <div className="flex items-center">
                    <span className="text-sm lg:text-base font-semibold text-gray-800">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Modal
        title="Total Users"
        open={isModalOpen}
        onCancel={() => {
          setIsLoading(false);
          setIsModalOpen(false);
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
        <div ref={chartRef} className="p-0 flex flex-col lg:flex-row items-center lg:items-center gap-2 h-full">
          <div className="relative flex items-center justify-center">
            <div className={`relative w-[${chartWidth}px] h-[${chartHeight}px]`}>
              <PieChart width={chartWidth} height={chartHeight}>
                <Pie
                  data={dynamicData}
                  cx={centerX}
                  cy={centerY}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {dynamicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} users`, null]}
                  contentStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    border: 'none',
                  }}
                />
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-xl font-bold text-gray-800 p-0 m-0">{`${totalUsers}/${userLimit}`}</p>
                <p className="text-sm font-medium text-gray-600 p-0 m-0">User Limit</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col justify-center">
            <div className="space-y-4">
              {dynamicData.map((item) => (
                <div
                  key={item.name}
                  className="flex justify-around items-center p-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center">
                    <span
                      className="inline-block w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-md font-medium text-gray-700 p-0">{item.name}</span>
                  </div>
                  <data>:</data>
                  <div className="flex items-center">
                    <span className="text-sm lg:text-base font-semibold text-gray-800">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserStatsChart;
