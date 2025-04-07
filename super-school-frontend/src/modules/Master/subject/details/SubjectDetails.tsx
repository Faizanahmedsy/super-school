import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import TanstackTable from '@/components/global/CustomTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useGlobalState from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs } from 'antd';
import { BookOpen, ChevronLeft, GraduationCap, HashIcon, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClasswiseLearnerTeacherList, useDivisionSubjectList } from '../subject.action';
import UIText from '@/components/global/Text/UIText';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { useEffect, useState } from 'react';
import { QueryParams } from '@/services/types/params';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';

export default function SubjectDetails({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  // HOOKS
  const navigate = useNavigate();

  // GLOBAL STATE
  const filterData = useGlobalState((state) => state.filterData);
  const schoolId = useRoleBasedSchoolId();
  const [type, setType] = useState('student');

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: Number(1),
    limit: Number(10),
    school_id: schoolId,
    batch_id: filterData.batch?.id,
    grade_class_id: filterData.class?.id,
    grade_id: filterData.grade?.id,
    master_subject_id: Number(filterData.masterSubject?.id),
    subject_id: Number(filterData?.subject?.id),
  });

  // API

  // const subjectDetailsApi = useSubjectDetails(Number(filterData?.subject?.id[0])); //TODO: FIX THIS LATER

  const divisionSubjectListApi = useClasswiseLearnerTeacherList({ ...pageQuery, type: type }) as any;

  let studentDynaamicData: any = [];

  divisionSubjectListApi?.data?.list?.map((item: any) => {
    item.students.map((student: { id: any; first_name: any; last_name: any }) => {
      let checkExist = studentDynaamicData.find((x: { id: any }) => x.id === student.id);
      if (!checkExist) {
        studentDynaamicData.push(student);
      }
    });
  });

  const teacherDynamicData = Array.from(
    new Map(
      divisionSubjectListApi?.data?.list?.map(
        (item: {
          teacher: { id: any; first_name: any; last_name: any; gender: any; mobile_number: any; email: any };
        }) => [
          item.teacher?.id, // Use teacher ID as the key
          {
            firstName: item.teacher?.first_name,
            lastName: item.teacher?.last_name,
            gender: item.teacher?.gender || '-',
            phoneNumber: item.teacher?.mobile_number || '-',
            email: item.teacher?.email || '-',
          },
        ]
      )
    ).values()
  );

  const studentColumns: ColumnDef<(typeof studentDynaamicData)[0]>[] = [
    {
      accessorKey: 'first_name',
      header: 'First Name',
    },
    {
      accessorKey: 'last_name',
      header: 'Last Name',
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }: any) => <span>{row.original.gender}</span>,
    },
    {
      accessorKey: 'mobile_number',
      header: 'Phone Number',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: any) => <span>{row.original.email}</span>,
    },
    {
      header: 'Actions',
      cell: ({ row }: any) => <TableViewBtn onClick={() => navigate(`/learner/detail/${row.original.id}`)} />,
    },
  ];

  const teacherColumns: ColumnDef<any[0]>[] = [
    {
      accessorKey: 'first_name',
      header: 'First Name',
    },
    {
      accessorKey: 'last_name',
      header: 'Last Name',
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }: any) => <span>{row.original.gender}</span>,
    },
    {
      accessorKey: 'mobile_number',
      header: 'Phone Number',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: any) => <span>{row.original.email}</span>,
    },
    {
      header: 'Actions',
      cell: ({ row }: any) => <TableViewBtn onClick={() => navigate(`/teacher/detail/${row.original.id}`)} />,
    },
  ];

  // const data = divisionSubjectListApi?.data?.list[0];
  const subjectDetailsData = filterData?.subject?.details;
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  useEffect(() => {
    setType('student');
  }, [setType]);

  return (
    <div>
      <Card className="bg-white  rounded-lg overflow-hidden mb-5">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex justify-between items-center">
            <div className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              Subject Information
            </div>
            <Button variant="outline" size="sm" className="hover:bg-indigo-50" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-500">
                  <UIText>Subject Name</UIText>
                </span>
              </div>
              <div className="text-gray-800 font-semibold">
                {subjectDetailsData?.master_subject?.subject_name || 'No Data'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600">
                <HashIcon className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-500">
                  <UIText>Subject Code</UIText>
                </span>
              </div>
              <div className="text-gray-800 font-semibold">
                {subjectDetailsData?.master_subject?.subject_code || 'No Data'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-500">
                  <UIText>Grade</UIText>
                </span>
              </div>
              <div className="text-gray-800 font-semibold">{subjectDetailsData?.grade?.grade_number}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-500">
                  <UIText>Class</UIText>
                </span>
              </div>
              <div className="text-gray-800 font-semibold">{subjectDetailsData?.division?.name}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Tabs
            defaultActiveKey="1"
            className="py-5"
            items={[
              {
                label: (
                  <div onClick={() => setType('student')}>
                    <UIText>Learner</UIText>
                  </div>
                ),
                key: '1',
                children: (
                  <>
                    <DynamicTable
                      data={
                        Array.isArray(divisionSubjectListApi?.data?.data)
                          ? divisionSubjectListApi?.data?.data || []
                          : []
                      }
                      columns={studentColumns}
                      loading={divisionSubjectListApi.isLoading}
                      className="p-0"
                      totalCount={divisionSubjectListApi?.data?.pagination?.totalCount || 0}
                      pageSize={pageQuery.limit}
                      pageIndex={(pageQuery.page ?? 1) - 1}
                      onPaginationChange={handlePaginationChange}
                    />
                  </>
                ),
              },
              {
                label: (
                  <div onClick={() => setType('teacher')}>
                    <UIText>Teacher</UIText>
                  </div>
                ),
                key: '2',
                children: (
                  <>
                    <DynamicTable
                      data={
                        Array.isArray(divisionSubjectListApi?.data?.data)
                          ? divisionSubjectListApi?.data?.data || []
                          : []
                      }
                      columns={teacherColumns}
                      loading={divisionSubjectListApi.isLoading}
                      className="p-0"
                      totalCount={divisionSubjectListApi?.data?.pagination?.totalCount || 0}
                      pageSize={pageQuery.limit}
                      pageIndex={(pageQuery.page ?? 1) - 1}
                      onPaginationChange={handlePaginationChange}
                    />
                  </>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
