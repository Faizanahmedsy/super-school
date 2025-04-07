import IntlMessages from '@/app/helpers/IntlMessages';
import { useNotificationList, useUnReadNotificationList } from '@/services/notification/notification.hook';
import { Dropdown } from 'antd';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  StyledDrowdownWrapper,
  StyledNotifyButtonAll,
  StyledNotifyIcon,
  StyledNotifyLink,
  StyledNotifyList,
  StyledNotifyScrollSubmenu,
  StyledNotifyText,
} from './index.styled';
import NotificationItem from './NotificationItem';
import React, { useEffect, useState } from 'react';
import useGlobalState from '@/store';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
// import { connectSockets, emitEvent, subscribeToEvent } from '@/services/socket/socket';
import { debounce } from 'lodash';
import { useSockets } from '@/services/socket/socket';

// Styled component for notification count badge
const NotificationBadge = styled.span`
  position: absolute;
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  background: #ff505d;
  width: 25px;
  height: 25px;
  border-radius: 100%;
  right: -13px;
  border: 2px solid #fff;
  top: -14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotifyIconWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const AppNotifications = () => {
  const school_id = useRoleBasedSchoolId();
  const navigate = useNavigate();

  const unReadNotification = useUnReadNotificationList({});
  const notificationQuery = useNotificationList({});
  const [notiCount, setNotiCount] = useState<number>(0);
  const { emitEvent, subscribeToEvent, activeServerUrl } = useSockets();

  useEffect(() => {
    // connectSockets();
    // const fetchUnreadNotifications = debounce(() => {}, 1000);

    // subscribeToEvent('notification_test', (data: any) => {
    //   console.log('data: ' + data);

    //   if (data?.school_id == school_id) {
    //     setNotiCount(notifications_count);
    //   }
    // });

    subscribeToEvent('notification_test', (data) => {
      unReadNotification.refetch();
      setNotiCount(unReadNotification?.data?.count);
    });

    // return () => {
    //   fetchUnreadNotifications.cancel();
    // };
  }, [school_id, subscribeToEvent]);

  useEffect(() => {
    setNotiCount(unReadNotification?.data?.count);
  }, [unReadNotification?.data?.count]);

  useEffect(() => {
    setNotiCount(notificationQuery?.data?.unreadCount || 0);
  }, [notificationQuery?.data?.unreadCount]);

  // Handle notification click (mark as read)
  const handleNotificationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setNotiCount(0);
    // emitEvent('notification_test'); // Emit event to reset notifications
  };

  const items = [
    {
      key: 1,
      label: (
        <div className="pt-2 ps-3">
          <IntlMessages id="common.notifications" /> ({notiCount})
          <hr />
        </div>
      ),
    },
    {
      key: 2,
      label: (
        <StyledNotifyScrollSubmenu>
          <StyledNotifyList
            dataSource={notificationQuery?.data?.list}
            renderItem={(item: any) => <NotificationItem key={item.id} item={item} />}
          />
        </StyledNotifyScrollSubmenu>
      ),
    },
    {
      key: 3,
      label: (
        <StyledNotifyButtonAll type="primary" onClick={() => navigate('/notifications')}>
          <IntlMessages id="common.viewAll" />
        </StyledNotifyButtonAll>
      ),
    },
  ];

  return (
    <StyledDrowdownWrapper>
      <Dropdown
        menu={{ items }}
        className="dropdown"
        overlayClassName="header-notify-messages"
        getPopupContainer={(triggerNode) => triggerNode}
        trigger={['click']}
      >
        <StyledNotifyLink href="#" onClick={handleNotificationClick}>
          <NotifyIconWrapper>
            <StyledNotifyIcon>
              <IoIosNotificationsOutline />
            </StyledNotifyIcon>
            {notiCount > 0 && <NotificationBadge>{notiCount}</NotificationBadge>}
          </NotifyIconWrapper>
          <StyledNotifyText>
            <div className="flex gap-2 items-center p-0">
              <IoIosNotificationsOutline size={20} />
              <IntlMessages id="common.notifications" />
            </div>
          </StyledNotifyText>
        </StyledNotifyLink>
      </Dropdown>
    </StyledDrowdownWrapper>
  );
};

export default AppNotifications;
