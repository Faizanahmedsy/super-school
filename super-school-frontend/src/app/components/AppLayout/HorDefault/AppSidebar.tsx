import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import clsx from 'clsx';
import AppVerticalMenu from '../components/AppVerticalNav';
import { LayoutDirection } from '@/app/constants/AppEnums';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { StyledAppHorDrawer, StyledAppSidebarHorScrollbar, StyledHorMainSidebar } from './index.styled';
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
    <StyledAppHorDrawer
      placement={direction === LayoutDirection.LTR ? 'left' : 'right'}
      closable={false}
      onClose={onClose}
      open={visible}
    >
      <StyledHorMainSidebar
        className={clsx({
          'hor-sidebar-img-background': allowSidebarBgImage,
        })}
        collapsible
      >
        <StyledAppSidebarHorScrollbar>
          <AppVerticalMenu routesConfig={routesConfig} />
        </StyledAppSidebarHorScrollbar>
      </StyledHorMainSidebar>
    </StyledAppHorDrawer>
  );
};

export default AppSidebar;

AppSidebar.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};
