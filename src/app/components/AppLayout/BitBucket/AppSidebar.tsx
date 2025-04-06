import { useEffect, useState } from 'react';

import clsx from 'clsx';
import BucketMinibar from './BucketMinibar';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import AppVerticalMenu from '../components/AppVerticalNav';
import { useLocation } from 'react-router-dom';
import { LayoutDirection } from '@/app/constants/AppEnums';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { useLayoutContext } from '@/app/context/AppContextProvider/LayoutContextProvider';
import {
  StyledAppBitbucketSidebar,
  StyledAppBitbucketScrollbar,
  StyledAppBitbucketDrawer,
  StyledAppBitbucketSidebarWrapper,
  StyledBitbucketBtn,
} from './index.styled';
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

  const [isSidebarClosed, setSidebarClosed] = useState(false);

  const onSidebarClosed = () => {
    setSidebarClosed(!isSidebarClosed);
  };

  const sideBarComponent = () => {
    return (
      <StyledAppBitbucketSidebar
        className={clsx('app-BitBucket-sidebar', {
          'bitBucket-sidebar-img-background': allowSidebarBgImage,
        })}
        collapsible
      >
        <StyledAppBitbucketScrollbar>
          <AppVerticalMenu routesConfig={routesConfig} />
        </StyledAppBitbucketScrollbar>
      </StyledAppBitbucketSidebar>
    );
  };

  return (
    <>
      <StyledAppBitbucketDrawer
        placement={direction === LayoutDirection.LTR ? 'left' : 'right'}
        closable={false}
        onClose={onClose}
        open={visible}
      >
        <StyledAppBitbucketSidebarWrapper className="app-BitBucket-sidebar-wrapper">
          <BucketMinibar />
          {sideBarComponent()}
        </StyledAppBitbucketSidebarWrapper>
      </StyledAppBitbucketDrawer>
      <StyledAppBitbucketSidebarWrapper
        className={clsx('app-BitBucket-sidebar-wrapper', {
          'app-BitBucket-sidebar-wrapper-close': isSidebarClosed,
        })}
      >
        <BucketMinibar />
        {sideBarComponent()}
        <StyledBitbucketBtn onClick={onSidebarClosed}>
          {isSidebarClosed ? <MdKeyboardArrowRight /> : <MdKeyboardArrowLeft />}
        </StyledBitbucketBtn>
      </StyledAppBitbucketSidebarWrapper>
    </>
  );
};

export default AppSidebar;
