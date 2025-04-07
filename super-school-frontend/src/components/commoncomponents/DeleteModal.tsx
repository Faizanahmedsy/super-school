'use client';

import { Modal } from 'antd';
import React from 'react';

const DeleteModal = ({
  isOpen,
  okfunction,
  onHide,
}: {
  isOpen: boolean;
  okfunction: () => void;
  onHide: () => void;
}) => {
  const handleOk = (e: React.MouseEvent) => {
    e.stopPropagation();
    okfunction();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHide();
  };
  return (
    <Modal
      className="z-50"
      centered
      title={
        <>
          <div onClick={(e) => e.stopPropagation()}>Are you sure you want to delete this?</div>
        </>
      }
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Ok"
      cancelText="Cancel"
    ></Modal>
  );
};

export default DeleteModal;
