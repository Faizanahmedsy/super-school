import { ChangePassword, PersonalInfo } from '@/modules/Profile/UserProfile';
import type { TabsProps } from 'antd';
import { Tabs } from 'antd';

const UserProfile = () => {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Personal Info',
      children: <PersonalInfo />,
    },
    {
      key: '2',
      label: 'Change Password',
      children: <ChangePassword />,
    },
  ];

  const onChange = (key: string) => {};

  return <Tabs className="border-none" defaultActiveKey="1" items={items} onChange={onChange} />;
};
export default UserProfile;
