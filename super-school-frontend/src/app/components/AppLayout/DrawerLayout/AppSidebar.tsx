import { useEffect } from 'react';

import clsx from 'clsx';
import AppVerticalMenu from '../components/AppVerticalNav';
import { useLocation } from 'react-router-dom';
import { LayoutDirection } from '@/app/constants/AppEnums';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { StyledAppDrawer, StyledAppDrawerLayoutSidebar, StyledAppDrawerSidebarScrollbar } from './index.styled';
import { RouterConfigData } from '@/app/types/models/Apps';

type AppSidebarProps = {
  visible: boolean;
  onClose: () => void;
  routesConfig: RouterConfigData[];
};

const AppSidebar = ({ visible, onClose, routesConfig }: AppSidebarProps) => {
  const { allowSidebarBgImage } = useSidebarContext();
  const { direction } = useLayoutContext();
  const { pathname } = useLocation();

  useEffect(() => {
    onClose();
  }, [pathname]);

  return (
    <StyledAppDrawer
      placement={direction === LayoutDirection.LTR ? 'left' : 'right'}
      closable={false}
      onClose={onClose}
      open={visible}
    >
      <StyledAppDrawerLayoutSidebar
        className={clsx({
          'drawerLayout-sidebar-img-background': allowSidebarBgImage,
        })}
        collapsible
      >
        <StyledAppDrawerSidebarScrollbar>
          <AppVerticalMenu routesConfig={routesConfig} />
        </StyledAppDrawerSidebarScrollbar>
      </StyledAppDrawerLayoutSidebar>
    </StyledAppDrawer>
  );
};

export default AppSidebar;
