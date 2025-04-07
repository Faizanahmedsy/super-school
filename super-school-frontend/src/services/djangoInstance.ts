import axios from 'axios';
import { JANGO_API_ENDPOINT } from './endpoints';
import { getItem, removeItem } from '@/lib/localstorage';
import { displayError } from '@/lib/helpers/errorHelpers';
import useGlobalState from '@/store';

const djangoAxios = axios.create({
  baseURL: JANGO_API_ENDPOINT,
});

// Add request interceptor to dynamically set headers
djangoAxios.interceptors.request.use(
  async (config) => {
    const token = getItem('access_token');
    const lang = useGlobalState.getState().lang_name;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (lang) {
      config.headers['Accept-Language'] = lang;
    }
    return config;
  },
  (error) => {
    console.log('error ==>', error);
    if (error.response && error.response.status === 401) {
      removeItem('access_token');
      removeItem('role');
      removeItem('role_access');
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
djangoAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration or unauthorized access
      window.location.href = '/';
    } else if (error.response?.status === 404) {
      console.error('API not found:', error.config.url);
    } else if (error.response?.status === 500) {
      displayError(`Internal server error`);
    } else {
      console.error('API error:', error.config.url);
    }
    return Promise.reject(error);
  }
);

export default djangoAxios;
