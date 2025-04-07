export interface QueryParams {
  page?: number;
  limit?: number;
  page_size?: number;
  sort?: 'asc' | 'desc';
  [key: string]: string | number | undefined | boolean | any;
}

export interface InstituteListQueryParams extends QueryParams {
  state_id?: number;
  city_id?: number;
  institute_name?: string;
}
