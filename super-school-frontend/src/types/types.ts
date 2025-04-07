import { UserAuthResp } from '@/store/store-types';

export type SchoolType = NonNullable<UserAuthResp['school']>['school_type'];
