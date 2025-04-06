import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { useBatchList } from '@/services/assessments/assessments.hook';
import { useDigitalMarkingProcess } from '@/modules/Dashboards/action/dashboard.actions';
import { useGradingProgressList } from '@/services/gradingprogress/gradingprogress.hooks';
import { useCreateBatch } from '@/services/master/batch/batch.action';
import useGlobalState from '@/store';
import { DatePicker, Form, Modal, Progress, Spin } from 'antd';
import dayjs from 'dayjs';
import { AlertTriangle, CalendarFold } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageTitle from '../PageTitle';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { capitalizeFirstLetter, formatDate, formatTerm } from '@/lib/common-functions';
import { QueryParams } from '@/services/types/params';
import { debounce } from 'lodash';
import UIText from '../Text/UIText';
import { UITitlesV3 } from '../Card/UITitlesV3';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

export default function ChooseYearTile({
  step,
  setStep,
  allowCreate,
  isMarkingProcess,
}: {
  step: number;
  setStep: (step: number) => void;
  allowCreate?: boolean;
  isMarkingProcess?: boolean;
}) {
  const schoolId = useRoleBasedSchoolId();
  const setFilterData = useGlobalState((state) => state.setFilterData);
  const filterData = useGlobalState((state) => state.filterData);
  const [progresStatus, setProgressStatus] = useState('');
  const user = useGlobalState((state: any) => state.user);

  const isSuperAdmin = user.role_name == ROLE_NAME.SUPER_ADMIN;

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data: gradingProgress, isLoading: progressLoding } = useGradingProgressList({
    ...pageQuery,
    status: progresStatus,
    school_id: isSuperAdmin ? schoolId : undefined,
  });

  const { data: digitalMarkings } = useDigitalMarkingProcess({});

  const {
    data: yearData,
    refetch,
    isLoading,
  } = useBatchList({
    school_id: schoolId,
    sort: 'asc',
  });

  useEffect(() => {
    setProgressStatus('upcoming');
  }, [setProgressStatus]);

  const gradingProgressColumns: any = [
    {
      accessorKey: 'assessment_name',
      header: 'Assessment Name',
      cell: (info: any) => {
        const subjectName = capitalizeFirstLetter(info.getValue());
        return (
          <div className="flex items-center gap-2">
            <span>{subjectName ? subjectName : '-'}</span>
          </div>
        );
      },
    },
    // {
    //   accessorKey: 'assessment_subjects',
    //   header: 'Subject Name',
    //   cell: (info: any) => {
    //     const subjectList = info.getValue();
    //     return (
    //       <div className="flex flex-col gap-2">
    //         {subjectList?.length > 0
    //           ? subjectList?.map((subject: any, index: number) => (
    //               <span key={index}>
    //                 {subject.subject_name}
    //                 {index !== subjectList?.length - 1 && ','}
    //                 <br />
    //               </span>
    //             ))
    //           : '-'}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: 'term_name',
      header: 'Term',
      cell: (info: any) => {
        const termName = info.getValue();
        return <span>{termName ? formatTerm(termName) : '-'}</span>;
      },
    },
    {
      accessorKey: 'grade_number',
      header: 'Grade',
      cell: (info: any) => {
        const gradeNumber = info.getValue();
        return <span>{gradeNumber ? gradeNumber : '-'}</span>;
      },
    },
    // {
    //   accessorKey: 'grade_class__name',
    //   header: 'Class',
    //   cell: (info: any) => {
    //     const classNames = info.getValue();

    //     return <div className="flex items-center gap-2">{classNames ? classNames : '-'}</div>;
    //   },
    // },
    {
      accessorKey: 'assessment_start_datetime',
      header: 'Date',
      cell: (info: any) => {
        const date = new Date(info.getValue());
        return formatDate(date);
      },
    },
  ];

  const createBatchMutation = useCreateBatch();

  const [addModal, setAddModal] = useState(false);
  const [openActiveModal, setOpenActiveModal] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = (values: { year: string }) => {
    createBatchMutation.mutate(
      {
        school_id: Number(schoolId),
        start_year: dayjs(values.year).year(),
      },
      {
        onSuccess: () => {
          setAddModal(false);
          form.resetFields();
          refetch();
        },
      }
    );
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const debouncedSearch = debounce((searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, 300);

  const handleSearchInputChange = (searchTerm: string) => {
    debouncedSearch(searchTerm);
  };

  const handleClick = (status: string) => {
    setProgressStatus(status);
  };

  return (
    <>
      <div className="w-full p-1">
        <Card className="w-full mb-5">
          <CardHeader className="relative z-10">
            <CardTitle className="flex justify-between items-center">
              <div>
                <UIText>Select a Year</UIText>
              </div>
              <div className="flex justify-center items-center gap-4">
                {allowCreate && (
                  <Button size="sm" onClick={() => setAddModal(true)}>
                    Create Year
                  </Button>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              <UIText>Select a year to explore the associated data and insights.</UIText>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid sm:grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-4 gap-6">
              {yearData?.list
                ?.slice() // Create a copy to avoid mutating the original data
                .sort(
                  (
                    a: {
                      start_year: number;
                    },
                    b: {
                      start_year: number;
                    }
                  ) => b.start_year - a.start_year
                ) // Sort years in descending order
                .map((batch: any, index: any, sortedList: any) => {
                  // Find the active year in the sorted list
                  const activeIndex = sortedList.findIndex((item: { is_active: boolean }) => item.is_active);

                  // Add showActivateBtn to years after the active year
                  const showActivateBtn = activeIndex >= 0 && index < activeIndex;

                  return { ...batch, showActivateBtn };
                })
                ?.map(
                  (
                    batch: {
                      id: number;
                      start_year: number;
                      is_active: boolean;
                      showActivateBtn: boolean;
                    },
                    index: number
                  ) => (
                    <UITitlesV3
                      key={index}
                      title={String(batch.start_year)} // Use dynamic title from data
                      onClick={() => {
                        setFilterData({
                          ...filterData,
                          batch: {
                            id: String(batch.id),
                            name: batch.start_year.toString(),
                          },
                        });
                        setStep(step + 1);
                      }}
                      active={batch.is_active} // Pass active prop from data
                      footer={
                        <>
                          {batch.is_active && (
                            <div className="px-2 text-[10px] rounded-full bg-white/80 hover:bg-white/80 transition-colors duration-300 w-fit text-black">
                              <UIText>Currently Active Year</UIText>
                            </div>
                          )}
                        </>
                      }
                    />
                  )
                )}

              {isLoading && (
                <div className="flex items-center justify-center col-span-full min-h-72">
                  <Spin />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {isMarkingProcess && (
          <>
            <Card className="w-full">
              <CardHeader className="relative z-10">
                <CardTitle className="flex justify-between items-center">
                  <div>
                    <UIText>Grading Progress</UIText>
                  </div>
                </CardTitle>
                {/* <CardDescription>Select a year to explore the associated data and insights.</CardDescription> */}
              </CardHeader>
              <CardContent className="px-6 mt-5">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 place-content-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div onClick={() => handleClick('upcoming')}>
                      <Progress
                        type="circle"
                        className="cursor-pointer"
                        percent={digitalMarkings?.percentages?.upcoming}
                        strokeColor={'red'}
                        strokeWidth={10}
                      />
                    </div>
                    <label
                      className={`text-center ${progresStatus === 'upcoming' ? 'font-bold text-red-700 bg-red-100 p-1 rounded-1xl' : ''}`}
                    >
                      <UIText>Upcoming</UIText>
                    </label>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div onClick={() => handleClick('in_progress')}>
                      <Progress
                        type="circle"
                        className="cursor-pointer"
                        percent={digitalMarkings?.percentages?.in_progress}
                        strokeColor={'orange'}
                        strokeWidth={10}
                      />
                    </div>
                    <label
                      className={`text-center ${progresStatus === 'in_progress' ? 'font-bold text-yellow-600 bg-yellow-100 p-1 rounded-1xl' : ''}`}
                    >
                      <UIText>In Progress</UIText>
                    </label>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div onClick={() => handleClick('completed')}>
                      <Progress
                        type="circle"
                        className="cursor-pointer"
                        percent={digitalMarkings?.percentages?.completed}
                        strokeColor={'green'}
                        strokeWidth={10}
                      />
                    </div>
                    <label
                      className={`text-center ${progresStatus === 'completed' ? 'font-bold text-[#008000] bg-green-100 p-1 rounded-1xl' : ''}`}
                    >
                      <UIText>Completed</UIText>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-5">
              <AppPageMeta title="Grading Process List" />
              <PageTitle>{capitalizeFirstLetter(`${progresStatus}Progress List`)}</PageTitle>
              <AppsContainer title={''} fullView={true} type="bottom">
                <div className="p-4">
                  <DynamicTable
                    data={Array.isArray(gradingProgress?.results) ? gradingProgress?.results || [] : []}
                    columns={gradingProgressColumns}
                    loading={progressLoding}
                    searchColumn="assessment_name"
                    searchPlaceholder="Search by Assessment Name"
                    totalCount={gradingProgress?.totalCount || 0}
                    pageSize={pageQuery.limit}
                    pageIndex={(pageQuery.page ?? 1) - 1}
                    onPaginationChange={handlePaginationChange}
                    onSearchChange={handleSearchInputChange}
                  />
                </div>
              </AppsContainer>
            </div>
          </>
        )}
      </div>

      <Modal
        open={addModal}
        onCancel={() => setAddModal(false)}
        title="Add Year"
        okButtonProps={{
          loading: createBatchMutation.isPending,
        }}
        centered
        onOk={() => {
          form.submit();
        }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Select Year"
            name="year"
            rules={[{ required: true, message: requireMessage('year', 'select') }]}
            className="w-full"
          >
            <DatePicker
              onChange={(_, value) => {
                if (typeof value === 'string') {
                  // setStartYear(value);
                }
              }}
              className="w-full"
              picker="year"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={openActiveModal} onCancel={() => setOpenActiveModal(false)} title="Activate Year" centered>
        <div className="space-y-2 mt-[30px]">
          {/* Warning Icon and Main Message */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
              <CalendarFold className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-gray-900">Are you sure you want to activate this year?</p>
          </div>

          {/* Warning Box */}
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="mb-2">
                If you choose to activate this year, the following data will be copied to your new active year:
              </p>
              <ul className="ml-4 space-y-1 list-disc">
                <li>All teacher records</li>
                <li>All grade records</li>
                <li>All subject records</li>
                <li>All term records</li>

                <li>All class records</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
