import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import {
  StyledInfoUpload,
  StyledInfoUploadAvatar,
  StyledInfoUploadBtnView,
  StyledInfoUploadContent,
} from '@/modules/Profile/UserProfile/PersonalInfo/index.styled';
import { useAddParentMutation, useParentGetDataById, useUpdateParent } from '@/services/management/parent/parent.hook';
import { ParentPayload } from '@/services/types/payload';
import { useQueryClient } from '@tanstack/react-query';
import { Form, Input, Upload, Image as AntdImage } from 'antd';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useParams } from 'react-router-dom';
import { ChildrenColumns } from './ChildrenDetailsColumn';
import { requireMessage } from '@/lib/form_validations/formmessage';
import UIText from '@/components/global/Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import { UploadFile } from 'antd/lib';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { PlusOutlined } from '@ant-design/icons';
import { displayError } from '@/lib/helpers/errorHelpers';
export default function CreateEditParent({ editMode = false }: { editMode?: boolean }) {
  const navigate = useNavigate();
  const [userImage, setUserImage] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const params = useParams();
  const queryclient = useQueryClient();
  const { mutate: addParent } = useAddParentMutation();
  const addParentMutation = useAddParentMutation();
  const [updateId, setUpdateId] = useState<any>();
  const { mutate: editParentdata } = useUpdateParent(updateId, queryclient);
  const { data: getDataById, isLoading } = useParentGetDataById(updateId);
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
        first_name: getDataById?.first_name,
        last_name: getDataById?.last_name,
        email: getDataById?.email,
        mobile_number: getDataById?.mobile_number,
        gender: getDataById?.gender,

        institute_id: getDataById?.institute_id,
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
  }, [getDataById, editMode]);

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    formData.append('first_name', values.first_name);
    formData.append('last_name', values.last_name);
    formData.append('email', values.email);
    formData.append('mobile_number', values.mobile_number);
    for (const file of fileList) {
      if (file.originFileObj) {
        formData.append('profile_image', file.originFileObj);
      }
    }

    // formData.append('institute_id', values.institute_id as unknown as string);

    if (editMode) {
      editParentdata(formData as unknown as ParentPayload);
    } else {
      addParent(formData as unknown as ParentPayload);
    }
  };

  // const handleUpload = ({ fileList }: any) => {
  //   setFileList(fileList);
  // };
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
      <AppPageMeta title={editMode ? 'Edit' : 'Create' + ' ' + 'Parent'} />
      <PageTitle
        // extraItem={
        //   <>
        //     <Button variant={'cust_01'} onClick={form.submit} type="submit">
        //       Submit
        //     </Button>
        //   </>
        // }
        breadcrumbs={[
          { label: 'Parent List', href: '/parent/list' },
          { label: `${editMode ? 'Edit' : 'Create'} Parents` },
        ]}
      >
        {`${editMode ? 'Edit' : 'Create'} Parent`}
      </PageTitle>

      <AppsContainer title={' '} fullView={true} type="bottom" cardStyle={{ padding: '20px' }}>
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

            <Form.Item
              label={<UIText>Name</UIText>}
              name="first_name"
              rules={[{ required: true, message: requireMessage('name') }]}
            >
              <Input type="text" placeholder="Enter name" />
            </Form.Item>

            <Form.Item
              label={<UIText>Surname</UIText>}
              name="last_name"
              rules={[{ required: true, message: requireMessage('surname') }]}
            >
              <Input type="text" placeholder="Enter surname" />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ required: true, message: requireMessage('email') }]}>
              <Input type="email" placeholder="Enter email address" disabled={editMode} />
            </Form.Item>

            <Form.Item
              label={<UIText>Mobile Number</UIText>}
              name="mobile_number"
              rules={[
                {
                  required: true,
                  message: requireMessage('mobile number'),
                },
                {
                  validator: (_, value) => {
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
              <Input type="text" placeholder="Enter Mobile Number" />
            </Form.Item>
          </div>
        </Form>
        <div className="flex justify-between items-center py-5 pb-0">
          <div className="text-base font-semibold text-slate-500">Children List</div>
        </div>
        <DynamicTable
          data={Array.isArray(getDataById?.students) ? getDataById?.students || [] : []}
          columns={ChildrenColumns}
          totalCount={getDataById?.students.length}
          loading={isLoading}
          showPagination={false}
          // pageSize={pageQuery.limit}
          // pageIndex={(pageQuery.page ?? 1) - 1}
          // onPaginationChange={handlePaginationChange}
        />

        <div className="flex justify-end mt-4">
          <Button variant={'nsc-secondary'} onClick={handleCancel} className="mr-4" type="button">
            Cancel
          </Button>

          {
            <UIFormSubmitButton type="submit" api={addParentMutation} className="mr-4" onClick={form.submit}>
              Submit
            </UIFormSubmitButton>
          }
        </div>
      </AppsContainer>
      {/* <Form form={form} onFinish={handleSubmit} layout="vertical">
        <StudentSection form={form} />
      </Form> */}
    </>
  );
}
