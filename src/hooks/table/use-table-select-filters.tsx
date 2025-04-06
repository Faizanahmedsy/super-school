// import { useState, useEffect, useCallback } from 'react';
// import { useListOption } from '@/hooks/use-select-option';
// import { useTermList } from '@/services/master/term/term.action';
// import { useDivisionList } from '@/services/master/division/division.hook';
// import { useGradeList } from '@/services/master/grade/grade.hook';
// import { useSubjectList } from '@/modules/Master/subject/subject.action';
// import useGlobalState from '@/store';

// interface FiltersEnabled {
//   term: boolean;
//   grade: boolean;
//   class: boolean;
//   subject: boolean;
// }

// interface SelectFilter {
//   key: string;
//   placeholder: string;
//   options: Array<{ label: string; value: string }>;
//   defaultValue?: string;
//   onSearchChange?: (searchTerm: string) => void;
// }

// export function useTableSelectFilters({
//   filtersEnabled,
//   searchEnabled = true,
// }: {
//   filtersEnabled: FiltersEnabled;
//   searchEnabled?: boolean;
// }) {
//   const user = useGlobalState((state) => state.user);
//   const filterData = useGlobalState((state) => state.filterData);

//   // LOCAL STATES
//   const [selectedTermFilter, setTermSelectedFilter] = useState<string>(''); // Removed unused state
//   const [searchTerm, setSearchTerm] = useState<string>('');

//   // API Calls and SELECT Options
//   const { data: termListQuery } = useTermList({
//     sort: 'asc',
//     batch_id: user?.cur_batch?.id,
//   });

//   const { options: termOptions } = useListOption({
//     listData: termListQuery?.list,
//     labelKey: 'term_name',
//     valueKey: 'id',
//   });

//   const { data: classListQuery } = useDivisionList({
//     sort: 'asc',
//     batch_id: user?.cur_batch?.id,
//   });

//   const { options: classOptions } = useListOption({
//     listData: classListQuery?.list,
//     labelKey: 'name',
//     valueKey: 'id',
//   });

//   const { data: gradeListQuery } = useGradeList({
//     sort: 'asc',
//   });

//   const { options: gradeOptions } = useListOption({
//     listData: gradeListQuery?.list,
//     labelKey: 'grade_number',
//     valueKey: 'id',
//   });

//   const { data: subjectListQuery } = useSubjectList({
//     grade_id: filterData?.grade?.id,
//     term_id: selectedTermFilter,
//     search: searchTerm, // Apply search term for subject search
//   });

//   const subjectList =
//     subjectListQuery?.subjects.map((subject: any) => ({
//       label: subject?.master_subject?.subject_name,
//       value: subject?.id,
//     })) || [];

//   const { options: subjectOptions } = useListOption({
//     listData: subjectList,
//     labelKey: 'label',
//     valueKey: 'value',
//   });

//   useEffect(() => {
//     if (filterData?.grade?.id && filterData?.grade?.id !== 'null') {
//       setTermSelectedFilter(filterData?.term?.id);
//     }
//   }, [filterData]);

//   // Dynamic filters based on enabled options
//   const selectFilters: SelectFilter[] = [
//     filtersEnabled.term && {
//       key: 'term',
//       placeholder: 'Filter by Term',
//       options: termOptions,
//       defaultValue: filterData?.term?.id,
//     },
//     filtersEnabled.grade && {
//       key: 'grade',
//       placeholder: 'Filter by Grade',
//       options: gradeOptions,
//       defaultValue: filterData?.grade?.id,
//     },
//     filtersEnabled.class && {
//       key: 'class',
//       placeholder: 'Filter by Class',
//       options: classOptions,
//       defaultValue: filterData?.class?.id,
//     },
//     filtersEnabled.subject && {
//       key: 'subject',
//       placeholder: 'Filter by Subject',
//       options: subjectOptions,
//       defaultValue: filterData?.subject?.id,
//     },
//   ]
//     .filter(Boolean)
//     .map((filter) => filter as SelectFilter);

//   // Handlers for select changes
//   const handleSelectChange = (key: string, value: string) => {
//     switch (key) {
//       case 'term':
//         setTermSelectedFilter(value);
//         break;
//       case 'grade':
//         break; // Handle grade-specific logic here if necessary
//       case 'class':
//         break; // Handle class-specific logic here if necessary
//       case 'subject':
//         break; // Handle subject-specific logic here if necessary
//       default:
//         break;
//     }
//   };

//   // Handle search term change
//   const handleSearchChange = (term: string) => {
//     setSearchTerm(term);
//   };

//   const debouncedSearch = useCallback(
//     (searchTerm: string) => {
//       if (searchEnabled) {
//         handleSearchChange(searchTerm);
//       }
//     },
//     [searchEnabled]
//   );

//   return {
//     selectFilters,
//     handleSelectChange,
//     debouncedSearch,
//     searchTerm,
//   };
// }
