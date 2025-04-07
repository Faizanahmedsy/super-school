import React from 'react';
import { Layout } from 'antd';
import { ThemeMode } from '@/app/constants/AppEnums';
import { useThemeContext } from '@/app/context/AppContextProvider/ThemeContextProvider';
import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';

const { Sider } = Layout;

type Props = {
  children: React.ReactNode;
  className?: string;
  collapsed?: boolean | any;
  [key: string]: any;
};
const MainSidebar: React.FC<Props> = ({ children, className, collapsed = false, ...props }) => {
  const { themeMode } = useThemeContext();
  const { sidebarColorSet, allowSidebarBgImage, sidebarBgImageId } = useSidebarContext();

  return (
    <Sider
      theme={themeMode === ThemeMode.LIGHT ? ThemeMode.LIGHT : ThemeMode.DARK}
      breakpoint="lg"
      className={className}
      style={{
        backgroundColor: sidebarColorSet.sidebarBgColor,
        color: sidebarColorSet.sidebarTextColor,
        backgroundImage: allowSidebarBgImage ? `url(/assets/images/sidebar/images/${sidebarBgImageId}.png)` : '',
      }}
      collapsed={collapsed}
      {...props}
    >
      {children}
    </Sider>
  );
};

export default MainSidebar;
