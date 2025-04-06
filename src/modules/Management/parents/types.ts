type ParentData = {
  id: number;
  name: string;
  email: string;
  password: string;
  mobile_number: string;
  gender: string;
  address: string;
  profile_image: string;
  institute: {
    institute_name: string;
    id: number;
  };
};

type ParentApiResponse = {
  currentPage: number;
  list: ParentData[];
  totalCount: number;
  totalPages: number;
};

export type { ParentData, ParentApiResponse };
