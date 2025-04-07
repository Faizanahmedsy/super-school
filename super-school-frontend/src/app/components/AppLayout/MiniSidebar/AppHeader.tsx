import { Dropdown } from 'antd';
import { FiMoreVertical } from 'react-icons/fi';
import AppLogo from '../components/AppLogo';
import { useIntl } from 'react-intl';

import AppNotifications from '../../AppNotifications';
import {
  StyledAppHeaderMini,
  StyledAppHeaderMiniSecDesktop,
  StyledAppHeaderMiniSecMobile,
  StyledHeaderSearchMini,
} from './index.styled';
import { StyledDropdownWrapper } from '../index.styled';

const items = [{ key: 2, label: <AppNotifications /> }];

const AppHeader = () => {
  const { messages } = useIntl();

  return (
    <StyledAppHeaderMini className="app-header-mini">
      <AppLogo />

      <StyledHeaderSearchMini placeholder={messages['common.searchHere'] as string} />
      <StyledAppHeaderMiniSecDesktop>
        <AppNotifications />
      </StyledAppHeaderMiniSecDesktop>
      <StyledAppHeaderMiniSecMobile>
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
      </StyledAppHeaderMiniSecMobile>
    </StyledAppHeaderMini>
  );
};

export default AppHeader;
