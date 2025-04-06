import { ReactNode } from 'react';
import { RoutePermittedRole } from '@/app/constants/AppEnums';

export type LanguageProps = {
  languageId: string;
  locale: string;
  name: string;
  icon?: ReactNode;
};
export type UserList = {
  id: number;
  name: string;
  image: string;
  skills: string[];
  information: string;
  email: string;
  phone: string;
  website: string;
  charge: number;
  readTime: string;
  shares: string;
  retweets: string;
  topic: string;
};

export type RouterConfigData = {
  id: string;
  title: string;
  messageId: string;
  icon?: string | ReactNode;
  type: 'item' | 'group' | 'collapse' | 'divider';
  children?: RouterConfigData[];
  roles?: RoutePermittedRole;
  color?: string;
  url?: string;
  exact?: boolean;
  count?: number;
};
