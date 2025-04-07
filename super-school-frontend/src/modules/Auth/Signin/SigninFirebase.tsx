import { Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

import IntlMessages from '@/app/helpers/IntlMessages';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import { usePostLogin } from '@/services/auth/signin/signin.hook';
import { LoginPayload } from '@/services/types/payload';
import { StyledRememberMe, StyledSign, StyledSignContent, StyledSignForm, StyledSignLink } from './index.styled';

const SignInFirebase = () => {
  const navigate = useNavigate();

  const onFinishFailed = () => {
    console.log('Failed:');
  };
  const onGoToForgetPassword = () => {
    navigate('/forget-password');
  };

  const loginMutate = usePostLogin(() => []);
  const handldeLogin = (value: LoginPayload) => {
    loginMutate.mutate(value);
  };

  return (
    <StyledSign>
      <StyledSignContent>
        <StyledSignForm
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={(values) => handldeLogin(values as LoginPayload)}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="email"
            className="form-field"
            rules={[
              { required: true, message: 'Please input your Email!' },
              { type: 'email', message: 'Please enter a valid Email!' },
            ]}
          >
            <Input placeholder="Enter Email" />
          </Form.Item>

          <Form.Item
            name="password"
            className="form-field"
            rules={[
              {
                required: true,
                message: 'Please input your Password!',
              },
            ]}
          >
            <Input.Password placeholder="Enter Password" />
          </Form.Item>

          <StyledRememberMe>
            <StyledSignLink onClick={onGoToForgetPassword}>
              <IntlMessages id="common.forgetPassword" />
            </StyledSignLink>
          </StyledRememberMe>

          <div className="form-btn-field text-center">
            <UIFormSubmitButton className="w-full" api={loginMutate}>
              <IntlMessages id="common.login" />
            </UIFormSubmitButton>
          </div>
        </StyledSignForm>
      </StyledSignContent>
    </StyledSign>
  );
};

export default SignInFirebase;
