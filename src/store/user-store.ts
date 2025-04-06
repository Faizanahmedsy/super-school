import { create } from 'zustand';
import { GlobalState } from './store-types';

import { devtools, persist } from 'zustand/middleware';
import secureLocalStorage from 'react-secure-storage';

const encrypt = (value: any): string => {
  return JSON.stringify(value); // Placeholder: Use encryption logic if needed
};

const decrypt = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const secureStorage = {
  getItem: (name: string) => {
    const data = secureLocalStorage.getItem(name);
    return data ? decrypt(data as string) : null;
  },
  setItem: (name: string, value: any) => {
    secureLocalStorage.setItem(name, encrypt(value));
  },
  removeItem: (name: string) => {
    secureLocalStorage.removeItem(name);
  },
};

const initialState: Partial<GlobalState> = {
  user: null,
};

const createStateUpdaters = (set: (state: Partial<GlobalState>) => void) => ({
  setUser: (user: any) => set({ user }),
});

const useGlobalUserState = create<GlobalState>()(
  devtools(
    persist<GlobalState>(
      (set) => ({
        ...initialState,
        ...createStateUpdaters(set),
        ...(initialState as GlobalState),
      }),
      { name: 'user_global_state', storage: secureStorage }
    )
  )
);

export default useGlobalUserState;
