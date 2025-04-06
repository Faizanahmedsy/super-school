import React from 'react';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { StyledAppLogo } from './index.styled';
import logo from '@/assets/icon/logo.svg';

type AppLogoProps = {
  hasSidebarColor?: boolean;
};
const AppLogo: React.FC<AppLogoProps> = ({ hasSidebarColor }) => {
  const { sidebarColorSet } = useSidebarContext();
  return (
    <StyledAppLogo>
      {hasSidebarColor && sidebarColorSet.mode === 'dark' ? (
        <img src={''} alt="app-logo" />
      ) : (
        <img src={logo} alt="app-logo" />
      )}
    </StyledAppLogo>
  );
};

export default AppLogo;
