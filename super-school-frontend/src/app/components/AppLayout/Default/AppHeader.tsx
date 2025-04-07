import UISelect from '@/components/global/Form/v4/UISelect';
import MasterSchoolSelector from '@/components/global/MasterSchoolSelect';
import { useListOption } from '@/hooks/use-select-option';
import { capitalizeFirstLetter, capitalizeFirstLetterForBothWords } from '@/lib/common-functions';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { removeItem } from '@/lib/localstorage';
import HelpAndSupport from '@/modules/HelpAndSupport/components/HelpAndSupport';
import { useCityList } from '@/services/city/city.hook';
import { useInstituteList } from '@/services/management/institute/institute.hook';
import { useNotificationReadAll } from '@/services/notification/notification.hook';
import { useStateList } from '@/services/state/state.hook';
import useGlobalState from '@/store';
import useSubjectStore from '@/store/secondary-store';
import grArlogo from '../../../../../public/new/grAidarLogoFinalCropped.png';

import React, { useEffect, useState } from 'react';
import { Dropdown, Form, Modal, Select, Space } from 'antd';
import { FaAngleDown, FaRegUser, FaUserCircle } from 'react-icons/fa';
import { MdClose, MdMenu, MdOutlineLogout } from 'react-icons/md';
import { PiSidebarSimpleDuotone } from 'react-icons/pi';
import { Link, useNavigate } from 'react-router-dom';
import AppNotifications from '../../AppNotifications';
import { allowMultiLanguage } from '@/app/constants/AppConst';
import AppLanguageSwitcher from '../../AppLanguageSwitcher';
import { StyledAppHeader } from './index.styled';
import { Globe, Languages } from 'lucide-react';
import UIText from '@/components/global/Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import ParentsLearnerSelector from '@/components/global/ParentsChildren';

type Props = {
  onToggleSidebar: (isCollapsed: boolean) => void;
  isCollapsed: boolean;
};

