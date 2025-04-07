import UILoader from '@/components/custom/loaders/UILoader';
import PageTitle from '@/components/global/PageTitle';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { capitalizeFirstLetter, formatTerm } from '@/lib/common-functions';
import { useStudentAnalytics } from '@/modules/PersonaisedLearning/PracticeExercises/action/personalized-learning.action';
import { useStudentDetails } from '@/services/management/students/students.hook';
import { useTermList } from '@/services/master/term/term.action';
import { Select, Skeleton, Tabs } from 'antd';
import { GraduationCap, Mail, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import StudentAssessmentAccordion from '../shared/StudentAssessmentAccordian';
import { useBatchList } from '@/services/assessments/assessments.hook';
import { useListOption } from '@/hooks/use-select-option';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import UISelect from '@/components/global/Form/v4/UISelect';
import { useSubjectList } from '@/modules/Master/subject/subject.action';

export default function StudentDetails({ role }: { role: string }) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const studentUserId = searchParams.get('std_id');
  const currentBatch = useRoleBasedCurrentBatch();
  const studentDetail: any = useStudentDetails(params?.id as string);
  const school_id = useRoleBasedSchoolId();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const [selectedTerm, setSelectedTerm] = useState<string>();
  const [tabItems, setTabItems] = useState<any[]>([]);
  const termList = useTermList(
    {
      batch_id: currentBatch,
      grade_id: studentDetail?.data?.grade?.id,
    },
    Boolean(studentDetail?.data?.grade?.id)
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

  useEffect(() => {
    if (termList?.data?.list && termList.data.list.length > 0) {
      setSelectedTerm(termList.data.list[0].id);
    }
  }, [termList?.data?.list]);

  const studentAssessmentDetails = useStudentAnalytics(
    {
      student_id: String(params?.id ? params?.id : studentUserId),
      term_id: Number(selectedTerm),
      batch_id: currentBatch,
      grade_class: studentDetail?.data?.grade_class_id,
      grade: studentDetail?.data?.grade_id,
      subject_id: selectedSubject,
    },
    Boolean(selectedTerm && selectedSubject)
  );

  const [year, setYear] = useState<number>();
  // Sample student data

  const { data: subjectListQuery } = useSubjectList(
    {
      sort: 'asc',
      batch_id: currentBatch,
      grade_id: studentDetail?.data?.grade_id,
      term_id: selectedTerm,
      checkStudent: true,
    },
    Boolean(selectedTerm)
  );

  const subjectOptions =
    subjectListQuery?.subjects?.map((item: any) => ({
      value: item.id,
      label: `${item?.master_subject?.subject_name} ${formatTerm(item?.term?.term_name)}`,
    })) || [];

  useEffect(() => {
    if (subjectOptions.length > 0) {
      setSelectedSubject(subjectOptions[0].value);
    }
  }, [subjectListQuery]);

  useEffect(() => {
    setYear(studentDetail?.data?.batch?.start_year);
  }, [studentDetail]);

  if (studentDetail?.isLoading) {
    return (
      <div className="min-h-screen bg-white grid place-content-center">
        <UILoader />
      </div>
    );
  }

  return (
    <>
      <PageTitle breadcrumbs={[{ label: 'Students List', href: '/learner/list' }, { label: 'Learner Details' }]}>
        Learner Details
      </PageTitle>

      <div className="min-h-screen bg-white p-6 rounded-2xl">
        <div className="container mx-auto">
          {/* Basic Info Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-8">
                {studentDetail?.data?.profile_image && !studentDetail?.data.profile_image.includes('null') ? (
                  <img
                    src={studentDetail?.data.profile_image}
                    alt="Profile Picture"
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <Skeleton.Avatar active={studentDetail?.isLoading} size={100} shape="circle" />
                )}

                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {capitalizeFirstLetter(studentDetail?.data?.first_name) +
                        ' ' +
                        capitalizeFirstLetter(studentDetail?.data?.last_name)}
                    </h1>
                    {studentDetail?.data?.addmission_no && (
                      <Badge className="text-base px-4 py-2 bg-secondary text-primary">
                        Admission Number: {studentDetail?.data?.addmission_no}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-self-auto gap-4 flex-wrap">
                    {studentDetail?.data?.email && (
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <span>{studentDetail?.data?.email}</span>
                      </div>
                    )}
                    {studentDetail?.data?.mobile_number && (
                      <div className="flex items-center gap-3">
                        <div className="bg-green-50 p-2 rounded-full">
                          <Phone className="h-5 w-5 text-green-500" />
                        </div>
                        <span>{studentDetail?.data?.mobile_number}</span>
                      </div>
                    )}
                    {studentDetail?.data?.gender && (
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-50 p-2 rounded-full">
                          <User className="h-5 w-5 text-purple-500" />
                        </div>
                        <span>
                          {studentDetail?.data?.gender === null
                            ? 'N/A'
                            : capitalizeFirstLetter(studentDetail?.data?.gender)}
                        </span>
                      </div>
                    )}
                    {/* Parent details */}
                  </div>
                </div>
              </div>

              {studentDetail?.data?.parents?.length ? (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Parent Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {studentDetail.data.parents.map((parent: any, idx: number) =>
                        parent ? (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {capitalizeFirstLetter(parent.first_name) +
                                  ' ' +
                                  capitalizeFirstLetter(parent.last_name)}{' '}
                                {parent.relationship && (
                                  <span className="ml-2 text-sm text-white bg-nsc-green-light  px-3 py-1 rounded-full">
                                    {capitalizeFirstLetter(parent.relationship)}
                                  </span>
                                )}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-50 p-2 rounded-full">
                                <Mail className="h-5 w-5 text-blue-500" />
                              </div>
                              {parent.email && <span>{parent.email}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-green-50 p-2 rounded-full">
                                <Phone className="h-5 w-5 text-green-500" />
                              </div>
                              {parent.mobile_number && <span>{parent.mobile_number}</span>}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </CardContent>
          </Card>

          {/* Current Batch Details */}
          <div className="mb-12 border p-4 rounded-xl">
            <div className="flex justify-between items-center gap-3 mb-6">
              <div className="flex gap-3 justify-center items-center">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                <div className="text-2xl font-semibold text-gray-900">Academic Details</div>
              </div>
              {/* <div className="w-[150px]">
                <Select
                  className="w-full"
                  placeholder="Select year"
                  options={yearListOptions}
                  defaultValue={currentBatch}
                  onChange={(value) => {
                    handleChangeYear(value);
                  }}
                />
              </div> */}
            </div>
            <Separator />
            <div className="space-y-6 py-10">
              <div className="flex gap-4">
                <div className="flex-1 bg-nsc-gold rounded-xl p-4 text-center">
                  <div className="text-sm text-white mb-1">Year</div>
                  <div className="text-2xl font-bold text-white">{year}</div>
                </div>
                <div className="flex-1 bg-nsc-red rounded-xl p-4 text-center">
                  <div className="text-sm text-white mb-1">Grade</div>
                  <div className="text-2xl font-bold text-white">{studentDetail?.data?.grade?.grade_number}</div>
                </div>
                <div className="flex-1 bg-nsc-green rounded-xl p-4 text-center">
                  <div className="text-sm text-white mb-1">Class</div>
                  <div className="text-2xl font-bold text-white">{studentDetail?.data?.division?.name}</div>
                </div>
                <div className="flex-1 bg-nsc-rust rounded-xl p-4 text-center">
                  <div className="text-sm text-white mb-1">No of Subjects</div>
                  <div className="text-2xl font-bold text-white">{studentDetail?.data?.divisionSubjects?.length}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 flex-col">
              {/* Current Subjects */}
              <Card className="lg:col-span-2 bg-gray-100">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Subjects</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {studentDetail?.data?.divisionSubjects?.map((subject: any, idx: number) => {
                      return (
                        <>
                          <div className="bg-white border  rounded-xl px-3 py-3 text-black text-lg font-medium">
                            {subject?.master_subject?.subject_name}
                          </div>
                        </>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {role === 'learnerprofile' ? null : (
              <Card className="mt-5">
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 pb-5">
                    <div className="flex gap-4">
                      <div className="flex-1 bg-nsc-rust rounded-xl p-4 text-center">
                        <div className="text-sm text-white mb-1">Grade Rank</div>
                        <div className="text-2xl font-bold text-white">
                          {studentAssessmentDetails?.data?.grade_rank ?? 0}
                        </div>
                      </div>
                      <div className="flex-1 bg-nsc-red rounded-xl p-4 text-center">
                        <div className="text-sm text-white mb-1">Class Rank</div>
                        <div className="text-2xl font-bold text-white">
                          {studentAssessmentDetails?.data?.class_rank ?? 0}
                        </div>
                      </div>

                      <div className="flex-1 bg-nsc-honey rounded-xl p-4 text-center">
                        <div className="text-sm text-white mb-1">Achevement Level</div>
                        <div className="text-2xl font-bold text-white">
                          {studentAssessmentDetails?.data?.achievement_level ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <UISelect
                      allowClear
                      placeholder="Select Subject"
                      options={subjectOptions}
                      className="w-[300px]"
                      value={selectedSubject} // Bind value for controlled component
                      onChange={(value: number) => setSelectedSubject(value)}
                    />
                  </div>

                  <Tabs
                    activeKey={selectedTerm} // Control active tab
                    onChange={(key) => setSelectedTerm(key)} // Update selectedTerm when tab changes
                    className="py-5"
                    items={termList?.data?.list?.map((item: any) => ({
                      label: (
                        <div
                          onClick={() => setSelectedTerm(item.id)} // Optional, but unnecessary due to onChange
                        >
                          {item?.term_name}
                        </div>
                      ),
                      key: item?.id,
                      children: (
                        <StudentAssessmentAccordion
                          data={studentAssessmentDetails?.data?.results || []}
                          studentData={studentAssessmentDetails}
                          isPending={studentAssessmentDetails?.isPending}
                        />
                      ),
                    }))}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const TrophySVG = () => {
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 32 32">
        <g fill="none">
          <path
            fill="#0074ba"
            d="m18.768 11.51l-5.22-8.58c-.34-.58-.95-.93-1.62-.93h-6.59c-1.45 0-2.36 1.56-1.65 2.82a16.7 16.7 0 0 0 5.43 5.78c.76.59 1.7.91 2.67.91z"
          />
          <path
            fill="#00a6ed"
            d="M26.658 2h-6.59c-.67 0-1.28.35-1.62.93l-5.22 8.58h6.99c.97 0 1.9-.32 2.67-.91c2.25-1.46 4.11-3.44 5.43-5.78c.7-1.26-.21-2.82-1.66-2.82"
          />
          <path
            fill="#ffb02e"
            d="M15.99 30c5.545 0 10.04-4.607 10.04-10.29S21.535 9.42 15.99 9.42S5.95 14.027 5.95 19.71S10.445 30 15.99 30"
          />
          <path
            fill="#6d4534"
            d="M14.076 16.041a1 1 0 0 1 1-1H16a1 1 0 0 1 1 1V23a1 1 0 1 1-2 0v-5.962a1 1 0 0 1-.924-.997"
          />
          <path
            fill="#fcd53f"
            d="M16 28.76c-2.36 0-4.58-.94-6.24-2.65a9.1 9.1 0 0 1-2.59-6.4c0-2.42.92-4.69 2.59-6.4a8.69 8.69 0 0 1 12.49 0c3.44 3.53 3.44 9.27 0 12.8c-1.68 1.71-3.9 2.65-6.25 2.65m-.01-16.87c-1.95 0-3.91.76-5.39 2.29a7.87 7.87 0 0 0-2.23 5.53c0 2.09.79 4.05 2.23 5.53a7.48 7.48 0 0 0 5.39 2.29c2.04 0 3.95-.81 5.39-2.29c2.97-3.05 2.97-8.01 0-11.06a7.46 7.46 0 0 0-5.39-2.29"
          />
        </g>
      </svg>
    </>
  );
};
