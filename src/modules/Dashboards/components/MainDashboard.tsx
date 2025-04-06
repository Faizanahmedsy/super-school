import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

type ROLE =
  | ROLE_NAME.ADMIN
  | ROLE_NAME.SUPER_ADMIN
  | ROLE_NAME.TEACHER
  | ROLE_NAME.STUDENT
  | ROLE_NAME.PARENT
  | ROLE_NAME.DEPARTMENT_OF_EDUCATION;

export default function MainDashboard() {
  const user = useGlobalState((state) => state.user);

  const adminDashboardRoles = [
    ROLE_NAME.ADMIN,
    ROLE_NAME.SUPER_ADMIN,
    ROLE_NAME.TEACHER,
    ROLE_NAME.DEPARTMENT_OF_EDUCATION,
  ];

  const roleName = user?.role_name;

  if (roleName === ROLE_NAME.STUDENT || roleName === ROLE_NAME.PARENT) {
    return <StudentDashboard />;
  }

  if (roleName && adminDashboardRoles.includes(roleName as ROLE)) {
    return <AdminDashboard />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard</p>
    </div>
  );
}
