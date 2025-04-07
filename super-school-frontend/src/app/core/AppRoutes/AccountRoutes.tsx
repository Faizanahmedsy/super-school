import { RoutePermittedRole } from '@/app/constants/AppEnums';
import UserProfile from '@/components/userProfile/UserProfile';

export const accountPagesConfigs = [
  {
    permittedRole: [
      RoutePermittedRole.SuperAdmin,
      RoutePermittedRole.Admin,
      RoutePermittedRole.Parent,
      RoutePermittedRole.Teacher,
      RoutePermittedRole.Student,
    ],
    path: '/my-profile',
    element: <UserProfile />,
  },
];
