import React, { useEffect, useState } from 'react';
import { Grid } from 'antd';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppContentView from '../../AppContentView';

import AppFooter from '../components/AppFooter';
import clsx from 'clsx';
import { FooterType } from '@/app/constants/AppEnums';
import { isEmpty } from '@/app/helpers/Common';
import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import {
  StyledAppLayoutStandard,
  StyledAppLayoutStandardMain,
  StyledAppLayoutStandardRow,
  StyledStandardScrollbar,
} from './index.styled';
import { RouterConfigData } from '@/app/types/models/Apps';

const { useBreakpoint } = Grid;

type Props = {
  routes: React.ReactElement | null;
  routesConfig: RouterConfigData[];
};
const Standard: React.FC<Props> = ({ routes, routesConfig }) => {
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
    <StyledAppLayoutStandard
      className={clsx({
        appMainFooter: footer && footerType === FooterType.FLUID,
        appMainFixedFooter: footer && footerType === FooterType.FIXED,
      })}
    >
      <AppHeader isCollapsed={isCollapsed} onToggleSidebar={onToggleSidebar} />
      <StyledAppLayoutStandardRow>
        <AppSidebar isCollapsed={isCollapsed} routesConfig={routesConfig} />
        <StyledAppLayoutStandardMain className="app-layout-standard-main">
          <StyledStandardScrollbar>
            <AppContentView routes={routes} />
            <AppFooter />
          </StyledStandardScrollbar>
        </StyledAppLayoutStandardMain>
      </StyledAppLayoutStandardRow>
    </StyledAppLayoutStandard>
  );
};

export default React.memo(Standard);
