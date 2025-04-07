import { Form, Modal, Tabs } from 'antd';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useAddReport } from '../action/help-and-support.action';
import RaiseIssue from './RaiseIssue/RaiseIssue';
import VideoTutorials from './Video/VideoTutorials';
import { FaqSectionDemo } from './FAQ/FAQSection';
import UIText from '@/components/global/Text/UIText';
import useGlobalState from '@/store';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

export default function HelpAndSupport() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const user = useGlobalState((state) => state.user);

  //  QUERIES
  const addReport = useAddReport();

  const items: any = [
    user?.role_name !== ROLE_NAME.SUPER_ADMIN && {
      key: '1',
      label: (
        <>
          <UIText>Raise an Issue</UIText>
        </>
      ),
      children: (
        <RaiseIssue
          form={form}
          fileList={fileList}
          setFileList={setFileList}
          addReport={addReport}
          setOpenModal={setOpenModal}
        />
      ),
    },

    {
      key: '2',
      label: (
        <>
          <UIText>Video Tutorials</UIText>
        </>
      ),
      children: (
        <>
          <VideoTutorials />
        </>
      ),
    },
    {
      key: '3',
      label: (
        <>
          <UIText>FAQs</UIText>
        </>
      ),
      children: (
        <>
          <div className="py-4">
            <FaqSectionDemo />
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <div>
        <button
          onClick={() => setOpenModal(true)}
          className="p-2 w-full rounded-full mb-0 pb-0  shadow-sm flex gap-2.5 justify-start items-center"
          aria-label="Help and Support"
        >
          <HelpCircle size={16} />
          <UIText>Help</UIText>
        </button>
      </div>
      <Modal
        open={openModal}
        centered
        title={
          <>
            <UIText>Help and Support</UIText>
          </>
        }
        onCancel={() => {
          setFileList([]);
          form.resetFields();
          setOpenModal(false);
        }}
        width={1000}
        okButtonProps={{
          loading: addReport.isPending,
        }}
        onOk={() => {
          form.submit();
        }}
        footer={null}
      >
        <Tabs defaultActiveKey="1" items={items} />
      </Modal>
    </>
  );
}
