// import { useState, useEffect } from 'react';
// import { useListOption } from '@/hooks/use-select-option';
// import { useDivisionList } from '@/services/master/division/division.hook';
// import { useGradeList } from '@/services/master/grade/grade.hook';
// import { useTermList } from '@/services/master/term/term.action';
// import { useMainQuizList } from '@/services/personalized-learning/personalized-learning.hook';
// import { useSubjectList } from '@/modules/Master/subject/subject.action';
// import { QueryParams } from '@/services/types/params';
// import useGlobalState from '@/store';

// export const useQuizFilter = () => {
//   // LOCAL STATES
//   const [selectedFilter, setSelectedFilter] = useState<string>();
//   const [selectedTermFilter, setTermSelectedFilter] = useState<string>();
//   const [selectedClassFilter, setClassSelectedFilter] = useState<string>();
//   const [selectedSubjectFilter, setSubjectSelectedFilter] = useState<string>();

//   // GLOBAL STATES
//   const user = useGlobalState((state) => state.user);
//   const filterData = useGlobalState((state) => state.filterData);

//   // API Calls and SELECT Options
//   const isFilterApplied = {
//     batch: filterData?.batch?.id && filterData?.batch?.id !== 'null' ? true : false,
//     grade: filterData?.grade?.id && filterData?.grade?.id !== 'null' ? true : false,
//     class: filterData?.class?.id && filterData?.class?.id !== 'null' ? true : false,
//     term: filterData?.term?.id && filterData?.term?.id !== 'null' ? true : false,
//     subject: filterData?.subject?.id && filterData?.subject?.id !== 'null' ? true : false,
//   };

//   const [pageQuery, setPageQuery] = useState<QueryParams>({
//     page: 1,
//     limit: 10,
//     search: '',
//     grade: filterData?.grade?.id,
//     term: filterData?.term?.id,
//     grade_class: filterData?.class?.id,
//     ordering: '-created_at',
//   });

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

//   const { data } = useSubjectList({
//     grade_id: selectedFilter,
//     term_id: selectedTermFilter,
//   });

//   // Create a properly formatted subject list
//   const subjectList =
//     data?.subjects.map((subject: any) => ({
//       label: subject?.master_subject?.subject_name,
//       value: subject?.id,
//     })) || [];

//   // Pass the list to useListOption
//   const { options: subjectOptions } = useListOption({
//     listData: subjectList,
//     labelKey: 'label',
//     valueKey: 'value',
//   });

//   const mainQuizListQuery = useMainQuizList({
//     ...pageQuery,
//     term: selectedTermFilter || undefined,
//     grade: selectedFilter || undefined,
//     grade_class: selectedClassFilter || undefined,
//   });
//   const quizzesData = mainQuizListQuery?.data?.results?.main_quizzes;

//   useEffect(() => {
//     if (isFilterApplied.grade && filterData) {
//       setSelectedFilter(filterData?.grade?.id);
//     }
//     if (isFilterApplied.class && filterData) {
//       setClassSelectedFilter(filterData?.class?.id);
//     }
//     if (isFilterApplied.term && filterData) {
//       setTermSelectedFilter(filterData?.term?.id);
//     }
//   }, [filterData.grade, filterData.class, filterData.term, filterData.batch, filterData.subject]);

//   const handlePaginationChange = (pageIndex: number, pageSize: number) => {
//     setPageQuery((prev) => ({
//       ...prev,
//       page: pageIndex + 1,
//       limit: pageSize,
//     }));
//   };

//   const debouncedSearch = debounce((searchTerm: string) => {
//     setPageQuery((prev) => ({
//       ...prev,
//       search: searchTerm,
//     }));
//   }, 300);

//   const handleSearchInputChange = (searchTerm: string) => {
//     debouncedSearch(searchTerm);
//   };

//   const handleGradeSelectChange = (value: string) => {
//     setSelectedFilter(value);
//     setPageQuery({
//       ...pageQuery,
//       page: 1,
//     });
//   };

//   const handleTermSelectChange = (value: string) => {
//     setTermSelectedFilter(value);
//     setPageQuery({
//       ...pageQuery,
//       page: 1,
//     });
//   };

//   const handleClassSelectChange = (value: string) => {
//     setClassSelectedFilter(value);
//     setPageQuery({
//       ...pageQuery,
//       page: 1,
//     });
//   };

//   const handleSubjectSelectChange = (value: string) => {
//     setSubjectSelectedFilter(value);
//     setPageQuery({
//       ...pageQuery,
//       page: 1,
//     });
//   };

//   return {
//     quizzesData,
//     termOptions,
//     classOptions,
//     gradeOptions,
//     subjectOptions,
//     mainQuizListQuery,
//     handleSearchInputChange,
//     handlePaginationChange,
//     handleGradeSelectChange,
//     handleTermSelectChange,
//     handleClassSelectChange,
//     handleSubjectSelectChange,
//     pageQuery,
//   };
// };
