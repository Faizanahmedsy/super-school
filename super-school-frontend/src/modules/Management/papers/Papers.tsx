import { Space, Table } from 'antd';

import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import { FaRegEdit } from 'react-icons/fa';
import { IoEyeOutline } from 'react-icons/io5';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

const Papers = () => {
  const { messages } = useIntl();
  const navigate = useNavigate();
  const columns = [
    {
      title: 'Sr. No',
      dataIndex: 'srNo',
      key: 'srNo',
    },
    {
      title: 'Assessment',
      dataIndex: 'exam',
      key: 'exam',
    },
    {
      title: 'Set Of Papers',
      dataIndex: 'setofpapper',
      key: 'setofpapper',
    },
    {
      title: 'Standard',
      dataIndex: 'standard',
      key: 'standard',
    },
    {
      title: 'Assessment Date',
      dataIndex: 'examdate',
      key: 'examdate',
    },
    {
      title: 'Division',
      dataIndex: 'division',
      key: 'division',
    },
    {
      title: 'Instructor',
      dataIndex: 'instructor',
      key: 'instructor',
    },
    {
      title: 'Course Year',
      dataIndex: 'courseBatch',
      key: 'courseBatch',
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <span onClick={() => detailsPage()} className="viewAntIcon">
            <IoEyeOutline size={18} />
          </span>
          <span className="EditAntIcon">
            <FaRegEdit size={18} />
          </span>
          <span className="DeleteAntIcon">
            <RiDeleteBin6Line size={18} />
          </span>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      srNo: 1,
      exam: 'Assessment 1',
      setofpapper: 5,
      standard: 'Div-A',
      examdate: '1/2/2024',
      division: 'Div-A',
      instructor: 'Jane Cooper',
      courseBatch: 'Commerce',
    },
    {
      key: '2',
      srNo: 2,
      exam: 'Assessment 2',
      setofpapper: 10,
      standard: 'Div-B',
      examdate: '3/4/2024',
      division: 'Div-B',
      instructor: 'Wade Warren',
      courseBatch: 'Science',
    },
    {
      key: '3',
      srNo: 3,
      exam: 'Assessment 3',
      setofpapper: 6,
      standard: 'Div-C',
      examdate: '5/6/2024',
      division: 'Div-A',
      instructor: 'Cameron Williamson',
      courseBatch: 'Arts',
    },
    {
      key: '4',
      srNo: 4,
      exam: 'Assessment 4',
      setofpapper: 40,
      standard: 'Div-D',
      examdate: '6/8/2024',
      division: 'Div-B',
      instructor: 'Leslie Alexander',
      courseBatch: 'Marketing',
    },
    {
      key: '5',
      srNo: 5,
      exam: 'Assessment 5',
      setofpapper: 20,
      standard: 'Div-E',
      examdate: '4/3/2024',
      division: 'Div-A',
      instructor: 'Robert Fox',
      courseBatch: 'Lorem ipsum',
    },
  ];

  const detailsPage = () => {
    navigate('/papers/details');
  };

  return (
    <>
      <AppPageMeta title="Papers" />
      <AppsContainer title={messages['sidebar.NSE.Papers']} fullView type="bottom">
        <Table scroll={{ x: 1500 }} columns={columns} dataSource={data} />
      </AppsContainer>
    </>
  );
};

export default Papers;
