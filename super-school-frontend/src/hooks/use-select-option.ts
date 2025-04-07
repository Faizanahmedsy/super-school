import { useMemo } from 'react';

export interface SelectOption {
  listData?: [] | undefined | unknown;
  labelKey?: string;
  valueKey?: string | number;
}

export const useListOption = ({ listData, labelKey = 'label', valueKey = 'value' }: SelectOption) => {
  const options = useMemo(() => {
    if (Array.isArray(listData) && listData.length > 0) {
      return listData.map((item) => ({
        label: item[labelKey],
        value: item[valueKey],
      }));
    }
    return [];
  }, [listData, labelKey, valueKey]);

  return { options };
};
