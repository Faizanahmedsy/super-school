import { Dropdown } from 'antd';
import { FiMoreVertical } from 'react-icons/fi';
import AppLogo from '../components/AppLogo';
import { useIntl } from 'react-intl';

import AppNotifications from '../../AppNotifications';

import {
  StyledAppUserMinibar,
  StyledUserMiniHeaderSearch,
  StyledUserMiniSectionDesktop,
  StyledUserMiniSectionMobile,
} from './index.styled';
import { StyledDropdownWrapper } from '../index.styled';

const items = [{ key: 2, label: <AppNotifications /> }];

const AppHeader = () => {
  const { messages } = useIntl();

  return (
    <StyledAppUserMinibar className="app-userMiniHeader">
      <AppLogo />

      <StyledUserMiniHeaderSearch placeholder={messages['common.searchHere'] as string} />
      <StyledUserMiniSectionDesktop>
        <AppNotifications />
      </StyledUserMiniSectionDesktop>

      <StyledUserMiniSectionMobile>
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
      </StyledUserMiniSectionMobile>
    </StyledAppUserMinibar>
  );
};

export default AppHeader;
