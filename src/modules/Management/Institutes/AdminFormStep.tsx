import SelectGender from '@/components/global/Form/SelectGender';
import { Card, DatePicker, Form, Input } from 'antd';
import dayjs from 'dayjs';
import ProfileImageUpload from './ProfileImageUpload';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import { useNavigate } from 'react-router-dom';
import PrivacyNotice from '@/components/global/Notes/PrivacyNotice';
import { Button } from '@/components/ui/button';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UIText from '@/components/global/Text/UIText';

interface Props {
  form: any;
  userImage: any;
  setUserImage: (img: any) => void;
  handleSubmit: (values: any) => void;
  apiMutation: any;
}

const AdminFormStep = ({ form, userImage, setUserImage, handleSubmit, apiMutation }: Props) => {
  const navigate = useNavigate();
  // Cancel button handler
  const handleCancel = () => {
    navigate('/school/list');
  };

  return (
    <>
      <Card>
        <div className="justify-between items-center pb-10">
          <div className="flex items-center text-2xl font-medium text-slate-600 mb-5">
            <div>
              <UIText>Admin Details</UIText>
            </div>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid md:grid-cols-4 gap-4">
              <CustomFormItem label="Profile Image" name="profile_image">
                <ProfileImageUpload userImage={userImage} setUserImage={setUserImage} />
              </CustomFormItem>

              <CustomFormItem
                label="First Name"
                name="first_name"
                rules={[{ required: true, message: 'First Name is required' }]}
              >
                <Input type="text" placeholder="Enter First Name" />
              </CustomFormItem>
              <CustomFormItem
                label="Last Name"
                name="last_name"
                rules={[{ required: true, message: 'Last Name is required' }]}
              >
                <Input type="text" placeholder="Enter Last Name" />
              </CustomFormItem>

              <CustomFormItem
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input type="email" placeholder="Enter Email" />
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

              <CustomFormItem name="date_of_birth" label="Date of Birth">
                <DatePicker
                  placeholder="Select Date of Birth"
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current.isAfter(dayjs())}
                />
              </CustomFormItem>
              <SelectGender />
              {/* <InstituteSelect name={"school_id"} /> */}
            </div>
            {/* <PrivacyNotice
              message={
                <>
                  <UIText>
                    This information identifies the school admin to ensure accountability and smooth communication. We
                    do not share or sell this data.
                  </UIText>
                </>
              }
            /> */}

            {/* Buttons */}
            <div className="flex justify-end mt-4 gap-2">
              <Button onClick={handleCancel} className="mr-4" type="button" variant={'nsc-secondary'}>
                Cancel
              </Button>
              <UIFormSubmitButton api={apiMutation}>Submit</UIFormSubmitButton>
            </div>
          </Form>
        </div>
      </Card>
    </>
  );
};

export default AdminFormStep;
