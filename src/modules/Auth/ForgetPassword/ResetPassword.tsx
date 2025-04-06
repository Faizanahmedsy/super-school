import IntlMessages from '@/app/helpers/IntlMessages';
import { validatePasswordHelper } from '@/lib/form_validations';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { API } from '@/services/endpoints';
import superAxios from '@/services/instance';
import { ResetPasswordPayload } from '@/services/types/payload';
import { useMutation } from '@tanstack/react-query';
import { Form, Input } from 'antd';
import { useEffect } from 'react';
import useIntl from 'react-intl/lib/src/components/useIntl';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { StyledAuthReconContent, StyledConfirmBtn, StyledResetForm } from '../AuthWrapper.styled';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isUsedForVerification = searchParams.get('verify');

  const checkIsUserIsAlreadyVerified = useMutation({
    // queryKey: ['checkIsUserIsAlreadyVerified', token],
    mutationFn: async (payload: any) => {
      let resp = superAxios.post(API.AUTH.CHECK_IF_VERIFIED, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          language_code: 'en',
        },
      });

      return resp;
    },
    onSuccess: (resp) => {
      displaySuccess(resp?.data?.message);
      if (resp?.data?.data?.screen == 'login') {
        navigate('/signin');
      }
      // if(data?.data)
    },
  });

  useEffect(() => {
    if (token) {
      checkIsUserIsAlreadyVerified.mutate({ token });
    }
  }, [token]);

  useEffect(() => {
    if (isUsedForVerification) {
      toast.info(`Your email has been verified successfully. Please set your password.`, {
        duration: 5000,
      });
    }
  }, []);

  const { messages } = useIntl();

  const { mutate: ResetPasswordMutate, isPending } = useMutation({
    mutationFn: async (payload) => {
      const response = await superAxios.post(API.AUTH.RESET_PASSWORD, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          language_code: 'en',
        },
      });

      if (response.data?.statusCode === 200 || response.status === 201) {
        displaySuccess(response?.data?.message);

        return response.data;
      }
      throw new Error(response.data?.message || 'Failed to add new password');
    },
    onSuccess: (data: any) => {
      if (data?.statusCode == 200) {
        // displaySuccess(data?.message);
        navigate('/signin');
      }
    },
    onError: (err: Error) => {
      if ('response' in err && typeof err.response === 'object' && err.response !== null) {
        const responseData = (err.response as any).data;
        if (responseData && typeof responseData.message === 'string') {
          displayError(responseData.message);
        } else {
          displayError('Something went wrong');
        }
      } else {
        displayError('Something went wrong');
      }
    },
    onSettled: () => {
      return true;
    },
  });

  const checkConfirmPassword = ({ getFieldValue }: any) => ({
    validator(_: any, value: string) {
      if (!value || getFieldValue('newPassword') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Passwords do not match!'));
    },
  });

  const handleResetPassword = (value: any) => {
    const payload: ResetPasswordPayload = {
      new_password: value.confirmPassword,
      token: token as string,
    };
    ResetPasswordMutate(payload as any);
  };

  const onFinishFailed = (errorInfo: any) => {};

  return (
    <StyledAuthReconContent>
      <StyledResetForm
        name="basic"
        initialValues={{ remember: true }}
        onFinish={(values) => handleResetPassword(values as ResetPasswordPayload)}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item name="newPassword" className="form-field" rules={[{ validator: validatePasswordHelper }]}>
          <Input.Password placeholder={messages['common.newPassword'] as string} visibilityToggle={true} />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          className="form-field"
          dependencies={['newPassword']}
          rules={[
            {
              required: true,
              message: 'Please reenter your password!',
            },
            checkConfirmPassword,
          ]}
        >
          <Input.Password placeholder={messages['common.confirmPassword'] as string} visibilityToggle={true} />
        </Form.Item>

        <StyledConfirmBtn type="primary" htmlType="submit" loading={isPending}>
          <IntlMessages id="common.resetMyPassword" />
        </StyledConfirmBtn>
      </StyledResetForm>
    </StyledAuthReconContent>
  );
};

export default ResetPassword;
