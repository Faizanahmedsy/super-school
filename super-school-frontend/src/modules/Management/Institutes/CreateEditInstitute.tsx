import UILoader from '@/components/custom/loaders/UILoader';
import PageTitle from '@/components/global/PageTitle';
import { displayError } from '@/lib/helpers/errorHelpers';
import {
  useCreateInstitute,
  useInstituteDetails,
  useUpdateInstitute,
} from '@/services/management/institute/institute.hook';
import { useCreateAdmin, useUpdateAdminNew } from '@/services/master/admin/admin.hook';
import { AddAdminPayload } from '@/services/types/payload';
import useGlobalState from '@/store';
import { Form } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminFormStep from './AdminFormStep';
import InstituteFormStep from './InstituteFormStep';
import { CreateEditInstituteProps, InstitutePayload } from './types';

const CreateEditInstitute: React.FC<CreateEditInstituteProps> = ({ editMode = false }) => {
  const [form] = Form.useForm();
  const params = useParams<{ id?: string }>();

  // const [loading, setLoading] = useState<boolean>(false);
  const [userImage, setUserImage] = useState<string>('/assets/images/placeholder.jpg');
  // const [step, setStep] = useState<number>(1);

  const setStep = useGlobalState((state) => state.setInstituteStep);
  const step = useGlobalState((state) => state.setinstitute_step_id);
  const navigate = useNavigate();

  // Institute API calls
  const addInstituteMutation = useCreateInstitute();
  const updateInstituteMutation = useUpdateInstitute();
  const getInstituteDetails: any = useInstituteDetails(Number(params?.id));

  // Admin API calls
  const addAdminMutation = useCreateAdmin();
  const { mutate: updateAdmin } = useUpdateAdminNew();
  // const { data: adminData } = useAdminGetDataById(Number(params?.id));

  // Populate form if editing
  // useEffect(() => {
  //   if (editMode && adminData) {
  //     form.setFieldsValue(adminData);
  //     setUserImage(adminData.profile_image);
  //   } else {
  //     form.resetFields();
  //   }
  // }, [editMode, adminData, form]);

  useEffect(() => {
    // setLoading(true);
    if (editMode && getInstituteDetails.isSuccess && step === 1) {
      form.setFieldsValue(getInstituteDetails?.data);
      // setLoading(false);
    }
  }, [editMode, getInstituteDetails.isSuccess, getInstituteDetails?.data]);

  // Handle form submission
  const handleSubmit = (payload: InstitutePayload | AddAdminPayload) => {
    if ('district_id' in payload && typeof payload.district_id === 'string') {
      payload.district_id = Number(payload.district_id);
    }

    if ('province_id' in payload && typeof payload.province_id === 'string') {
      payload.province_id = Number(payload.province_id);
    }

    // if ('mobile_number' in payload && typeof payload.mobile_number === 'string') {
    //   payload.mobile_number = Number(payload.mobile_number);
    // }

    if ('date_of_birth' in payload && payload.date_of_birth) {
      payload.date_of_birth = dayjs(payload.date_of_birth).format('YYYY-MM-DD');
    }
    if (step === 1) {
      handleInstituteSubmit(payload as InstitutePayload);
    } else {
      handleAdminSubmit(payload as AddAdminPayload);
    }
  };

  const handleInstituteSubmit = (payload: InstitutePayload) => {
    payload.max_users = Number(payload.max_users);
    if (editMode) {
      updateInstituteMutation.mutate(
        { id: Number(params?.id), payload },
        {
          onSuccess: () => {
            if (editMode) {
              navigate('/school/list');
            } else {
              setStep(2);
            }
          },
          onError: (error: any) => {
            displayError(error?.response?.data?.message);
          },
        }
      );
    } else {
      addInstituteMutation.mutate(payload, {
        onSuccess: () => {
          if (editMode) {
            navigate('/school/list');
          } else {
            setStep(2);
          }
        },
        onError: (error: any) => {
          displayError(error?.response?.data?.message);
        },
      });
    }
  };

  const handleAdminSubmit = (payload: AddAdminPayload) => {
    const school_id = JSON.parse(localStorage.getItem('school_id') || '');
    if (school_id) {
      payload.school_id = Number(school_id);
    }

    if (editMode) {
      updateAdmin(
        { id: Number(params?.id), payload },
        {
          onSuccess: () => {
            navigate('/school/list');
          },
        }
      );
    } else {
      addAdminMutation.mutate(payload, {
        onSuccess: () => {
          navigate('/school/list');
          localStorage.removeItem('school_id');
          setStep(1);
        },
        onError: (data: any) => {
          displayError(data.response.data.message);
        },
      });
    }
  };

  // if (loading) {
  //   return (
  //     <div className="grid place-content-center min-h-[70vh]">
  //       <UILoader />
  //     </div>
  //   );
  // }

  return (
    <>
      <PageTitle
        // extraItem={
        //   <UIFormSubmitButton onClick={form.submit} api={api}>
        //     {step === 1 ? "Next" : "Submit"}
        //   </UIFormSubmitButton>
        // }
        breadcrumbs={[
          { label: 'School List', href: '/school/list' },
          { label: `${editMode ? 'Edit' : 'Create'} School` },
        ]}
      >
        {`${editMode ? 'Edit' : 'Create'} School`}
      </PageTitle>

      {step === 1 && (
        <>
          {getInstituteDetails.isLoading ? (
            <div className="grid place-content-center min-h-[70vh]">
              <UILoader />
            </div>
          ) : (
            <>
              <InstituteFormStep
                form={form}
                handleSubmit={handleSubmit}
                editMode={editMode}
                apiMutation={editMode ? updateInstituteMutation : addInstituteMutation}
                provinceID={getInstituteDetails?.data?.province_id as number}
              />
            </>
          )}
        </>
      )}

      {step === 2 && (
        <AdminFormStep
          form={form}
          userImage={userImage}
          setUserImage={setUserImage}
          handleSubmit={handleSubmit}
          apiMutation={addAdminMutation}
        />
      )}
    </>
  );
};
export default CreateEditInstitute;
