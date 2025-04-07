/*// ForJWT Auth
import { getUserFromJwtAuth } from '@/app/helpers/AuthHelper';
import {
  useJWTAuth,
  useJWTAuthActions,
} from '@/app/services/auth/JWTAuthProvider';

export const useAuthUser = () => {
  const {user, isAuthenticated, isLoading} = useJWTAuth();
  return {
    isLoading,
    isAuthenticated,
    user: getUserFromJwtAuth(user),
  };
};

export const useAuthMethod = () => {
  const {signInUser, signUpUser, logout} = useJWTAuthActions();

  return {
    signInUser,
    logout,
    signUpUser,
  };
};*/
//For Firebase Auth

import { getUserFromFirebase } from '@/app/helpers/AuthHelper';
import { useFirebase, useFirebaseActions } from '@/app/services/auth/firebase/FirebaseAuthProvider';

export const useAuthUser = () => {
  const { user, isAuthenticated, isLoading } = useFirebase();
  return {
    isLoading,
    isAuthenticated,
    user: getUserFromFirebase(user),
  };
};

export const useAuthMethod = () => {
  const { logInWithEmailAndPassword, registerUserWithEmailAndPassword, logInWithPopup, logout } = useFirebaseActions();

  return {
    logInWithEmailAndPassword,
    registerUserWithEmailAndPassword,
    logInWithPopup,
    logout,
  };
};
/*
// For AWS Auth
import { getUserFromAWS } from '@/app/helpers/AuthHelper';
import {
  useAwsCognito,
  useAwsCognitoActions,
} from '@/app/services/auth/AWSAuthProvider';

export const useAuthUser = () => {
  const { auth, user, isAuthenticated, isLoading } = useAwsCognito();
  return {
    auth,
    isLoading,
    isAuthenticated,
    user: getUserFromAWS(user),
  };
};

export const useAuthMethod = () => {
  const { signIn, signUpCognitoUser, confirmCognitoUserSignup, logout } =
    useAwsCognitoActions();

  return {
    signIn,
    signUpCognitoUser,
    confirmCognitoUserSignup,
    logout,
  };
};*/
/*

//For Auth0
import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';
import { getUserFromAuth0 } from '@/app/helpers/AuthHelper';

export const useAuthUser = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  return {
    isLoading,
    isAuthenticated,
    user: useMemo(() => getUserFromAuth0(user), []),
  };
};

export const useAuthMethod = () => {
  const { loginWithRedirect, logout } = useAuth0();
  return { loginWithRedirect, logout };
};
*/
