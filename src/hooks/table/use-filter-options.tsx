import { useMemo } from 'react';

interface SelectFilter {
  key: string;
  placeholder: string;
  options: any[];
  onSelectChange: (value: any) => void;
  defaultValue?: any;
}

/**
 * Filters select options by removing items with specified keys.
 *
 * @param selectFilters - The array of filter configurations.
 * @param keysToHide - The array of keys to hide from the filters.
 * @returns The filtered select options.
 */
const useFilterOptions = (selectFilters: SelectFilter[], keysToHide: string[]): SelectFilter[] => {
  return useMemo(() => {
    if (!Array.isArray(keysToHide) || keysToHide.length === 0) {
      return selectFilters; // Return the original filters if no keys to hide
    }

    // Filter out items with keys present in keysToHide
    return selectFilters.filter((filter) => !keysToHide.includes(filter.key));
  }, [selectFilters, keysToHide]);
};

export default useFilterOptions;
