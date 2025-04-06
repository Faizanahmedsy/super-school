import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ExamTimeTablList from './AssessmentTimeTablList';
import AppPageMeta from '@/app/components/AppPageMeta';
import PageTitle from '@/components/global/PageTitle';
import ExamTimeTableList from './ExamTimeTableList';
import UIText from '@/components/global/Text/UIText';

const ExamTimeTableMainList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState(location?.state?.key == 2 ? '2' : '1');

  useEffect(() => {
    navigate(location.pathname, { state: { key: activeKey } });
  }, [activeKey, navigate, location.pathname]);

  return (
    <>
      <AppPageMeta title={activeKey === '1' ? 'Exam Timetable List' : 'Assessment Timetable List'} />
      <PageTitle>{activeKey === '1' ? 'Exam Timetable List' : 'Assessment Timetable List'}</PageTitle>

      <div className="px-5">
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          className="py-5 text-base"
          items={[
            {
              label: (
                <div className="text-base">
                  <UIText>Exam Timetable</UIText>
                </div>
              ),
              key: '1',
              children: <ExamTimeTableList />,
            },
            {
              label: (
                <div className="text-base">
                  <UIText>Assessment Timetable</UIText>
                </div>
              ),
              key: '2',
              children: <ExamTimeTablList />,
            },
          ]}
        />
      </div>
    </>
  );
};

export default ExamTimeTableMainList;
