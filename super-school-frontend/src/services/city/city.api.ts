import { displayError } from '@/lib/helpers/errorHelpers';
import { API } from '../endpoints';
import superAxios from '../instance';
import { QueryParams } from '../types/params';

export const getCityListApi = async (params: QueryParams): Promise<any> => {
  try {
    const response = await superAxios.get(`${API.CITY.LIST}${params.state_id}`);
    // if (response.data?.statusCode === 200) {
    // displayError("Failed to fetch city list.");
    // displaySuccess(response.data?.message);
    return response.data.data;
  } catch (error) {
    displayError('City not found');
  }
};