const AppHeader: React.FC<Props> = ({ isCollapsed, onToggleSidebar }) => {
  //  LOCAL STATES ---------------------
  // const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [selectedCity, setSelectedCity] = React.useState<number | undefined>(undefined);
  const [selectedState, setSelectedState] = React.useState<number | undefined>(undefined);
  const [fireNotiReadAll, setFireNotiReadAll] = React.useState(false);
  const [learnerName, setLearnerName] = React.useState<string>('');

  const resetSubjects = useSubjectStore((state) => state.resetSubjects);

  //  GLOBAL STATES ---------------------
  const resetState = useGlobalState((state) => state.resetState);
  const user = useGlobalState((state) => state.user);
  const roleName = user?.role_name;
  const masterSchool = useGlobalState((state) => state.masterSchool);
  const setMasterSchool = useGlobalState((state) => state.setMasterSchool);
  const isSetUpWizardCompleted = useGlobalState((state) => state.isSetUpWizardCompleted);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleLearner, setIsModalVisibleLearner] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  let setStudentId = useGlobalState((state) => state.setStudentId);

  const studentId = useGlobalState((state) => state.student_id);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const notificationReadAll = useNotificationReadAll();

  const stateQuery = useStateList({});

  const cityQuery = useCityList({
    state_id: selectedState,
  });

  const instituteQuery = useInstituteList(
    {
      district_id: selectedCity,
      province_id: selectedState,
      sort: 'asc',
    },
    Boolean(
      user?.role_name === String(ROLE_NAME.SUPER_ADMIN) || user?.role_name === String(ROLE_NAME.DEPARTMENT_OF_EDUCATION)
    )
  );

  // GET OPTIONS FOR SELECT COMPONENTS ---------------------
  const { options: stateOptions } = useListOption({
    listData: stateQuery?.data,
    labelKey: 'province_name',
    valueKey: 'id',
  });

  const { options: cityOptions } = useListOption({
    listData: cityQuery?.data,
    labelKey: 'district_name',
    valueKey: 'id',
  });

  // SIDE EFFECTS ---------------------
  // useEffect(() => {
  //   setSelectedCity(undefined);
  //   setSelectedState(undefined);
  // }, [isModalVisible]);

  useEffect(() => {
    if (user.role_name == ROLE_NAME.PARENT) {
      setStudentId(user.details.students[0].id);
    }
  }, []);

  useEffect(() => {
    // IF THERE IS A LIST OF SCHOOLS AND MASTER SCHOOL IS NOT SET YET THEN SET THE FIRST SCHOOL AS MASTER SCHOOL
    if (instituteQuery?.data?.list && instituteQuery?.data?.list.length && !masterSchool?.id) {
      const firstSchool = instituteQuery?.data?.list[0];

      // SET THE FIRST SCHOOL AS MASTER SCHOOL
      setMasterSchool({
        ...firstSchool, // Spread all properties from the school object
        id: firstSchool.id,
        name: firstSchool.school_name,
        cur_batch: firstSchool.cur_batch,
      });

      // SET SELECTED SCHOOL STATE FOR THE SELECT COMPONENT

      form.setFieldsValue({ school: firstSchool.id });
    }
  }, [instituteQuery?.data?.list]);

  useEffect(() => {
    if (user?.details?.students?.length) {
      const firstStudentId = user.details.students[0].id;
      form.setFieldsValue({ learner: firstStudentId });
      setLearnerName(`${user?.details?.students[0]?.first_name} ${user?.details?.students[0]?.last_name}`);
    }
  }, [user?.details?.students, form]);

  // FUNCTIONS ---------------------

  const onFinish = (payload: any) => {
    const selectedSchoolDetails = instituteQuery?.data?.list?.find((school) => school.id === payload.school);

    setMasterSchool({
      ...selectedSchoolDetails, // Spread all properties from the school object
      id: selectedSchoolDetails?.id,
      name: selectedSchoolDetails?.school_name,
      cur_batch: selectedSchoolDetails?.cur_batch,
    });
    setIsModalVisible(false);
  };

  const onFinishLearner = (payload: any) => {
    setLearnerName(payload.learnerName);
    const id = payload.learnerId;
    setStudentId(id);
    setIsModalVisibleLearner(false);
  };

  const onLogout = () => {
    Modal.confirm({
      centered: true,
      title: 'Are you sure you want to logout?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        resetSubjects();
        resetState();
        navigate('/signin');
        removeItem('access_token');
        removeItem('role');
        removeItem('role_access');
      },
    });
  };

  return (
    <>
      <StyledAppHeader className="bg-white shadow-md px-4 py-3 flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
            onClick={() => onToggleSidebar(!isCollapsed)}
          >
            <PiSidebarSimpleDuotone size={24} />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4 sm:gap-2 md:gap-2">
          {(user?.role_name === ROLE_NAME.SUPER_ADMIN || user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION) && (
            <MasterSchoolSelector school={masterSchool?.name} onOpenSchoolModal={() => setIsModalVisible(true)} />
          )}

          {isSetUpWizardCompleted === true && (
            <>
              {user?.cur_batch?.start_year && (
                <div className="flex justify-center items-center">
                  <span className="md:px-4 md:py-2 rounded-full bg-secondary text-primary text-sm font-semibold shadow-md transition-transform transform  hidden md:block">
                    <span className="flex">
                      <UIText>Current Year</UIText>: {user.cur_batch.start_year}
                    </span>
                  </span>
                  <span className="px-2 rounded-full bg-secondary text-primary text-sm font-semibold shadow-md transition-transform transform  block md:hidden">
                    {user.cur_batch.start_year}
                  </span>
                </div>
              )}

              {user?.role_name === ROLE_NAME.PARENT && (
                <ParentsLearnerSelector
                  learnerName={learnerName}
                  onOpenSchoolModal={() => setIsModalVisibleLearner(true)}
                />
              )}

              <div onClick={() => notificationReadAll.mutate()}>
                <AppNotifications />
              </div>
            </>
          )}

          {allowMultiLanguage && <AppLanguageSwitcher />}
          <Dropdown
            menu={{
              items: [
                {
                  key: 1,
                  label: (
                    <div
                      className="flex items-center gap-3 p-2 pb-0 cursor-pointer"
                      onClick={() => navigate('/my-profile')}
                    >
                      <FaRegUser /> <UIText>My Profile</UIText>
                    </div>
                  ),
                },
                {
                  key: 2,
                  label: (
                    <div className="py-1">
                      <HelpAndSupport />
                    </div>
                  ),
                },
                {
                  key: 3,
                  label: (
                    <div className="flex items-center gap-3 p-2 cursor-pointer" onClick={onLogout}>
                      <MdOutlineLogout /> <UIText>Logout</UIText>
                    </div>
                  ),
                },
              ],
            }}
          >
            <Space className="cursor-pointer">
              {/* <FaUserCircle size={35} /> */}
              {user?.details?.profile_image ? (
                <>
                  <img src={user?.details?.profile_image} alt="Profile Picture" className="w-12 h-12 rounded-full" />
                </>
              ) : (
                <>
                  <FaUserCircle size={35} />
                </>
              )}
              {user?.details?.first_name
                ? `${capitalizeFirstLetter(user?.details?.first_name)} ${capitalizeFirstLetter(user?.details?.last_name)}`
                : capitalizeFirstLetterForBothWords(user?.role_name_show) || 'Super Admin'}
              <FaAngleDown />
            </Space>
          </Dropdown>
          {!isMobileMenuOpen && (
            <img
              src={grArlogo}
              alt="Company Logo"
              className="h-10 opacity-75 hover:opacity-100 transition-opacity duration-200 p-0 m-0"
            />
          )}
        </div>

        {isMobileMenuOpen && (
          <img
            src={grArlogo}
            alt="Company Logo"
            className="h-10 opacity-75 hover:opacity-100 transition-opacity duration-200 p-0 m-0"
          />
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-md p-4 flex flex-col gap-3 md:hidden">
            {/* <div className="mb-0">
              <img
                src={grArlogo}
                alt="Company Logo"
                className="h-10 opacity-75 hover:opacity-100 transition-opacity duration-200 p-0 m-0"
              />
            </div> */}
            <div className="flex start">
              {user?.role_name === ROLE_NAME.SUPER_ADMIN && (
                <MasterSchoolSelector school={masterSchool?.name} onOpenSchoolModal={() => setIsModalVisible(true)} />
              )}
            </div>

            <div className="flex flex-start">
              {isSetUpWizardCompleted === true && (
                <div className="flex flex-col">
                  <div className="ps-2" onClick={() => notificationReadAll.mutate()}>
                    <AppNotifications />
                  </div>
                </div>
              )}
            </div>
            <div className="w-full ps-2 flex items-center gap-5">
              <Languages size={18} />
              {allowMultiLanguage && <AppLanguageSwitcher />}
            </div>
            <div>
              <HelpAndSupport />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-2 cursor-pointer" onClick={() => navigate('/my-profile')}>
                <FaRegUser /> <UIText>My Profile</UIText>
              </div>
              <div className="flex items-center gap-3 p-2 cursor-pointer" onClick={onLogout}>
                <MdOutlineLogout /> <UIText>Logout</UIText>
              </div>
            </div>
          </div>
        )}
      </StyledAppHeader>
      <Modal
        open={isModalVisible}
        centered
        onClose={() => setIsModalVisible(false)}
        title={
          <>
            <UIText>Select School</UIText>
          </>
        }
        onCancel={() => {
          setIsModalVisible(false);
        }}
        onOk={form.submit}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <div className="grid grid-cols-2 gap-4">
            <CustomFormItem label="Filter by Province">
              <UISelect
                allowClear
                showSearch
                filterOption={(input: string, option: { label: string }) =>
                  option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Select Province"
                options={stateOptions}
                onChange={(value: any) => setSelectedState(value)}
              />
            </CustomFormItem>
            <CustomFormItem label="Filter by District">
              <UISelect
                allowClear
                showSearch
                filterOption={(input: string, option: { label: string }) =>
                  option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Select a District"
                options={cityOptions}
                onChange={(value: any) => setSelectedCity(value)}
              />
            </CustomFormItem>
          </div>
          <CustomFormItem label="Select School" name={'school'}>
            <Select
              allowClear
              placeholder="Select a School"
              showSearch
              filterOption={(input: any, option: any) =>
                option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
              options={
                instituteQuery?.data?.list
                  ? instituteQuery.data.list
                      // .filter((item: any) => item?.setup) // Exclude items where setup is false // NOTE: commented for now becasue client wanted all schools in the navbar school dropdown date 14/02/2025
                      .map((item) => ({
                        label: item.school_name,
                        value: item.id, // Using the ID directly
                      }))
                  : []
              }
            />
          </CustomFormItem>
        </Form>
      </Modal>

      <Modal
        open={isModalVisibleLearner}
        centered
        onClose={() => setIsModalVisibleLearner(false)}
        onCancel={() => setIsModalVisibleLearner(false)}
        onOk={() => form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={(values) => {
            const selectedStudent: any = user?.details?.students?.find((item: any) => item.id === values.learner);

            const learnerData = {
              learnerId: values.learner,
              learnerName: selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : '',
            };

            onFinishLearner(learnerData);
          }}
        >
          <CustomFormItem label="Select Learner" name="learner">
            <Select
              allowClear
              placeholder="Select a Learner"
              showSearch
              options={
                user?.details?.students
                  ? user?.details?.students.map((item: any) => ({
                      label: `${item.first_name} ${item.last_name}`,
                      value: item.id,
                    }))
                  : []
              }
            />
          </CustomFormItem>
        </Form>
      </Modal>
    </>
  );
};

export default AppHeader;
