import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import SelectGender from '@/components/global/Form/SelectGender';
import InstituteSelect from '@/components/global/Form/SelectInstitute';
import UIFormContainerV4 from '@/components/global/Form/v4/FormContainerv4';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { validationRules } from '@/lib/form_validations/form-validaton-rules';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import {
  StyledInfoUpload,
  StyledInfoUploadAvatar,
  StyledInfoUploadBtnView,
  StyledInfoUploadContent,
} from '@/modules/Profile/UserProfile/PersonalInfo/index.styled';

import { useAddAdminMutation, useAdminGetDataById, useUpdateAdmin } from '@/services/master/admin/admin.hook';
import { AddAdminPayload, EditAdminPayload } from '@/services/types/payload';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { DatePicker, Form, Input, Upload, Image as AntdImage } from 'antd';
import { UploadFile } from 'antd/lib';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useParams } from 'react-router-dom';

export default function CreateEditAdmin({ editMode = false }: { editMode?: boolean }) {
  const params = useParams();
  const [form] = Form.useForm();
  const [updateId, setUpdateId] = useState<any>();
  const [userImage, setUserImage] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const addAdmin = useAddAdminMutation();
  const queryclient = useQueryClient();
  const editAdmindata = useUpdateAdmin(updateId, queryclient);
  const navigate = useNavigate();
  const { data: getDataById } = useAdminGetDataById(updateId as number);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (editMode) {
      setUpdateId(params?.id as number | undefined);
    } else {
      form.resetFields();
    }
    if (getDataById?.id) {
      form.setFieldsValue({
        first_name: getDataById?.first_name,
        last_name: getDataById?.last_name,
        email: getDataById?.email,
        password: getDataById?.password,
        mobile_number: getDataById?.mobile_number,
        gender: getDataById?.gender,
        address: getDataById?.address,

        date_of_birth:
          getDataById?.date_of_birth && getDataById.date_of_birth !== null && getDataById.date_of_birth !== ''
            ? dayjs(getDataById.date_of_birth, 'YYYY-MM-DD')
            : undefined,
      });
      if (getDataById?.profile_image != null) {
        const url = `${getDataById?.profile_image}`;
        setPreviewImage(url);
        setFileList([
          {
            uid: '-1',
            name: 'logo.png',
            status: 'done',
            url: getDataById?.profile_image,
          },
        ]);
      } else {
        setPreviewImage('');
      }
    }
  }, [getDataById, editMode, form, params?.id]);

  const handleSubmit = async (values: AddAdminPayload) => {
    const formData = new FormData();
    formData.append('first_name', values.first_name);
    formData.append('last_name', values.last_name);
    formData.append('email', editMode && getDataById?.email ? getDataById.email : values.email);
    if (values.gender) {
      formData.append('mobile_number', values.mobile_number);
    }
    if (values.gender) {
      formData.append('gender', values.gender);
    }
    if (values.date_of_birth) {
      formData.append('date_of_birth', values.date_of_birth);
    }

    for (const file of fileList) {
      if (file.originFileObj) {
        formData.append('profile_image', file.originFileObj); // Append the file directly (no Base64)
      }
    }

    if (!editMode && values.school_id) {
      formData.append('school_id', values.school_id as unknown as string);
    }

    if (editMode) {
      editAdmindata.mutate(formData as unknown as EditAdminPayload);
    } else {
      try {
        addAdmin.mutate(formData as unknown as AddAdminPayload);
      } catch (error) {
        // Error handling is already in the mutation
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const validateImageDimensions = (file: any) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        displayError('Invalid image file.');
        reject(new Error('Invalid image file.'));
      };

      img.src = objectUrl;
    });
  };

  const uploadButton = (
    <div>
      <PlusOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleChange = async (info: any) => {
    const newFileList = info.fileList.slice(-1); // Keep only the latest file

    if (info.file.status === 'removed') {
      setFileList([]);
      setPreviewImage('');
      return;
    }

    const file = newFileList[0];
    try {
      // Validate dimensions
      await validateImageDimensions(file.originFileObj);

      // Set preview image
      const previewUrl = URL.createObjectURL(file.originFileObj);
      setPreviewImage(previewUrl);

      // Update file list and send payload
      setFileList(newFileList);
      displaySuccess('Image uploaded successfully.');
    } catch (error) {
      // Clear file list if validation fails
      setFileList([]);
      setPreviewImage('');
    }
  };
  return (
    <>
      <AppPageMeta title={editMode ? 'Edit' : 'Create' + ' ' + 'Admin'} />
      <PageTitle
        breadcrumbs={[{ label: 'Admin List', href: '/admin/list' }, { label: `${editMode ? 'Edit' : 'Create'} Admin` }]}
      >
        {`${editMode ? 'Edit' : 'Create'} Admin`}
      </PageTitle>

      <AppsContainer title={' '} fullView={true} type="bottom">
        <UIFormContainerV4 title="Admin Details">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CustomFormItem label="Profile Image" name="profile_image">
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  fileList={fileList}
                  maxCount={1}
                  onPreview={(file) => {
                    setPreviewImage(file.url || file.thumbUrl || null);
                    setPreviewOpen(true);
                  }}
                  onChange={handleChange}
                  beforeUpload={() => false}
                >
                  {fileList.length < 1 && uploadButton}
                </Upload>
                {previewImage && (
                  <AntdImage
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                      visible: previewOpen,
                      onVisibleChange: (visible) => setPreviewOpen(visible),
                      afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                  />
                )}
              </CustomFormItem>

              <CustomFormItem
                label="Name"
                name="first_name"
                rules={[{ required: true, message: requireMessage('name') }]}
              >
                <Input type="text" placeholder="Enter your Name" />
              </CustomFormItem>
              <CustomFormItem
                label="Surname"
                name="last_name"
                rules={[{ required: true, message: requireMessage('surname') }]}
              >
                <Input type="text" placeholder="Enter surname" />
              </CustomFormItem>

              <CustomFormItem
                label="Email"
                name="email"
                rules={[
                  { required: true, message: requireMessage('email') },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input type="email" placeholder="Enter Email" readOnly={editMode} disabled={editMode} />
              </CustomFormItem>
              <CustomFormItem label="Mobile Number" name="mobile_number" rules={validationRules?.phoneNumber}>
                <Input
                  placeholder="Enter Mobile Number"
                  maxLength={15}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </CustomFormItem>

              <SelectGender />

              <CustomFormItem
                name="date_of_birth"
                label="Date of Birth"
                getValueProps={(i: any) => ({
                  value: i === undefined || i === null || i === 'Invalid Date' ? '' : dayjs(i),
                })}
                rules={[{ required: true, message: requireMessage('date of birth') }]}
              >
                <DatePicker
                  placeholder="Select Date of Birth"
                  format="DD-MM-YYYY"
                  style={{ width: '100%' }}
                  allowClear={true}
                  disabledDate={(current) => current && dayjs(current).isAfter(dayjs())}
                />
              </CustomFormItem>

              {!editMode && <InstituteSelect name={'school_id'} />}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleCancel} className="mr-4" type="button" variant={'nsc-secondary'}>
                Cancel
              </Button>
              <UIFormSubmitButton type="submit" api={editMode ? editAdmindata : addAdmin}>
                Submit
              </UIFormSubmitButton>
            </div>
          </Form>
        </UIFormContainerV4>
      </AppsContainer>
    </>
  );
}
