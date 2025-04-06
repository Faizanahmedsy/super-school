import clsx from 'clsx';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import { useThemeContext } from '@/app/context/AppContextProvider/ThemeContextProvider';
import React from 'react';

import logo from '../../../../../assets/icon/logo.svg';
import { StyledCrUserInfo } from './index.styled';
import { useNavigate } from 'react-router-dom';
import useGlobalState from '@/store';
import LazyImage from '@/components/custom/images/LazyImage';
type UserInfoProps = {
  hasColor?: boolean;
};
const UserInfo: React.FC<UserInfoProps> = ({ hasColor }) => {
  const navigate = useNavigate();
  const { themeMode } = useThemeContext();
  const { sidebarColorSet } = useSidebarContext();
  const { allowSidebarBgImage } = useSidebarContext();

  const isSetUpWizardCompleted = useGlobalState((state) => state.isSetUpWizardCompleted);

  return (
    <>
      {hasColor ? (
        <StyledCrUserInfo
          style={{
            backgroundColor: allowSidebarBgImage ? '' : sidebarColorSet.sidebarHeaderColor,
            color: sidebarColorSet.sidebarTextColor,
          }}
          className={clsx('cr-user-info', {
            light: themeMode === 'light',
          })}
        >
          {/* <img
            src={logo}
            alt="logo"
            height="200"
            width="200"
            loading="lazy"
            decoding="async"
          /> */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              if (isSetUpWizardCompleted) {
                navigate('dashboard');
              }
            }}
          >
            <LazyImage src={logo} alt="description" width={180} />
          </div>
        </StyledCrUserInfo>
      ) : (
        <StyledCrUserInfo
          className={clsx('cr-user-info', {
            light: themeMode === 'light',
          })}
        >
          <></>
        </StyledCrUserInfo>
      )}
    </>
  );
};

export default UserInfo;
