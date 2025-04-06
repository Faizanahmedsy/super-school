import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';
import TeacherLessonPlan from './TeacherLessonPlan';

export default function LessonPlan() {
  const user = useGlobalState((state) => state.user);

  const role = user?.role_name;

  if (role === ROLE_NAME.TEACHER || role === ROLE_NAME.ADMIN) {
    return <TeacherLessonPlan />;
  }

  if (role === ROLE_NAME.STUDENT) {
    return <TeacherLessonPlan forRole={ROLE_NAME.STUDENT} />;
  }

  return <TeacherLessonPlan />;
}
