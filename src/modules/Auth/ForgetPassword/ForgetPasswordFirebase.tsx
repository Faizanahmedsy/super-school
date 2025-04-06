import IntlMessages from '@/app/helpers/IntlMessages';
import { Form, Input } from 'antd';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { StyledForgotContent, StyledForgotForm, StyledForgotPara, StyledFormFooter } from './index.styled';

import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import { ForgotPasswordPayload } from '@/services/types/payload';
import { usePostForgetpassword } from '../../../services/auth/forget-password/forgetpassword.hook';

const onFinishFailed = () => {};

const ForgetPasswordFirebase = () => {
  const forgotPasswordMutate = usePostForgetpassword(() => []);
  const handldeForgotPassword = (value: ForgotPasswordPayload) => {
    forgotPasswordMutate.mutate(value);
  };

  const { messages } = useIntl();

  return (
    <>
      <StyledForgotContent>
        <StyledForgotPara>
          <IntlMessages id="common.forgetPasswordTextOne" />
          <span>
            <IntlMessages id="common.forgetPasswordTextTwo" />
          </span>
        </StyledForgotPara>

        <StyledForgotForm
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values) => handldeForgotPassword(values as ForgotPasswordPayload)}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="email"
            className="form-field"
            rules={[{ required: true, message: 'Please input your Email Address!' }]}
          >
            <Input placeholder={messages['common.emailAddress'] as string} />
          </Form.Item>

          <div className="form-field">
            <div className="form-btn-field text-center">
              <UIFormSubmitButton className="w-full" api={forgotPasswordMutate}>
                <IntlMessages id="common.sendNewPassword" />
              </UIFormSubmitButton>
            </div>
          </div>

          <StyledFormFooter>
            <IntlMessages id="common.alreadyHavePassword" />
            <Link to="/signin">
              <IntlMessages id="common.signIn" />
            </Link>
          </StyledFormFooter>
        </StyledForgotForm>
      </StyledForgotContent>
    </>
  );
};

export default ForgetPasswordFirebase;
