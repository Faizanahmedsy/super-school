import useGlobalState from '@/store';
import { useMemo } from 'react';

const useIsFilterApplied = () => {
  const filterData = useGlobalState((state) => state.filterData);

  const isFilterApplied = useMemo(
    () => ({
      batch: filterData?.batch?.id && filterData?.batch?.id !== 'null',
      grade: filterData?.grade?.id && filterData?.grade?.id !== 'null',
      class: filterData?.class?.id && filterData?.class?.id !== 'null',
      term: filterData?.term?.id && filterData?.term?.id !== 'null',
      subject: filterData?.subject?.id && filterData?.subject?.id !== 'null',
    }),
    [filterData]
  );

  return isFilterApplied;
};

export default useIsFilterApplied;
