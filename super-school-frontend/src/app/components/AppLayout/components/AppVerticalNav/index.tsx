import { MenuStyle, RoutePermittedRole } from '@/app/constants/AppEnums';
import defaultConfig from '@/app/constants/defaultConfig';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { RouterConfigData } from '@/app/types/models/Apps';
import canPerformAction, { toLowercaseNoSpaces } from '@/lib/common-functions';
import { fetchRole, hideRoutesForRole, ROLE_NAME } from '@/lib/helpers/authHelpers';
import { cn } from '@/lib/utils';
import useGlobalState from '@/store';
import useRoleBasedAccess from '@/store/useRoleBasedAccess';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StyledVerticalNav } from './index.styled';
import { getRouteMenus } from './VerticalMenuUtils';
import { hideRouteIds } from '@/config/hide-modules-for-super-admin';

type Props = {
  routesConfig: RouterConfigData[];
};

const AppVerticalNav: React.FC<Props> = ({ routesConfig }) => {
  const setFilterData = useGlobalState((state) => state.setFilterData);
  const setBreadCrumbStep = useGlobalState((state) => state.setBreadCrumbStep);

  const { menuStyle, sidebarColorSet } = useSidebarContext();
  const { pathname } = useLocation();
  const user = useRoleBasedAccess((state) => state.user);
  const isSetUpWizardCompleted = useGlobalState((state) => state.isSetUpWizardCompleted);

  const [updatedRoutes, setUpdatedRoutes] = useState<RouterConfigData[]>([]);
  const [roleName, setRoleName] = useState<RoutePermittedRole | null>(null);
  const [filteredRoutes, setFilteredRoutes] = useState<RouterConfigData[]>([]);

  // Fetch role and update states
  useEffect(() => {
    const currentRole = fetchRole() as RoutePermittedRole;
    setRoleName(currentRole);
  }, []);

  // Process and update routes based on role and permissions
  useEffect(() => {
    if (!roleName) return;

    const updatedRoutesConfig = routesConfig.map((route) => ({ ...route }));

    if (roleName === (ROLE_NAME.SUPER_ADMIN as string) || roleName === (ROLE_NAME.DEPARTMENT_OF_EDUCATION as string)) {
      const hiddenRoutes = hideRoutesForRole(updatedRoutesConfig, hideRouteIds);
      hiddenRoutes.forEach((route) => {
        if (route.children) {
          route.children = route.children.filter((child) => child.id !== 'lesson_plans');
        }
      });
      setUpdatedRoutes(hiddenRoutes);
    } else {
      const permittedRoutes = updatedRoutesConfig.filter((route) => {
        let hasPermission = canPerformAction(route.id, 'view');

        if (route.children) {
          route.children = route.children.filter((child) => canPerformAction(child.id, 'view'));
          hasPermission = route.children.length > 0 || hasPermission;
        }

        return hasPermission;
      });
      setUpdatedRoutes(permittedRoutes);
    }
  }, [routesConfig, roleName, user?.permissions]);

  // Filter routes by role
  useEffect(() => {
    if (roleName) {
      setFilteredRoutes(updatedRoutes.filter((route: any) => (route.roles || []).includes(roleName)));
    }
  }, [roleName, updatedRoutes]);

  // Auto-scroll to active menu
  useEffect(() => {
    if (pathname) {
      setTimeout(() => {
        document.getElementById(pathname)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [pathname]);

  const selectedKeys = pathname.slice(1);
  const convertName = toLowercaseNoSpaces(selectedKeys);
  const joint = convertName?.split('/').join('');
  const [openKeys, setOpenKeys] = useState<string[]>([joint[0]]);
  const defaultOpenKeys = convertName?.split('/')[1] ? [convertName?.split('/')[1]] : [];

  const onOpenChange = (keys: string[]) => setOpenKeys(keys);

  const menuItems = getRouteMenus(filteredRoutes);

  if (!Array.isArray(menuItems)) {
    console.error('Invalid menu items:', menuItems);
    return null;
  }

  return (
    <div className={cn(isSetUpWizardCompleted ? '' : 'pointer-events-none cursor-not-allowed')}>
      <StyledVerticalNav
        theme={sidebarColorSet as any}
        color={sidebarColorSet?.sidebarMenuSelectedTextColor}
        mode="inline"
        className={clsx({
          'rounded-menu': menuStyle === MenuStyle.ROUNDED,
          'rounded-menu-reverse': menuStyle === MenuStyle.ROUNDED_REVERSE,
          'standard-menu': menuStyle === MenuStyle.STANDARD,
          'default-menu': menuStyle === MenuStyle.DEFAULT,
          'curved-menu': menuStyle === MenuStyle.CURVED_MENU,
          'bg-color-menu': sidebarColorSet.sidebarBgColor !== defaultConfig.sidebar.colorSet.sidebarBgColor,
        })}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        disabled={!isSetUpWizardCompleted}
        selectedKeys={convertName?.split('/')}
        defaultOpenKeys={defaultOpenKeys}
        onClick={() => {
          setBreadCrumbStep(0);
          setFilterData({});
        }}
        items={menuItems}
      />
    </div>
  );
};

export default AppVerticalNav;
