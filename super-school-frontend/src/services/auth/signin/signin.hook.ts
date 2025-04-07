import { usePostData } from '@/hooks/api-request';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { setItem } from '@/lib/localstorage';
import { API } from '@/services/endpoints';
import useGlobalState from '@/store';
import useRoleBasedAccess from '@/store/useRoleBasedAccess';
import { useMutation } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { postLoginApi } from './signin.api';
import useGlobalUserState from '@/store/user-store';

export const usePostLogin = (handleSuccess: (data: any) => void) => {
  const setUser = useGlobalState((state) => state.setUser);
  const setUserData = useGlobalUserState((state) => state.setUser);
  const setUserWithPermission = useRoleBasedAccess((state) => state.setUser);
  const setIsSetUpWizardCompleted = useGlobalState((state) => state.setIsSetUpWizardCompleted);

  const navigate = useNavigate();
  return useMutation({
    mutationFn: postLoginApi,
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
    onSuccess: (data: any) => {
      setUser(data?.data?.user);
      setUserData(data?.data?.user);
      setUserWithPermission(data?.data?.user, data?.data?.access_token);
      if (data.statusCode == 200) {
        displaySuccess(data.message);
        // setItem('role', 'super_admin');

        const result: {
          email: string;
          role_name: string;
          sub: number;
          iat: number;
          exp: number;
        } = jwtDecode(data?.data?.access_token);

        setItem('access_token', data?.data?.access_token);
        setItem('role', result?.role_name);

        if (data?.data?.user?.school?.setup == false) {
          setIsSetUpWizardCompleted(false);
          navigate('/setup-wizard');
        } else {
          setIsSetUpWizardCompleted(true);
          navigate('/dashboard');
        }
        handleSuccess(data);
      } else {
        navigate('/signin');
      }
    },
    onSettled: () => {
      return true;
    },
  });
};

export const useReLogin = () => {
  const setGenralSetting = useGlobalState((state) => state.setGeneralSettings);
  const navigate = useNavigate();
  const setUser = useGlobalState((state) => state.setUser);
  const setUserData = useGlobalUserState((state) => state.setUser);
  const setUserWithPermission = useRoleBasedAccess((state) => state.setUser);
  const setIsSetUpWizardCompleted = useGlobalState((state) => state.setIsSetUpWizardCompleted);
  const setCurrentStep = useGlobalState((state) => state.setSetUpWizardCurrentStep);

  return usePostData({
    url: `${API.AUTH.RE_LOGIN}`,
    mutationOptions: {
      onSuccess: (data: any) => {
        setUser(data?.data?.user);
        setUserData(data?.data?.user);
        setUserWithPermission(data?.data?.user, data?.data?.access_token);

        setGenralSetting({
          primary_color: data?.data?.user?.themePrimaryColor,
          secondory_color: data?.data?.user?.themeSecondaryColor,
        });
        // setItem('primaryColor', data?.data?.user?.themePrimaryColor);
        // setItem('primaryLightColor', data?.data?.user?.themeSecondaryColor);
        setIsSetUpWizardCompleted(true);
        setCurrentStep(1);
        navigate('/dashboard');

        if (data.statusCode == 200) {
          const result: {
            email: string;
            role_name: string;
            sub: number;
            iat: number;
            exp: number;
          } = jwtDecode(data?.data?.access_token);

          setItem('access_token', data?.data?.access_token);
          setItem('role', result?.role_name);
        }
      },
      onError: (err: Error) => {
        displayError(err);
        displayError('Please login again to continue');
        setIsSetUpWizardCompleted(true);
        navigate('/dashboard');
        setCurrentStep(1);
      },
    },
  });
};
