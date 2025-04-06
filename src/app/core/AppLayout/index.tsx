import AppContentView from '@/app/components/AppContentView';
import { Layouts } from '@/app/components/AppLayout';
import { useLayoutActionsContext, useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { useSidebarActionsContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import generateRoutes from '@/app/helpers/RouteGenerator';
import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { useUrlSearchParams } from 'use-url-search-params';

import { getItem } from '@/lib/localstorage';
import { anonymousStructure, authorizedStructure, publicStructure } from '../AppRoutes';
import routesConfig from '../AppRoutes/routeConfig';
import AuthWrapper from './AuthWrapper';

const AppLayout = () => {
  const { navStyle } = useLayoutContext();

  // const { user, isAuthenticated } = useAuthUser();
  const { updateNavStyle } = useLayoutActionsContext();
  const { updateMenuStyle, setSidebarBgImage } = useSidebarActionsContext();
  const AppLayout = Layouts[navStyle];
  const [params] = useUrlSearchParams();
  const generatedRoutes = generateRoutes({
    isAuthenticated: getItem('access_token'),
    // userRole: user?.role,
    publicStructure,
    authorizedStructure,
    anonymousStructure,
  });
  const routes = useRoutes(generatedRoutes);
  useEffect(() => {
    if (params.layout) updateNavStyle(params.layout as string);
    if (params.menuStyle) updateMenuStyle(params.menuStyle as string);
    if (params.sidebarImage) setSidebarBgImage(true);
  }, [params.layout, params.menuStyle, params.sidebarImage, updateNavStyle, updateMenuStyle, setSidebarBgImage]);

  return (
    <>
      {getItem('access_token') ? (
        <AppLayout routes={routes} routesConfig={routesConfig} />
      ) : (
        <AuthWrapper>
          <AppContentView routes={routes} />
        </AuthWrapper>
      )}
    </>
  );
};

export default AppLayout;
