import { Dropdown } from 'antd';
import AppLogo from '../components/AppLogo';
import { useIntl } from 'react-intl';

import AppNotifications from '../../AppNotifications';
import { FiMoreVertical } from 'react-icons/fi';
import { AiOutlineMenu } from 'react-icons/ai';
import {
  StyledDrawerLayoutHeader,
  StyledDrawerLayoutHeaderDesk,
  StyledDrawerLayoutHeaderMobile,
  StyledDrawerLayoutHeaderSearch,
} from './index.styled';
import { StyledDropdownWrapper } from '../index.styled';

const items = [{ key: 2, label: <AppNotifications /> }];

type AppHeaderProps = {
  showDrawer: () => void;
};

const AppHeader = ({ showDrawer }: AppHeaderProps) => {
  const { messages } = useIntl();

  return (
    <StyledDrawerLayoutHeader>
      <a className="trigger" onClick={showDrawer}>
        <AiOutlineMenu />
      </a>
      <AppLogo />
      <StyledDrawerLayoutHeaderSearch placeholder={messages['common.searchHere'] as string} />
      <StyledDrawerLayoutHeaderDesk>
        <AppNotifications />
      </StyledDrawerLayoutHeaderDesk>
      <StyledDrawerLayoutHeaderMobile>
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
      </StyledDrawerLayoutHeaderMobile>
    </StyledDrawerLayoutHeader>
  );
};

export default AppHeader;
