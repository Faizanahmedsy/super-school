import React, { useRef, useState } from 'react';
import { useSubjectPerGrade } from '../../action/dashboard.actions';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Card, Modal } from 'antd';
import { CardContent } from '@/components/ui/card';
import { Download, Expand } from 'lucide-react';
import html2canvas from 'html2canvas';
import BtnLoader from '@/components/custom/buttons/btn-loader';

const SubjectPerGrade = () => {
  const user = useGlobalState((state) => state.user);
  const school_id = useRoleBasedSchoolId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);

  const { data: subjectData } = useSubjectPerGrade({
    year: user?.cur_batch?.start_year,
    ...(user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION && {
      school_id: school_id ? school_id : undefined,
    }),
  });

  const chartData =
    subjectData?.subjects_per_grade?.map((grade: any) => ({
      grade: `Grade ${grade.grade__grade_number}`,
      subjects: grade.total_subjects_in_grade,
    })) || [];

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
    <div>
      <Card>
        <CardContent className="p-0">
          <div className="flex justify-between items-center">
            <h2>Subjects Per Grade</h2>
            <div className="relative mx-5 cursor-pointer">
              <Expand onClick={() => setIsModalOpen(true)} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis
                label={{
                  value: 'Total Subject Per Grade',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: 'black' },
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="subjects" fill="#E76E50" name="Subjects per Grade" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Modal
        title="Subject Per Grade"
        open={isModalOpen}
        onCancel={() => {
          setIsLoading(false);
          setIsModalOpen(false);
        }}
        footer={null}
        width={900}
        height={400}
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
        <div className="h-full" ref={chartRef}>
          <Card>
            <CardContent className="p-0">
              <div className="flex justify-between items-center">
                <h2>Subjects Per Grade</h2>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="subjects" fill="#E76E50" name="Subjects per Grade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Modal>
    </div>
  );
};

export default SubjectPerGrade;
