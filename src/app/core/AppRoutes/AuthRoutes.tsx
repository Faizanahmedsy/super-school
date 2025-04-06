import React from 'react';
import ResetPassword from '../../../modules/Auth/ForgetPassword/ResetPassword';

const Signin = React.lazy(() => import('../../../modules/Auth/Signin/SigninFirebase'));

const ForgotPassword = React.lazy(() => import('../../../modules/Auth/ForgetPassword/ForgetPasswordFirebase'));

export const authRouteConfig = [
  {
    path: '/signin',
    element: <Signin />,
  },
  {
    path: '/forget-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
];
