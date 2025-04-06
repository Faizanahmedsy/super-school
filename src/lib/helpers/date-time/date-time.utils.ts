import dayjs from 'dayjs';

import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const superStartDate = (date: string | Date | undefined) => {
  return dayjs(date).endOf('day').utc().startOf('day').toISOString();
};

export const superEndDate = (date: string | Date | undefined) => {
  return dayjs(date).endOf('day').utc().endOf('day').toISOString();
};

export const superStartDateWithFormat = (date: string | Date | undefined, format: any) => {
  return dayjs(date).endOf('day').utc().startOf('day').toISOString();
};

export const superEndDateWithFormat = (date: string | Date | undefined, format: any) => {
  return dayjs(date).endOf('day').utc().endOf('day').toISOString();
};
