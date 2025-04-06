export const authRole = {
  SuperAdmin: ['super_admin'],
  Admin: ['admin'],
  Teacher: ['teacher'],
  Parent: ['parents'],
  Student: ['student'],
  User: ['user', 'admin'], // TODO: remove this later
};

export const allowMultiLanguage = import.meta.env.VITE_MULTILINGUAL === 'true';
export const fileStackKey = import.meta.env.VITE_FILESTACK_KEY as string;
export const initialUrl = import.meta.env.VITE_INITIAL_URL as string; // this url will open after login
