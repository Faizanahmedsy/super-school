import { Dropdown } from 'antd';
import AppLogo from '../components/AppLogo';
import { useIntl } from 'react-intl';

import AppNotifications from '../../AppNotifications';
import { FiMoreVertical } from 'react-icons/fi';
import { AiOutlineMenu } from 'react-icons/ai';

import {
  StyledAppUserHeader,
  StyledAppUserHeaderSearch,
  StyledAppUserHeaderSectionDesktop,
  StyledAppUserHeaderSectionMobile,
} from './index.styled';
import { StyledDropdownWrapper } from '../index.styled';

const items = [{ key: 2, label: <AppNotifications /> }];

type AppHeaderProps = {
  onToggleSidebar: (isCollapsed: boolean) => void;
  isCollapsed: boolean;
};

const AppHeader = ({ isCollapsed, onToggleSidebar }: AppHeaderProps) => {
  const { messages } = useIntl();

  return (
    <StyledAppUserHeader>
      <a className="trigger" onClick={() => onToggleSidebar(!isCollapsed)}>
        <AiOutlineMenu />
      </a>
      <AppLogo />
      <StyledAppUserHeaderSearch placeholder={messages['common.searchHere'] as string} />
      <StyledAppUserHeaderSectionDesktop>
        <AppNotifications />
      </StyledAppUserHeaderSectionDesktop>

      <StyledAppUserHeaderSectionMobile>
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
      </StyledAppUserHeaderSectionMobile>
    </StyledAppUserHeader>
  );
};

export default AppHeader;
