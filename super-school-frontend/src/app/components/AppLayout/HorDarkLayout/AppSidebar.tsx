import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import clsx from 'clsx';
import AppVerticalMenu from '../components/AppVerticalNav';
import { LayoutDirection } from '@/app/constants/AppEnums';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { StyledAppHorDarkDrawer, StyledAppMainHorDarkSidebar, StyledAppScrollbar } from './index.styled';
import { RouterConfigData } from '@/app/types/models/Apps';

type Props = {
  visible: boolean;
  onClose: () => void;
  routesConfig: RouterConfigData[];
};

const AppSidebar = ({ visible, onClose, routesConfig }: Props) => {
  const { allowSidebarBgImage } = useSidebarContext();
  const { direction } = useLayoutContext();
  const { pathname } = useLocation();

  useEffect(() => {
    onClose();
  }, [pathname]);

  return (
    <StyledAppHorDarkDrawer
      placement={direction === LayoutDirection.LTR ? 'left' : 'right'}
      closable={false}
      onClose={onClose}
      open={visible}
    >
      <StyledAppMainHorDarkSidebar
        className={clsx({
          'hor-dark-sidebar-img-background': allowSidebarBgImage,
        })}
        collapsible
      >
        <StyledAppScrollbar>
          <AppVerticalMenu routesConfig={routesConfig} />
        </StyledAppScrollbar>
      </StyledAppMainHorDarkSidebar>
    </StyledAppHorDarkDrawer>
  );
};

export default AppSidebar;

AppSidebar.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};
