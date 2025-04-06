import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React from 'react';

const ProfileImageAvatar = ({ info }: { info: any }) => {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = info?.getValue?.() || null || undefined;

  return (
    <>
      {!imageError && imageUrl ? (
        <img
          className="rounded-full w-[50px] h-[50px]  object-cover"
          src={imageUrl}
          alt="Profile"
          onError={() => setImageError(true)}
        />
      ) : (
        <Avatar size={50} icon={<UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} />
      )}
    </>
  );
};

export default ProfileImageAvatar;
