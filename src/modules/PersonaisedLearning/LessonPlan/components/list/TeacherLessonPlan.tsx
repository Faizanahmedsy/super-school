import CreateButton from '@/components/custom/buttons/CreateButton';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import { Card, CardContent } from '@/components/ui/card';
import { ACTION, MODULE, ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useLessonPlanList } from '@/modules/PersonaisedLearning/LessonPlan/action/lesson-plan.action';
import { Form } from 'antd';
import { useState } from 'react';
import { useLessonPlanColumns } from '../../hooks/useLessonPlanColumns';
import { useTeacherLessonPlanFilters } from '../../hooks/useTeacherLessonPlanFilters';
import useGlobalState from '@/store';

export default function LessonPlanList({ forRole }: { forRole?: string }) {
  // HOOKS
  const [form] = Form.useForm();
  const [editId, setEditId] = useState<number>();
  const user = useGlobalState((state) => state.user);

  const { pageQuery, selectFilters, handlePaginationChange, handleSearchChange, selectedFilters, resetFilters } =
    useTeacherLessonPlanFilters({
      enableGradeFilter: user?.role_name === ROLE_NAME.PARENT || user?.role_name === ROLE_NAME.STUDENT ? false : true,
      enableTermFilter: user?.role_name === ROLE_NAME.PARENT || user?.role_name === ROLE_NAME.STUDENT ? false : true,
      enableClassFilter: user?.role_name === ROLE_NAME.PARENT || user?.role_name === ROLE_NAME.STUDENT ? false : true,
      enableSubjectFilter: user?.role_name === ROLE_NAME.PARENT || user?.role_name === ROLE_NAME.STUDENT ? false : true,
    });

  // QUERIES

  const lessonPlanQuery = useLessonPlanList({
    ...pageQuery,
    grade: selectedFilters.grade,
    term: selectedFilters.term,
    grade_class: selectedFilters.class,
    subject: selectedFilters.subject,
  });

  // Use the hook to get column definitions
  const lessonPlanColumns = useLessonPlanColumns(String(forRole), lessonPlanQuery);

  return (
    <>
      <PageTitle
        extraItem={
          <CreateButton
            moduleName={MODULE.LESSON_PLAN}
            action={ACTION.ADD}
            redirectTo="/lesson-plan/add"
            overrideText="Add Lesson Plan"
          />
        }
      >
        Lesson Plan
      </PageTitle>

      <Card className="w-full shadow-lg rounded-lg border border-gray-200 bg-white">
        <CardContent className="pt-4">
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <DynamicTable
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search by Title"
              searchColumn="title"
              data={lessonPlanQuery?.data?.results || []}
              columns={lessonPlanColumns}
              totalCount={lessonPlanQuery?.data?.totalCount || 0}
              pageSize={pageQuery.limit}
              pageIndex={(pageQuery.page ?? 1) - 1}
              loading={lessonPlanQuery.isPending}
              onPaginationChange={handlePaginationChange}
              selectFilters={selectFilters}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
