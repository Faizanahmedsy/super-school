import collapseMotion from 'antd/lib/_util/motion';

import clsx from 'clsx';
import AppVerticalMenu from '../components/AppVerticalNav';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { StyledAppSidebarMiniScrollbar, StyledMiniSidebar } from './index.styled';
import { RouterConfigData } from '@/app/types/models/Apps';

type AppSidebarProps = {
  routesConfig: RouterConfigData[];
};

const AppSidebar = ({ routesConfig }: AppSidebarProps) => {
  const { allowSidebarBgImage } = useSidebarContext();

  return (
    <StyledMiniSidebar
      breakpoint="lg"
      className={clsx({
        'mini-sidebar-img-background': allowSidebarBgImage,
      })}
      collapsed={collapseMotion}
    >
      <StyledAppSidebarMiniScrollbar>
        <AppVerticalMenu routesConfig={routesConfig} />
      </StyledAppSidebarMiniScrollbar>
    </StyledMiniSidebar>
  );
};

export default AppSidebar;
