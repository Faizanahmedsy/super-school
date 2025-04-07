import PageTitle from '@/components/global/PageTitle';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from 'antd';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';

import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useListOption } from '@/hooks/use-select-option';
import { calculateDurationFromDate, capitalizeFirstLetter } from '@/lib/common-functions';
import { useDivisionSubjectList } from '@/modules/Master/subject/subject.action';
import { useBatchList } from '@/services/assessments/assessments.hook';
import { useTeacherGetDataById, useTeacherSubjectlistGetDataById } from '@/services/management/teacher/teacher.hook';
import { SubjectPaylaod } from '@/services/types/payload';
import { ColumnDef } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { QueryParams } from '@/services/types/params';
import UILoader from '@/components/custom/loaders/UILoader';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import useGlobalState from '@/store';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

export const SubjectDetailsColumns: ColumnDef<SubjectPaylaod>[] = [
  {
    accessorKey: 'subject_name',
    header: 'Subject',
  },
  {
    accessorKey: 'subject_code',
    header: 'Subject Code',
  },
  {
    accessorKey: 'grade_number',
    header: 'Grade',
  },
  {
    accessorKey: 'division',
    header: 'Classes',
  },
];

export default function TeacherDetails() {
  const [selectedYear, setYear] = useState<number>();
  const batch_id = useRoleBasedCurrentBatch();
  const school_id = useRoleBasedSchoolId();
  const user = useGlobalState((state) => state.user);

  const params = useParams();

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    batch_id: batch_id,
  });

  const cur_batch_id: any = useRoleBasedCurrentBatch();

  const { data: getDataById, isLoading } = useTeacherGetDataById(Number(params?.id));

  const { data: getSubjectList, isLoading: subjectListLoading } = useTeacherSubjectlistGetDataById(
    { ...pageQuery },
    Number(params?.id)
  );

  const { data: yearData } = useBatchList({
    sort: 'asc',
    school_id: school_id,
  });

  const batchList = useListOption({
    listData: yearData?.list,
    labelKey: 'start_year',
    valueKey: 'id',
  });

  const yearListOptions = batchList?.options ? batchList?.options : [];

  const date = getDataById?.hire_date ? calculateDurationFromDate(getDataById.hire_date as string) : null;

  const formatExperience = () => {
    if (!date) return null;

    const years = date.years || 0;
    const months = date.months || 0;
    const days = date.days || 0;

    if (years === 0 && months === 0 && days === 0) return null;

    let experience = [];
    if (years > 0) experience.push(`${years} Year${years > 1 ? 's' : ''}`);
    if (months > 0) experience.push(`${months} Month${months > 1 ? 's' : ''}`);
    if (days > 0) experience.push(`${days} Day${days > 1 ? 's' : ''}`);

    return experience.join(' ');
  };

  const experience = formatExperience();

  const divisionSubjectListApi = useDivisionSubjectList({
    teacher_id: params?.id,
    batch_id: selectedYear,
  }) as any;

  const handleChangeYear = (Value: number) => {
    setYear(Value);
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };
  return (
    <>
      <PageTitle breadcrumbs={[{ label: 'Teacher List', href: '/teacher/list' }, { label: 'Teacher Details' }]}>
        Teacher Details
      </PageTitle>

      <div className="min-h-screen bg-white p-6 rounded-2xl">
        <div className="container">
          {/* Hero Section with Basic Info */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {isLoading ? (
              <UILoader />
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={getDataById?.profile_image}
                      alt="Profile"
                      className="w-32 h-32 rounded-2xl object-cover shadow-md"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-grow space-y-6">
                    {/* Name */}
                    <h1 className="text-3xl font-bold text-gray-900">
                      {getDataById?.first_name} {getDataById?.last_name}
                    </h1>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Email */}
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="text-sm text-gray-500 mb-1">Email</div>
                        <div className="text-gray-900 break-all">{getDataById?.email}</div>
                      </div>

                      {/* Phone */}
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="text-sm text-gray-500 mb-1">Phone</div>
                        <div className="text-gray-900">{getDataById?.mobile_number}</div>
                      </div>

                      {/* Gender */}
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="text-sm text-gray-500 mb-1">Gender</div>
                        <div className="text-gray-900">
                          {getDataById?.gender === null ? 'N/A' : capitalizeFirstLetter(getDataById?.gender)}
                        </div>
                      </div>

                      {/* Experience */}

                      {experience && (
                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <div className="text-sm text-gray-500 mb-1">Experience</div>
                          <div className="text-gray-900">{experience}</div>
                        </div>
                      )}

                      {/* Persal Number */}
                      {getDataById?.persal_number &&
                        user?.details?.id === params?.id &&
                        user?.role_name === ROLE_NAME.TEACHER && (
                          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="text-sm text-gray-500 mb-1">Persal Number</div>
                            <div className="text-gray-900">{getDataById?.persal_number}</div>
                          </div>
                        )}

                      {/* SACE Number */}
                      {getDataById?.sace_number &&
                        user?.details?.id === params?.id &&
                        user?.role_name === ROLE_NAME.TEACHER && (
                          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="text-sm text-gray-500 mb-1">SACE Number</div>
                            <div className="text-gray-900">{getDataById?.sace_number}</div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Current Teaching Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center gap-3 mb-6">
              <div className="flex gap-3 justify-center items-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div className="text-2xl font-semibold text-gray-900">Teaching Details</div>
              </div>
              {/* <div className="w-[150px]">
                <Select
                  className="w-full"
                  placeholder="Select year"
                  options={yearListOptions}
                  defaultValue={cur_batch_id}
                  onChange={(value) => {
                    handleChangeYear(value);
                  }}
                />
              </div> */}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div>Subjects</div>
                  <div className="flex gap-6 items-center">
                    <div className="text-sm text-slate-800">Total Subjects : {getSubjectList?.totalCount || 0}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicTable
                  loading={subjectListLoading}
                  data={getSubjectList?.list || []}
                  columns={SubjectDetailsColumns as ColumnDef<unknown>[]}
                  totalCount={getSubjectList?.totalCount || 0}
                  pageSize={pageQuery.limit}
                  pageIndex={(pageQuery.page ?? 1) - 1}
                  onPaginationChange={handlePaginationChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Teaching History Section */}
        </div>
      </div>
    </>
  );
}
export function SubjectsCardView({ teacherData }: any) {
  return (
    <>
      <div>
        <div className="space-y-6">
          {teacherData.teachingHistory.map((year: any, idx: number) => (
            <div key={idx} className="overflow-hidden">
              <div className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {year.subjects?.map((subject: any, subIdx: number) => (
                    <div key={subIdx} className="bg-gray-50 rounded-lg p-4 border hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between">
                        <h4 className=" mb-3 text-xl font-semibold">{subject.name}</h4>
                        <h4 className="font-medium mb-3 space-x-3">
                          {subject.terms.map((term: string, termIdx: number) => (
                            <Badge key={termIdx} variant="secondary" className="text-sm px-3 py-1">
                              {term}
                            </Badge>
                          ))}
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-base px-3 py-1 bg-cyan-100">
                          Grade {subject.grade}
                        </Badge>
                        {subject.class.map((cls: string, clsIdx: number) => (
                          <Badge key={clsIdx} variant="outline" className="text-base px-3 py-1 text-black bg-teal-100">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
