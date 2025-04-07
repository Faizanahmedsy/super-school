import { Navigate } from 'react-router-dom';

import { authRouteConfig } from './AuthRoutes.tsx';
import Error403 from '../../../modules/errorPages/Error403/index.tsx';
import { errorPagesConfigs } from './ErrorPagesRoutes.tsx';
import { dashboardConfig } from './DashboardsRoutes.tsx';
import { accountPagesConfigs } from './AccountRoutes.tsx';
import { initialUrl } from '@/app/constants/AppConst.ts';

const authorizedStructure = {
  fallbackPath: '/signin',
  unAuthorizedComponent: <Error403 />,
  routes: [...dashboardConfig, ...accountPagesConfigs],
};

const publicStructure = {
  fallbackPath: initialUrl,
  routes: authRouteConfig,
};
const anonymousStructure = {
  routes: errorPagesConfigs.concat([
    {
      path: '/',
      element: <Navigate to={initialUrl} />,
    },
    {
      path: '*',
      element: <Navigate to="/error-pages/error-404" />,
    },
  ]),
};

export { authorizedStructure, publicStructure, anonymousStructure };
