import React, { useEffect, useState } from 'react';
import { Grid } from 'antd';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppContentView from '../../AppContentView';

import AppFooter from '../components/AppFooter';
import clsx from 'clsx';
import { FooterType } from '@/app/constants/AppEnums';
import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import { StyledAppLayout, StyledAppLayoutMain, StyledMainScrollbar } from './index.styled';
import { RouterConfigData } from '@/app/types/models/Apps';
import { isEmpty } from '@/app/helpers/Common';

const { useBreakpoint } = Grid;

type Props = {
  routes: React.ReactElement | null;
  routesConfig: RouterConfigData[];
};
const DefaultLayout: React.FC<Props> = ({ routes, routesConfig }) => {
  const width = useBreakpoint();
  const [isCollapsed, setCollapsed] = useState(false);
  const { footer, footerType } = useLayoutContext();

  const onToggleSidebar = () => {
    setCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (!isEmpty(width)) {
      if (width.xl) {
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    }
  }, [width]);

  return (
    <StyledAppLayout
      className={clsx({
        appMainFooter: footer && footerType === FooterType.FLUID,
        appMainFixedFooter: footer && footerType === FooterType.FIXED,
      })}
    >
      <AppSidebar isCollapsed={isCollapsed} routesConfig={routesConfig} />
      <StyledAppLayoutMain className="app-layout-main">
        <AppHeader isCollapsed={isCollapsed} onToggleSidebar={onToggleSidebar} />
        <StyledMainScrollbar>
          <AppContentView routes={routes} />
          <AppFooter />
        </StyledMainScrollbar>
      </StyledAppLayoutMain>
    </StyledAppLayout>
  );
};

export default React.memo(DefaultLayout);
