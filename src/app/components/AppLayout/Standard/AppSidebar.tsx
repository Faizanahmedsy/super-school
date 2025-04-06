import clsx from 'clsx';
import AppVerticalMenu from '../components/AppVerticalNav';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { StyledAppStandardScrollbar, StyledStandardSidebar } from './index.styled';
import { RouterConfigData } from '@/app/types/models/Apps';

type AppSidebarProps = {
  isCollapsed: boolean;
  routesConfig: RouterConfigData[];
};
const AppSidebar = ({ isCollapsed, routesConfig }: AppSidebarProps) => {
  const { allowSidebarBgImage } = useSidebarContext();

  return (
    <StyledStandardSidebar
      className={clsx({
        'standard-sidebar-img-background': allowSidebarBgImage,
      })}
      collapsible
      breakpoint="xl"
      collapsed={isCollapsed}
    >
      <StyledAppStandardScrollbar>
        <AppVerticalMenu routesConfig={routesConfig} />
      </StyledAppStandardScrollbar>
    </StyledStandardSidebar>
  );
};

export default AppSidebar;
