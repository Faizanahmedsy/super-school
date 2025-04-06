import PageTitle from '@/components/global/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useGlobalState from '@/store';
import { Tabs } from 'antd';
import { useLocation } from 'react-router-dom';
import SchoolAssessmentsReportList from './SchoolAssessmentReport/SchoolAssessmentsReportList';
import SchoolLearnerReportList from './SchoolLearnerReport/SchoolLearnerReportList';
import SchoolParentsReportList from './SchoolParentsReport/SchoolParentsReportList';
import SchoolQuizeReportList from './SchoolQuizReport/SchoolQuizeReportList';
import SchoolReportList from './SchoolReport/SchoolReportList';
import SchoolTeacherReportList from './SchoolTeacherReport/SchoolTeacherReportList';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import UIText from '@/components/global/Text/UIText';

const ReportManagementModuleList = () => {
  const user = useGlobalState((state: any) => state.user);
  const location = useLocation();
  return (
    <>
      <PageTitle>Report Management List</PageTitle>
      <Card className="mb-5 scroll-smooth scroll-area" style={{ height: 'auto', overflow: 'auto' }}>
        {/* <CardHeader>
          <CardTitle>Report Management List</CardTitle>
        </CardHeader> */}
        <CardContent>
          <div className="px-5">
            <Tabs
              defaultActiveKey={location?.state?.key == 4 ? '4' : '1'}
              className="py-5"
              items={[
                ...(user.role_name == ROLE_NAME.SUPER_ADMIN
                  ? [
                      {
                        label: (
                          <div className="text-base">
                            <UIText>School Report</UIText>
                          </div>
                        ),
                        key: '1',
                        children: (
                          <>
                            <SchoolReportList />
                          </>
                        ),
                      },
                    ]
                  : []),
                {
                  label: (
                    <div className="text-base">
                      <UIText>Teacher Report</UIText>
                    </div>
                  ),
                  key: '2',
                  children: (
                    <>
                      <SchoolTeacherReportList />
                    </>
                  ),
                },
                {
                  label: (
                    <div className="text-base">
                      <UIText>Learner Report</UIText>
                    </div>
                  ),
                  key: '3',
                  children: (
                    <>
                      <SchoolLearnerReportList />
                    </>
                  ),
                },
                {
                  label: (
                    <div className="text-base">
                      <UIText>Parents Report</UIText>
                    </div>
                  ),
                  key: '4',
                  children: (
                    <>
                      <SchoolParentsReportList />
                    </>
                  ),
                },
                {
                  label: (
                    <div className="text-base">
                      <UIText>Assessments Report</UIText>
                    </div>
                  ),
                  key: '5',
                  children: (
                    <>
                      <SchoolAssessmentsReportList />
                    </>
                  ),
                },
                {
                  label: (
                    <div className="text-base">
                      <UIText>Quiz Report</UIText>
                    </div>
                  ),
                  key: '6',
                  children: (
                    <>
                      <SchoolQuizeReportList />
                    </>
                  ),
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ReportManagementModuleList;
