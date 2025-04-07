import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';
import StudentPracticeExercises from './Student/StudentPracticeExercises';
import TeacherPracticeExercises from './Teacher/TeacherPracticeExercises';

export default function PracticeExercises() {
  const user = useGlobalState((state) => state.user);

  const role = user?.role_name;

  if (role === ROLE_NAME.TEACHER) {
    return <TeacherPracticeExercises />;
  }

  if (role === ROLE_NAME.STUDENT) {
    return <StudentPracticeExercises />;
  }

  // if (role === ROLE_NAME.ADMIN) {
  //   return <UnderConstruction />;
  // }

  // if (role === ROLE_NAME.SUPER_ADMIN) {
  //   return <UnderConstruction />;
  // }

  return <TeacherPracticeExercises />;
}
