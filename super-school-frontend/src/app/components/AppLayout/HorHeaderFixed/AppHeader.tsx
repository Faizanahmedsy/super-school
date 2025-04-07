import { Dropdown } from 'antd';
import { FiMoreVertical } from 'react-icons/fi';
import AppLogo from '../components/AppLogo';
import { useIntl } from 'react-intl';

import AppNotifications from '../../AppNotifications';
import { AiOutlineMenu } from 'react-icons/ai';

import { useSidebarContext } from '@/app/context/AppContextProvider/SidebarContextProvider';
import {
  StyledAppHeaderHorFixed,
  StyledAppHeaderHorFixedMain,
  StyledAppHeaderHorMainFlex,
  StyledAppHorizontalNav,
  StyledContainer,
  StyledHeaderHorFixedSecDesktop,
  StyledHeaderHorFixedSecMobile,
  StyledHeaderSearchHorFixed,
} from './index.styled';
import { StyledDropdownWrapper } from '../index.styled';

import { RouterConfigData } from '../../../types/models/Apps';

const items = [{ key: 2, label: <AppNotifications /> }];

type AppHeaderProps = {
  showDrawer: () => void;
  routesConfig: RouterConfigData[];
};

const AppHeader = ({ showDrawer, routesConfig }: AppHeaderProps) => {
  const { messages } = useIntl();
  const { sidebarColorSet } = useSidebarContext();

  return (
    <StyledAppHeaderHorFixed
      style={{
        backgroundColor: sidebarColorSet.sidebarBgColor,
        color: sidebarColorSet.sidebarTextColor,
      }}
    >
      <StyledAppHeaderHorFixedMain>
        <StyledContainer className="container">
          <StyledAppHeaderHorMainFlex>
            <a className="trigger" onClick={showDrawer}>
              <AiOutlineMenu />
            </a>
            <AppLogo hasSidebarColor />
            <StyledAppHorizontalNav routesConfig={routesConfig} />
            <StyledHeaderSearchHorFixed placeholder={messages['common.searchHere'] as string} />

            <StyledHeaderHorFixedSecDesktop>
              <AppNotifications />
            </StyledHeaderHorFixedSecDesktop>

            <StyledHeaderHorFixedSecMobile>
              <StyledDropdownWrapper>
                <Dropdown
                  menu={{ items }}
                  overlayClassName="dropdown-wrapper"
                  getPopupContainer={(triggerNode) => triggerNode}
                  trigger={['click']}
                >
                  <a className="ant-dropdown-link-mobile" onClick={(e) => e.preventDefault()}>
                    <FiMoreVertical />
                  </a>
                </Dropdown>
              </StyledDropdownWrapper>
            </StyledHeaderHorFixedSecMobile>
          </StyledAppHeaderHorMainFlex>
        </StyledContainer>
      </StyledAppHeaderHorFixedMain>
    </StyledAppHeaderHorFixed>
  );
};

export default AppHeader;
