import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import useGlobalState from '@/store';
import { Form, Input, Upload } from 'antd';
import { FormInstance } from 'antd/lib';
import { Upload as UploadIcon } from 'lucide-react';

interface RaiseIssueProps {
  form: FormInstance;
  fileList: any;
  setFileList: any;
  addReport: any;
  setOpenModal: any;
}

export default function RaiseIssue({ form, fileList, setFileList, addReport, setOpenModal }: RaiseIssueProps) {
  //  GLOBAL STATE
  const user = useGlobalState((state) => state.user);

  const schoolId: any = useRoleBasedSchoolId();

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <div className="flex flex-col items-center">
      <UploadIcon className="w-6 h-6 text-gray-400" />
      <div className="mt-2">Upload</div>
    </div>
  );

  const handleSubmit = (values: any) => {
    const formData = new FormData();

    formData.append('description', values.description);

    values?.images?.fileList?.forEach((file: any) => {
      formData.append('attachment', file.originFileObj);
    });

    if (user?.role_name) {
      formData.append('role_name', user?.role_name);
    }

    if (user?.role_name == 'super_admin') {
      formData.append('school_id', schoolId);
    }

    addReport.mutate(formData, {
      onSuccess: (data: any) => {
        setFileList([]);
        form.resetFields();
        setOpenModal(false);
      },
    });
  };

  return (
    <>
      <div className="bg-secondary p-4 rounded-lg text-sm text-gray-600 mb-4">
        <UIText>
          If you have encountered any issues, please describe the problem in detail below. You can also upload
          screenshots or images to help us understand the issue better.
        </UIText>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <CustomFormItem
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <Input.TextArea placeholder="Enter description" />
        </CustomFormItem>
        <CustomFormItem label="Upload Images" name="images">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            multiple
            accept="image/*"
          >
            {fileList.length >= 8 ? null : uploadButton}
          </Upload>
        </CustomFormItem>

        <div className="flex justify-end">
          <div className="space-x-5">
            <Button
              variant={'nsc-secondary'}
              onClick={() => {
                setFileList([]);
                form.resetFields();
                setOpenModal(false);
              }}
            >
              Cancel
            </Button>
            <UIFormSubmitButton api={addReport}>Submit</UIFormSubmitButton>
          </div>
        </div>
      </Form>
    </>
  );
}
