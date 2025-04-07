import AppRowContainer from '@/app/components/AppRowContainer';
import { Button } from '@/components/ui/button';
import { usePostChangepassword } from '@/services/auth/change-password/changepassword.hook';
import { Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const navigate = useNavigate();
  const changePassword = usePostChangepassword();

  const onFinish = (values: any) => {
    const payload = {
      current_Password: values.oldPassword,
      new_password: values.newPassword,
    };

    // Uncomment the following line when your API is ready
    changePassword.mutate(payload);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <Form
      layout="vertical"
      className="mt-4"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <AppRowContainer gutter={10}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Form.Item
            name="oldPassword"
            label="Current Password"
            // rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            // rules={[{ required: true, message: 'Please input your new password!' }, { validator: validatePassword }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['newPassword']}
            // rules={[
            //   {
            //     required: true,
            //     message: 'Please confirm your new password!',
            //   },
            //   ({ getFieldValue }) => ({
            //     validator(_, value) {
            //       if (!value || getFieldValue('newPassword') === value) {
            //         return Promise.resolve();
            //       }
            //       return Promise.reject(new Error('The confirmation password does not match!'));
            //     },
            //   }),
            // ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
          <div className="mt-4 flex ">
            <Button onClick={handleCancel} className="mr-4" type="button" variant={'nsc-secondary'}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </AppRowContainer>
    </Form>
  );
};

export default ChangePassword;
