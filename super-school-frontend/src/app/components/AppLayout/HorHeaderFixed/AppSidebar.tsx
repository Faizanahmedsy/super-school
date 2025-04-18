import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import clsx from 'clsx';
import AppVerticalMenu from '../components/AppVerticalNav';
import { LayoutDirection } from '@/app/constants/AppEnums';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { StyledAppHeaderDrawerFixed, StyledAppHorHeaderFixedSidebar, StyledAppHorScrollbar } from './index.styled';
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
    <StyledAppHeaderDrawerFixed
      placement={direction === LayoutDirection.LTR ? 'left' : 'right'}
      closable={false}
      onClose={onClose}
      open={visible}
    >
      <StyledAppHorHeaderFixedSidebar
        className={clsx({
          'hor-header-fixed-sidebar-img-background': allowSidebarBgImage,
        })}
        collapsible
      >
        <StyledAppHorScrollbar>
          <AppVerticalMenu routesConfig={routesConfig} />
        </StyledAppHorScrollbar>
      </StyledAppHorHeaderFixedSidebar>
    </StyledAppHeaderDrawerFixed>
  );
};

export default AppSidebar;
