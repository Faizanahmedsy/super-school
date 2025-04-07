// services/api.js
import axios from 'axios';
import { getItem, removeItem } from '../lib/localstorage';
import { NEST_API_ENDPOINT } from './endpoints';
import { displayError } from '@/lib/helpers/errorHelpers';
import useGlobalState from '@/store';

const superAxios = axios.create({
  baseURL: NEST_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

superAxios.interceptors.request.use(
  async (config) => {
    const session = getItem('access_token');
    const lang = useGlobalState.getState().lang_name || 'en';

    if (session) {
      config.headers.Authorization = `Bearer ${session}`;
    }

    if (lang) {
      config.headers['language_code'] = lang;
    }

    // Check URLs requiring multipart/form-data
    const multipartUrls = [
      'admin/create',
      'teacher/create',
      'student/create',
      'parent/create',
      'support/add-report',
      'department-user/create',
      'study-material',
    ];

    const patchUrls = [
      'department-user/patch/',
      'parent/patch/',
      'teacher/patch/',
      'student/patch',
      'admin/patch/',
    ];

    if (
      multipartUrls.some((url) => config.url?.includes(url)) ||
      patchUrls.some((url) => config.url?.includes(url)) ||
      (config.url?.includes('general-setting/') &&
        !config.url?.includes('general-setting/remove-logo'))
    ) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  (error) => {
    console.log('Request error ==>', error);
    if (error.response?.status === 401) {
      removeItem('access_token');
      removeItem('role');
      removeItem('role_access');
    }
    return Promise.reject(error);
  }
);

superAxios.interceptors.response.use(
  (response) => {
    if (response.status === 201 || response.data?.statusCode === 201) {
      console.log('Response ==>', response);
    }
    return response;
  },
  async (error) => {
    console.log('Response error ==>', error);

    const { status, config, data } = error.response || {};

    if (status === 401) {
      window.location.href = '/';
      removeItem('access_token');
      removeItem('role');
      removeItem('role_access');
    } else if (status === 400) {
      console.log('API error:', error);
    } else if (status === 403) {
      displayError('You are not allowed to perform this action');
    } else if (status === 404) {
      console.error('API not found:', config?.url);
    } else if (status === 409) {
      displayError(data?.message);
    } else if (status === 500) {
      displayError(`Internal server error: ${config?.url}`);
    } else {
      console.error('API error:', config?.url);
    }

    return Promise.reject(error);
  }
);

export default superAxios;
