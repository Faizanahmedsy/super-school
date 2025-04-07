import React from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppContentView from '../../AppContentView';

import clsx from 'clsx';
import { FooterType, LayoutType } from '@/app/constants/AppEnums';
import AppFooter from '../components/AppFooter';
import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { StyledAppLayoutMinibar, StyledAppLayoutMinibarMain, StyledUserMiniHeaderScrollbar } from './index.styled';
import { RouterConfigData } from '@/app/types/models/Apps';

type Props = {
  routes: React.ReactElement | null;
  routesConfig: RouterConfigData[];
};
const UserMiniHeader: React.FC<Props> = ({ routes, routesConfig }) => {
  const { footer, layoutType, footerType } = useLayoutContext();

  return (
    <StyledAppLayoutMinibar
      className={clsx({
        appMainFooter: footer && footerType === FooterType.FLUID,
        appMainFixedFooter: footer && footerType === FooterType.FIXED,
        boxedLayout: layoutType === LayoutType.BOXED,
      })}
    >
      <AppSidebar routesConfig={routesConfig} />
      <StyledAppLayoutMinibarMain className="app-layout-userMiniHeader-main">
        <AppHeader />
        <StyledUserMiniHeaderScrollbar>
          <AppContentView routes={routes} />
          <AppFooter />
        </StyledUserMiniHeaderScrollbar>
      </StyledAppLayoutMinibarMain>
    </StyledAppLayoutMinibar>
  );
};

export default UserMiniHeader;
