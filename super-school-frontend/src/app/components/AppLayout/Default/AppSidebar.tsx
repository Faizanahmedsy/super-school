import clsx from 'clsx';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { RouterConfigData } from '@/app/types/models/Apps';
import React from 'react';
import AppVerticalMenu from '../components/AppVerticalNav';
import { StyledAppMainSidebar, StyledAppSidebarScrollbar } from './index.styled';
import UserInfo from '../components/UserInfo';

type AppSidebarProps = {
  routesConfig: RouterConfigData[];
  isCollapsed: boolean;
};

const AppSidebar: React.FC<AppSidebarProps> = ({ isCollapsed, routesConfig }) => {
  const { allowSidebarBgImage } = useSidebarContext();

  return (
    <StyledAppMainSidebar
      className={clsx({
        'sidebar-img-background': allowSidebarBgImage,
      })}
      collapsible
      breakpoint="xl"
      collapsed={isCollapsed}
    >
      <UserInfo hasColor />
      <StyledAppSidebarScrollbar>
        <AppVerticalMenu routesConfig={routesConfig} />
      </StyledAppSidebarScrollbar>
    </StyledAppMainSidebar>
  );
};

export default AppSidebar;
