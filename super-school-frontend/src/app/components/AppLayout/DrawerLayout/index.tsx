import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppContentView from '../../AppContentView';

import AppFooter from '../components/AppFooter';
import clsx from 'clsx';
import { FooterType } from '@/app/constants/AppEnums';
import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { StyledAppDrawerLayout, StyledAppDrawerLayoutMain, StyledDrawerScrollbar } from './index.styled';
import { RouterConfigData } from '@/app/types/models/Apps';

type Props = {
  routes: React.ReactElement | null;
  routesConfig: RouterConfigData[];
};

const DrawerLayout: React.FC<Props> = ({ routes, routesConfig }) => {
  const [isVisible, setVisible] = useState(false);

  const { footer, footerType } = useLayoutContext();

  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <StyledAppDrawerLayout
      className={clsx({
        appMainFooter: footer && footerType === FooterType.FLUID,
        appMainFixedFooter: footer && footerType === FooterType.FIXED,
      })}
    >
      <AppSidebar visible={isVisible} onClose={onClose} routesConfig={routesConfig} />
      <StyledAppDrawerLayoutMain className="app-DrawerLayout-main">
        <AppHeader showDrawer={showDrawer} />
        <StyledDrawerScrollbar>
          <AppContentView routes={routes} />
          <AppFooter />
        </StyledDrawerScrollbar>
      </StyledAppDrawerLayoutMain>
    </StyledAppDrawerLayout>
  );
};

export default React.memo(DrawerLayout);
