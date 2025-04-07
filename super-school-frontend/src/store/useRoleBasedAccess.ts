import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthState } from './store-types';

const initialState: Pick<AuthState, 'role' | 'permissions' | 'accessToken' | 'user' | 'role_name'> = {
  role: '',
  permissions: [],
  accessToken: '',
  user: null,
  role_name: '',
};

const authState = (set: (fn: (state: AuthState) => Partial<AuthState>) => void): AuthState => ({
  ...initialState,
  setUser: (userData, accessToken) => {
    set(() => ({
      role: userData.role_name,
      permissions: userData.permissions,
      accessToken,
      user: userData,
    }));
  },

  logout: () => {
    set(() => ({
      ...initialState,
    }));
  },
});

const useRoleBasedAccess = create<AuthState>()(
  devtools(
    persist(authState, {
      name: 'role_access',
    })
  )
);

export default useRoleBasedAccess;
