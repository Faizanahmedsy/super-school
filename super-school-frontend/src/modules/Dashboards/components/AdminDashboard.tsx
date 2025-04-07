import AppInfoView from '@/app/components/AppInfoView';
import AppPageMeta from '@/app/components/AppPageMeta';
import { useSubjectPerGrade, useUserCounts } from '@/modules/Dashboards/action/dashboard.actions';
import CompareTwoYearGrade from '@/modules/DigitalMarking/CompareTwoYearGrade';
import PassRateChart from '@/modules/DigitalMarking/PassRateChart';
import SubjectPassRates from '@/modules/DigitalMarking/SubjectPassRates';
import useGlobalState from '@/store';
import AssessmentStats from './charts/AssessmentStats';
import { QuizChart } from './charts/QuizChart';
import StudentsPerGradeChart from './charts/StudentsPerGradeChart';
import TeachersPerGradeChart from './charts/TeachersPerGradeChart';
import MetricCard from './MetricCard';
import UIText from '@/components/global/Text/UIText';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import UserStatsChart from './charts/UsercountChart';
import SubjectperGrade from './charts/SubjectperGrade';

const AdminDashboard = () => {
  const user = useGlobalState((state) => state.user);
  const school_id = useRoleBasedSchoolId();

  const { data: useUserCount } = useUserCounts({
    year: user?.cur_batch?.start_year,
    ...((user?.role_name == ROLE_NAME.DEPARTMENT_OF_EDUCATION ||
      user?.role_name == ROLE_NAME.DEPARTMENT_OF_EDUCATION) && {
      school_id: school_id ? school_id : undefined,
    }),
  });

  const { data: subjectData } = useSubjectPerGrade({
    year: user?.cur_batch?.start_year,
    ...(user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION && {
      school_id: school_id ? school_id : undefined,
    }),
  });

  const academyData = {
    academicStats: [
      // {
      //   id: 4,
      //   title: (
      //     <>
      //       <UIText>User limit</UIText>
      //     </>
      //   ),
      //   count: useUserCount?.user_limit,
      //   icon: 'FcUser',
      // },
      {
        id: 1,
        title: (
          <>
            <UIText>Total Teachers</UIText>
          </>
        ),
        count: useUserCount?.total_teachers,
        // new: 'New 150',
        // badgeColor: '#0A8FDC',
        // bgcolor: '#E7F4FB',
        icon: 'FcGraduationCap',
      },
      {
        id: 2,
        title: (
          <>
            <UIText>Total Learners</UIText>
          </>
        ),
        count: useUserCount?.total_students,
        icon: 'FcReading',
      },
      {
        id: 3,
        title: (
          <>
            <UIText>Total Parents</UIText>
          </>
        ),
        count: useUserCount?.total_parents,
        icon: 'FcUser',
      },
      {
        id: 4,
        title: (
          <>
            <UIText>Total Subjects</UIText>
          </>
        ),
        count: subjectData?.total_subjects_in_school,
        icon: 'FcUser',
      },
    ],
  };

  return (
    <>
      <AppPageMeta title="Dashboard" />

      <section>
        {/* <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xxl:grid-cols-4 gap-4 mb-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 col-span-4">
            {academyData.academicStats.map((item: any, index) => (
              <div className="w-full" key={index}>
                <MetricCard stats={item} />
              </div>
            ))}
          </div>
          <div className="md:col-span-2 lg:col-span-4 h-full">
            <QuizChart />
          </div>
          <div className="md:col-span-2 lg:col-span-2 h-full">
            <CompareTwoYearGrade />
          </div>

          <div className="md:col-span-2 lg:col-span-2 h-full">
            <PassRateChart />
          </div>
          <div className="col-span-2">
            <StudentsPerGradeChart />
          </div>
          <div className="col-span-2">
            <TeachersPerGradeChart />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <SubjectPassRates />
          </div>
          <div className="col-span-2">
            <AssessmentStats />
          </div>
        </div> */}

        <div>
          {/* Academic Stats Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 xxl:grid-cols-4">
            {academyData.academicStats.map((item: any, index) => (
              <div className="w-full" key={index}>
                <MetricCard stats={item} />
              </div>
            ))}
          </div>

          <div>
            <QuizChart />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 xxl:grid-cols-2 gap-4 mb-10">
            <div>
              <UserStatsChart />
            </div>
            <div>
              <SubjectperGrade />
            </div>
            <div>
              <CompareTwoYearGrade />
            </div>
            <div>
              <PassRateChart />
            </div>
            <div>
              <StudentsPerGradeChart />
            </div>
            <div>
              <TeachersPerGradeChart />
            </div>
            <div>
              <SubjectPassRates />
            </div>
            <div>
              <AssessmentStats />
            </div>
          </div>
        </div>
      </section>

      <AppInfoView />
    </>
  );
};

export default AdminDashboard;
