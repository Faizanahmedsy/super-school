import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';
import { useMasterSubjectList } from '@/services/mastersubject/mastersubject.hook';
import { QueryParams } from '@/services/types/params';
import { Card } from 'antd';
import { debounce } from 'lodash';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { masterSubjectColumn } from '../mastersubject.column';
import UIText from '@/components/global/Text/UIText';

const gradeOption = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '10', value: '10' },
  { label: '11', value: '11' },
  { label: '12', value: '12' },
];

const MasterSubjectlist = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>('1');
  const [page, setPage] = useState<QueryParams>({
    page: 1,
    limit: 10,
  });

  const { data: masterSubjectList, isLoading: subjectLoader } = useMasterSubjectList({
    ...page,
    sort: 'asc',
    grade_number: selectedFilter ? selectedFilter : '',
  });

  const handlePagination = (pageIndex: number, pageSize: number) => {
    setPage((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const debouncedSearch = debounce((searchTerm: string) => {
    setPage((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, 300);

  const handleSearchInputChange = (searchTerm: string) => {
    debouncedSearch(searchTerm);
  };

  // Handle Grade Select Change
  const handleGradeSelectChange = (value: string) => {
    setSelectedFilter(value);
    setPage({
      ...page,
      page: 1,
    });
  };

  return (
    <div>
      <Card className="w-full bg-slate-200 rounded-lg">
        <div className="flex justify-between">
          <p className="text-2xl font-bold text-slate-600 p-0 m-0">Master Subject</p>
          <CreateButton
            moduleName={MODULE.GENERAL_SETTINGS}
            action={ACTION.ADD}
            checkPermission={false}
            onClick={() => {
              navigate('/master-subject/create');
            }}
            overrideText="Add Master Subject"
          />
        </div>
        <DynamicTable
          data={Array.isArray(masterSubjectList?.list) ? masterSubjectList?.list || [] : []}
          columns={masterSubjectColumn}
          loading={subjectLoader}
          searchColumn="subject_name"
          searchPlaceholder="Search by Subject Name"
          totalCount={masterSubjectList?.totalCount || 0}
          pageSize={page.limit}
          pageIndex={(page.page ?? 1) - 1}
          onPaginationChange={handlePagination}
          onSearchChange={handleSearchInputChange}
          selectFilters={[
            {
              key: 'grade',
              placeholder: (
                <>
                  <UIText>Filter by Grade</UIText>
                </>
              ),
              options: gradeOption,
              onSelectChange: handleGradeSelectChange,
              defaultValue: selectedFilter,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default MasterSubjectlist;
