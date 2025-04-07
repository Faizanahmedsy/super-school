import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UILoader from '@/components/custom/loaders/UILoader';
import { SelectCity } from '@/components/global/Form/SelectCity';
import { SelectState } from '@/components/global/Form/SelectState';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import {
  StyledInfoUpload,
  StyledInfoUploadAvatar,
  StyledInfoUploadBtnView,
  StyledInfoUploadContent,
} from '@/modules/Profile/UserProfile/PersonalInfo/index.styled';
import { useAddDoehook, useDoeGetDataById, useUpdateDoe } from '@/services/doe/doe.hook';
import { useAddParentMutation } from '@/services/management/parent/parent.hook';
import { DoePayload, ParentPayload } from '@/services/types/payload';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Form, Input, Upload, Image as AntdImage } from 'antd';
import { UploadFile } from 'antd/lib';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useParams } from 'react-router-dom';
export default function CreateEditDoe({ editMode = false }: { editMode?: boolean }) {
  const navigate = useNavigate();
  const [userImage, setUserImage] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [form] = Form.useForm();
  const params = useParams();
  const queryclient = useQueryClient();
  const addDoe = useAddDoehook();
  const addParentMutation = useAddParentMutation();
  const [updateId, setUpdateId] = useState<any>();
  const editDoeData = useUpdateDoe(updateId, queryclient);

  const { data: getDataById, isLoading } = useDoeGetDataById(updateId);
  const [stateId, setStateId] = useState<number | undefined>(undefined);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (editMode) {
      setUpdateId(params?.id as number | undefined);
    } else {
      form.resetFields();
    }

    if (editMode && getDataById) {
      form.setFieldsValue({
        first_name: getDataById?.department_user?.first_name,
        last_name: getDataById?.department_user?.last_name,
        email: getDataById?.department_user?.email,
        mobile_number: getDataById?.department_user?.mobile_number,
        province_id: getDataById?.department_user?.province_id,
        district_id: getDataById?.department_user?.district_id,
        job_title: getDataById?.department_user?.job_title,
        // profile_image: getDataById?.department_user?.profile_image,
      });

      if (getDataById?.department_user?.profile_image != null) {
        const url = `${getDataById?.department_user?.profile_image}`;
        setPreviewImage(url);
        setFileList([
          {
            uid: '-1',
            name: 'logo.png',
            status: 'done',
            url: url,
          },
        ]);
      } else {
        setPreviewImage('');
      }
    }
  }, [getDataById, editMode]);

  useEffect(() => {
    setStateId(getDataById?.department_user?.province_id);
  }, [getDataById]);

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    formData.append('first_name', values.first_name);
    formData.append('last_name', values.last_name);
    formData.append('email', values.email);
    if (values.mobile_number !== undefined && values.mobile_number !== null && values.mobile_number !== '') {
      formData.append('mobile_number', values.mobile_number);
    }
    formData.append('job_title', values.job_title);

    formData.append('province_id', values.province_id);
    formData.append('district_id', values.district_id);
    for (const file of fileList) {
      if (file.originFileObj) {
        formData.append('profile_image', file.originFileObj);
      }
    }
    // formData.append('institute_id', values.institute_id as unknown as string);

    if (editMode) {
      editDoeData.mutate(formData as unknown as ParentPayload);
    } else {
      addDoe.mutate(formData as unknown as DoePayload);
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
      <AppPageMeta title={editMode ? 'Edit' : 'Create' + ' ' + 'DOE'} />
      <PageTitle
        // extraItem={
        //   <>
        //     <Button variant={'cust_01'} onClick={form.submit} type="submit">
        //       Submit
        //     </Button>
        //   </>
        // }
        breadcrumbs={[
          { label: 'Department Admin List', href: '/department-admin/list' },
          { label: `${editMode ? 'Edit' : 'Create'} Department Admin` },
        ]}
      >
        {`${editMode ? 'Edit' : 'Create'} Department Admin`}
      </PageTitle>

      <AppsContainer title={' '} fullView={true} type="bottom" cardStyle={{ padding: '20px' }}>
        {isLoading ? (
          <UILoader />
        ) : (
          <>
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <div className="flex items-center text-2xl font-medium text-slate-600 mb-5">
                <div>
                  <UIText>Department of education Details</UIText>
                </div>
              </div>
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
                  <Input type="text" placeholder="Enter name" />
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
                  rules={[{ required: true, message: requireMessage('email') }]}
                >
                  <Input type="email" placeholder="Enter email address" />
                </CustomFormItem>

                <CustomFormItem
                  label="Mobile Number"
                  name="mobile_number"
                  rules={[
                    {
                      validator: (_: any, value: any) => {
                        if (!value) {
                          return Promise.resolve();
                        }
                        if (!/^\d+$/.test(value)) {
                          return Promise.reject('Please enter numbers only');
                        }
                        if (value.length < 10) {
                          return Promise.reject('Mobile number must be at least 10 digits');
                        }
                        if (value.length > 15) {
                          return Promise.reject('Mobile number cannot exceed 15 digits');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input type="text" maxLength={15} placeholder="Enter Mobile Number" />
                </CustomFormItem>

                <CustomFormItem
                  label="Job Title"
                  name="job_title"
                  rules={[{ required: true, message: requireMessage('job title', 'select') }]}
                >
                  <Input type="text" placeholder="Enter job title" />
                </CustomFormItem>

                <SelectState onChange={(value) => setStateId(value)} />
                <SelectCity state_id={stateId} />
              </div>
            </Form>
            <div className="flex justify-end mt-4">
              <Button variant={'nsc-secondary'} onClick={handleCancel} className="mr-4" type="button">
                Cancel
              </Button>

              <UIFormSubmitButton
                type="submit"
                api={editMode ? editDoeData : addParentMutation}
                className="mr-4"
                onClick={form.submit}
              >
                Submit
              </UIFormSubmitButton>
            </div>
          </>
        )}
      </AppsContainer>

      {/* <Form form={form} onFinish={handleSubmit} layout="vertical">
        <StudentSection form={form} />
      </Form> */}
    </>
  );
}
