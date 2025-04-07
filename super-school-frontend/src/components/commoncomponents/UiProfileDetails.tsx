import PageTitle from '@/components/global/PageTitle';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { capitalizeFirstLetter, formatTerm } from '@/lib/common-functions';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { displayError } from '@/lib/helpers/errorHelpers';
import { InstitutePayload } from '@/modules/Management/Institutes/types';
import StudentAssessmentAccordion from '@/modules/Management/students/components/shared/StudentAssessmentAccordian';
import { useStudentAnalytics } from '@/modules/PersonaisedLearning/PracticeExercises/action/personalized-learning.action';
import { useInstituteDetails, useUpdateInstitute } from '@/services/management/institute/institute.hook';
import { useTermList } from '@/services/master/term/term.action';
import useRoleBasedAccess from '@/store/useRoleBasedAccess';
import { Avatar, Form, Input, Modal, Select, Tabs } from 'antd';
import {
  BookOpen,
  Building,
  Calendar,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  MapPinHouse,
  Palette,
  Pencil,
  Phone,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaBusinessTime } from 'react-icons/fa';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import UIFormSubmitButton from '../custom/buttons/UIFormSubmitButton';
import CustomFormItem from '../custom/form/CustomFormItem';
import UILoader from '../custom/loaders/UILoader';
import { SelectCity } from '../global/Form/SelectCity';
import SelectLocationType from '../global/Form/SelectLocationType';
import SelectMediumOfInstruction from '../global/Form/SelectMediumOfInstruction';
import SelectSchoolType from '../global/Form/SelectSchoolType';
import { SelectState } from '../global/Form/SelectState';
import UIText from '../global/Text/UIText';
import { Button } from '../ui/button';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import dayjs from 'dayjs';
import { useBatchList } from '@/services/assessments/assessments.hook';
import { useListOption } from '@/hooks/use-select-option';
import { useStudentDetails } from '@/services/management/students/students.hook';
import { DynamicTable } from '../custom/tanstack-table/DynamicTable';
import { useDivisionSubjectList, useSubjectList } from '@/modules/Master/subject/subject.action';
import { useTeacherSubjectlistGetDataById } from '@/services/management/teacher/teacher.hook';
import { QueryParams } from '@/services/types/params';
import { SubjectDetailsColumns } from '@/modules/Management/Teachers/components/subjectDetails-column';
import { ColumnDef } from '@tanstack/react-table';
import { useParentGetDataById } from '@/services/management/parent/parent.hook';
import { ChildrenColumns } from '@/modules/Management/parents/ChildrenDetailsColumn';
import UIFormItemSelect from '../global/Form/v4/UIFormItem';
import UISelect from '../global/Form/v4/UISelect';

export default function UIProfileDetails({ role }: { role: string }) {
  const user: any = useRoleBasedAccess((state) => state.user);
  const school_id: any = useRoleBasedSchoolId();
  const batchId = useRoleBasedCurrentBatch();
  const [selectedTerm, setSelectedTerm] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMod, setEditMod] = useState(false);
  const [schoolId, setSchoolId] = useState();
  const [year, setYear] = useState<number>();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const [form] = Form.useForm();
  const params: any = useParams();
  const studentAssessmentDetails = useStudentAnalytics(
    {
      ...(user?.role_name == ROLE_NAME.STUDENT && {
        student_id: String(user?.details?.id),
      }),
      term_id: Number(selectedTerm),
      batch_id: batchId,
      grade_class: user?.details?.division?.id,
      grade: user?.details?.grade?.id,
      status: 'completed',
      subject_id: selectedSubject,
    },
    Boolean(selectedTerm && selectedSubject)
  );

  const { data: getDataById, isLoading } = useParentGetDataById(user?.details?.id);

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    batch_id: batchId,
  });

  const updateInstituteMutation = useUpdateInstitute();
  const getInstituteDetails: any = useInstituteDetails(Number(schoolId ? schoolId : school_id));
  const studentDetail: any = useStudentDetails(user?.details?.id as string);
  const { data: getSubjectList, isLoading: subjectListLoading } = useTeacherSubjectlistGetDataById(
    { ...pageQuery },
    Number(user?.details?.id)
  );

  useEffect(() => {
    // setLoading(true);
    if (getInstituteDetails.isSuccess) {
      form.setFieldsValue(getInstituteDetails?.data);
      // setLoading(false);
    }
  }, [getInstituteDetails.isSuccess, getInstituteDetails?.data]);

  useEffect(() => {
    if (getInstituteDetails?.data?.province_id as number) {
      setStateId(getInstituteDetails?.data?.province_id as number);
    }
  }, [getInstituteDetails]);

  const handleSubmit = (payload: InstitutePayload) => {
    if ('district_id' in payload && typeof payload.district_id === 'string') {
      payload.district_id = Number(payload.district_id);
    }

    if ('province_id' in payload && typeof payload.province_id === 'string') {
      payload.province_id = Number(payload.province_id);
    }

    updateInstituteMutation.mutate(
      { id: Number(schoolId), payload },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          getInstituteDetails.refetch();
        },
        onError: (error: any) => {
          displayError(error?.response?.data?.message);
        },
      }
    );
  };

  const termList = useTermList(
    {
      batch_id: batchId,
      grade_id: user?.details?.grade?.id,
    },
    Boolean(user?.details?.grade?.id)
  );

  useEffect(() => {
    if (termList?.data?.list && termList.data.list.length > 0) {
      setSelectedTerm(termList.data.list[0].id);
    }
  }, [termList?.data?.list]);

  const [stateId, setStateId] = useState<number | undefined>(undefined);

  const navigate = useNavigate();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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

  const handleChangeYear = (Value: any) => {
    setYear(Value);
  };

  const divisionSubjectListApi = useDivisionSubjectList({
    teacher_id: params?.id,
    batch_id: batchId,
  }) as any;

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const { data: subjectListQuery } = useSubjectList(
    {
      sort: 'asc',
      batch_id: batchId,
      grade_id: user?.details?.grade_id,
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

  return (
    <>
      {/* {role === 'learnerprofile' ? null : (
        <PageTitle breadcrumbs={[{ label: 'Learner Details', href: '/students' }]}>Learner Details</PageTitle>
      )} */}

      <div className=" bg-white p-6 rounded-2xl">
        <div className="container mx-auto">
          {/* Basic Info Card */}
          <Card
            className={`mb-8 ${user?.role_name === ROLE_NAME.SUPER_ADMIN || user?.role_name === ROLE_NAME.ADMIN || user?.role_name === ROLE_NAME.TEACHER ? 'border-none shadow-none' : ''}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-8">
                {user?.details?.profile_image ? (
                  <img src={user?.details?.profile_image} alt="Profile Picture" className="w-24 h-24 rounded-full" />
                ) : (
                  <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} />
                )}

                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user?.role_name === 'super_admin'
                        ? user?.user_name
                        : user?.details?.first_name + ' ' + user?.details?.last_name}
                    </h1>
                    {user?.role_name === ROLE_NAME.SUPER_ADMIN ||
                    user?.role_name === ROLE_NAME.ADMIN ||
                    user?.role_name === ROLE_NAME.TEACHER ||
                    user?.role_name === ROLE_NAME.PARENT ||
                    user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION ? null : (
                      <Badge className="text-base px-4 py-2 bg-secondary text-primary">
                        Admission Number: {user?.details?.addmission_no}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    {user?.details?.job_title && (
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <FaBusinessTime className="h-5 w-5 text-blue-500" />
                        </div>
                        <span>
                          <strong>Job Title:</strong> {user?.details?.job_title}
                        </span>
                      </div>
                    )}

                    {user?.role_name == ROLE_NAME.SUPER_ADMIN && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 p-2 rounded-full">
                            <Mail className="h-5 w-5 text-blue-500" />
                          </div>
                          <span>
                            <strong>Email:</strong> {user?.email}
                          </span>
                        </div>
                      </>
                    )}
                    {user?.details?.mobile_number && (
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <span>
                          <strong>Email:</strong> {user?.details?.email}
                        </span>
                      </div>
                    )}

                    {user?.details?.mobile_number && (
                      <div className="flex items-center gap-3">
                        <div className="bg-green-50 p-2 rounded-full">
                          <Phone className="h-5 w-5 text-green-500" />
                        </div>
                        <span>
                          <strong>Mobile:</strong> {user?.details?.mobile_number}
                        </span>
                      </div>
                    )}
                    {user?.details?.gender && (
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-50 p-2 rounded-full">
                          <User className="h-5 w-5 text-purple-500" />
                        </div>
                        <span>
                          <strong>Gender:</strong> {user?.details?.gender === 'male' ? 'Male' : 'Female'}
                        </span>
                      </div>
                    )}
                    {user?.details?.city?.district_name && (
                      <div className="flex items-center gap-2">
                        <div className="bg-red-50 p-2 rounded-full">
                          <MapPin className="h-5 w-5 text-red-500" />
                        </div>
                        <span>
                          <strong>Location:</strong>{' '}
                          {user?.details?.city?.district_name + ', ' + user?.details?.state?.province_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {user?.role_name === ROLE_NAME.SUPER_ADMIN ||
              user?.role_name === ROLE_NAME.ADMIN ||
              user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION ||
              user?.role_name === ROLE_NAME.TEACHER ? null : (
                <Card>
                  <CardHeader>
                    <CardTitle>{user?.role_name === ROLE_NAME.STUDENT ? 'Parents Details' : ''}</CardTitle>
                  </CardHeader>
                  {user?.role_name === ROLE_NAME.PARENT ? (
                    <div className="bg-none">
                      <CardHeader>
                        <CardTitle>School Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {getDataById?.institute?.school_name as string}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-50 p-2 rounded-full">
                                <Mail className="h-5 w-5 text-blue-500" />
                              </div>
                              <span>{getDataById?.institute?.contact_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-green-50 p-2 rounded-full">
                                <Phone className="h-5 w-5 text-green-500" />
                              </div>
                              <span>
                                {getDataById?.institute?.contact_number ? getDataById?.institute?.contact_number : '-'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-red-50 p-2 rounded-full">
                                <MapPin className="h-5 w-5 text-red-500" />
                              </div>
                              <span>{getDataById?.institute?.address ? getDataById?.institute?.address : '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-purple-50 p-2 rounded-full">
                                <Users className="h-5 w-5 text-purple-500" />
                              </div>
                              <span>
                                {getDataById?.institute?.current_users ? getDataById?.institute?.current_users : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  ) : (
                    ''
                  )}

                  <CardContent>
                    {user?.role_name === ROLE_NAME.PARENT ? (
                      <div className="gap-4">
                        {Array.isArray(getDataById?.students) && getDataById?.students.length > 0 && (
                          <>
                            <div className="flex justify-between items-center py-5 pb-0">
                              <div className="text-base font-semibold text-slate-500">Children List</div>
                            </div>
                            <DynamicTable
                              data={getDataById.students}
                              columns={ChildrenColumns}
                              totalCount={getDataById.students.length}
                              loading={isLoading}
                              showPagination={false}
                            />
                          </>
                        )}
                      </div>
                    ) : (
                      ''
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user?.details?.parents?.map((parent: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {capitalizeFirstLetter(parent?.relationship)}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-full">
                              <User className="h-5 w-5 text-blue-500" />
                            </div>
                            <span>
                              <strong>Name:</strong> {`${parent?.first_name} ${parent?.last_name}`}
                            </span>
                          </div>

                          {/* Email */}
                          {parent?.email && (
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-50 p-2 rounded-full">
                                <Mail className="h-5 w-5 text-blue-500" />
                              </div>
                              <span>
                                <strong>Email:</strong> {parent?.email}
                              </span>
                            </div>
                          )}

                          {/* Mobile Number */}
                          {parent?.mobile_number && (
                            <div className="flex items-center gap-3">
                              <div className="bg-green-50 p-2 rounded-full">
                                <Phone className="h-5 w-5 text-green-500" />
                              </div>
                              <span>
                                <strong>Mobile:</strong> {parent?.mobile_number}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {user?.role_name === 'admin' || user?.role_name === 'teacher' ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                      <CardTitle>School Details</CardTitle>

                      {user?.role_name === ROLE_NAME.ADMIN && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSchoolId(school_id);
                              setIsModalOpen(true);
                              setEditMod(true);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  {getInstituteDetails?.isPending ? (
                    <>
                      <UILoader />
                    </>
                  ) : (
                    <>
                      <CardContent>
                        <div className="gap-6">
                          <div className="bg-white  rounded-lg p-6 border border-gray-200">
                            <h4 className="text-xl font-bold text-gray-900 mb-4">
                              {getInstituteDetails?.data?.school_name}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-blue-500" />
                                <span className="text-gray-700">
                                  <strong>Email:</strong> {getInstituteDetails?.data?.contact_email ?? '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-green-500" />
                                <span className="text-gray-700">
                                  <strong>Phone:</strong> {getInstituteDetails?.data?.contact_number ?? '-'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-orange-500" />
                                <span className="text-gray-700">
                                  <strong>Contact Person:</strong> {getInstituteDetails?.data?.contact_person ?? '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Building className="h-5 w-5 text-yellow-500" />
                                <span className="text-gray-700 capitalize">
                                  <strong>School Type:</strong> {getInstituteDetails?.data?.school_type ?? '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Hash className="h-5 w-5 text-gray-500" />
                                <span className="text-gray-700">
                                  <strong>EMIS Number:</strong> {getInstituteDetails?.data?.EMIS_number ?? '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-purple-500" />
                                <span className="text-gray-700">
                                  <strong>Current Users:</strong> {getInstituteDetails?.data?.current_users ?? '0'} /{' '}
                                  {getInstituteDetails?.data?.max_users ?? '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-purple-500" />
                                <span className="text-gray-700">
                                  <strong>Total Teachers:</strong> {getInstituteDetails?.data?.teacherCount ?? '0'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-purple-500" />
                                <span className="text-gray-700">
                                  <strong>Total Learners:</strong> {getInstituteDetails?.data?.learnerCount ?? '0'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Palette className="h-5 w-5 text-indigo-500" />
                                <span className="text-gray-700 capitalize">
                                  <strong>Medium of Instruction:</strong>{' '}
                                  {getInstituteDetails?.data?.medium_of_instruction ?? '-'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <span className="text-gray-700">
                                  <strong>Location Type:</strong> {getInstituteDetails?.data?.location_type ?? '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPinHouse className="h-5 w-5 text-blue-600" />
                                <span className="text-gray-700">
                                  <strong>Province:</strong> {getInstituteDetails?.data?.province?.province_name ?? '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPinHouse className="h-5 w-5 text-blue-600" />
                                <span className="text-gray-700">
                                  <strong>District:</strong> {getInstituteDetails?.data?.city?.district_name ?? '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-red-500" />
                                <span className="text-gray-700">
                                  <strong>Address:</strong> {getInstituteDetails?.data?.address ?? '-'}
                                </span>
                              </div>

                              {/* <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-teal-500" />
                            <span className="text-gray-700">
                              <strong>Created At:</strong>{' '}
                              {new Date(user?.school?.created_at).toLocaleDateString() ?? '-'}
                            </span>
                          </div> */}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      {user?.role_name === 'teacher' && (
                        <CardContent>
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
                                  defaultValue={batchId}
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
                                    <div className="text-sm text-slate-800">
                                      Total Subjects : {getSubjectList?.totalCount || 0}
                                    </div>
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
                        </CardContent>
                      )}
                    </>
                  )}
                </Card>
              ) : null}
            </CardContent>
          </Card>
          {user?.role_name === ROLE_NAME.SUPER_ADMIN ||
          user?.role_name === ROLE_NAME.ADMIN ||
          user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION ||
          user?.role_name === ROLE_NAME.TEACHER ||
          user?.role_name === ROLE_NAME.PARENT ? null : (
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
                    defaultValue={batchId}
                    onChange={(value) => {
                      handleChangeYear(value);
                    }}
                  />
                </div> */}
              </div>
              <Separator />
              {studentDetail?.data ? (
                <>
                  <div className="space-y-6 py-10">
                    <div className="flex gap-4">
                      <div className="flex-1 bg-nsc-gold rounded-xl p-4 text-center">
                        <div className="text-sm text-white mb-1">Year</div>
                        <div className="text-2xl font-bold text-white">{studentDetail?.data?.batch?.start_year}</div>
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
                        <div className="text-2xl font-bold text-white">
                          {studentDetail?.data?.divisionSubjects?.length}
                        </div>
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
                </>
              ) : (
                <>
                  <div className="py-5 flex justify-center items-center">No Data Available</div>
                </>
              )}

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
                  </CardContent>
                </Card>
              )}

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
                          isPending={studentAssessmentDetails.isPending}
                        />
                      ),
                    }))}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Edit School Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered={true}
        width={1200}
      >
        {getInstituteDetails?.isPending ? (
          <>
            <UILoader />
          </>
        ) : (
          <>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CustomFormItem
                  label="School Name"
                  name="school_name"
                  rules={[
                    {
                      required: true,
                      message: requireMessage('school name'),
                    },
                  ]}
                >
                  <Input disabled={editMod} type="text" placeholder="Enter School Name" />
                </CustomFormItem>

                <SelectSchoolType />

                <CustomFormItem
                  label="EMIS Number"
                  name="EMIS_number"
                  rules={[
                    {
                      required: true,
                      message: requireMessage('EMIS number'),
                    },
                  ]}
                >
                  <Input disabled={editMod} type="text" placeholder="Enter EMIS Number" />
                </CustomFormItem>

                <CustomFormItem
                  label="Maximum Users"
                  name="max_users"
                  rules={[
                    {
                      required: true,
                      message: requireMessage('maximum users'),
                    },
                    {
                      pattern: /^[0-9]*$/,
                      message: 'Only numbers are allowed',
                    },
                  ]}
                >
                  <Input disabled={editMod} type="number" placeholder="Enter Maximum Users" />
                </CustomFormItem>

                <SelectMediumOfInstruction />
                <SelectLocationType />

                <SelectState onChange={(value) => setStateId(value)} />
                <SelectCity state_id={stateId} />
                <CustomFormItem
                  label="Address"
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: requireMessage('address'),
                    },
                  ]}
                >
                  <Input.TextArea rows={4} placeholder="Enter Address" />
                </CustomFormItem>
              </div>

              <div className="flex items-center text-2xl font-medium text-slate-600 mb-5">
                <div>
                  <UIText>Principal Details</UIText>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <CustomFormItem
                  label="Name"
                  name="contact_person"
                  rules={[
                    {
                      required: true,
                      message: requireMessage('principal name'),
                    },
                  ]}
                >
                  <Input type="text" placeholder="Please enter the name" />
                </CustomFormItem>

                <CustomFormItem
                  label="Contact Number"
                  name="contact_number"
                  rules={[
                    { required: true, message: requireMessage('contact number') },
                    {
                      validator: (_: any, value: any) => {
                        if (!value) {
                          return Promise.resolve();
                        }
                        if (!/^\d+$/.test(value)) {
                          return Promise.reject('Please enter numbers only');
                        }
                        if (value.length < 10) {
                          return Promise.reject('Contact number must be at least 10 digits');
                        }
                        if (value.length > 15) {
                          return Promise.reject('Contact number cannot exceed 15 digits');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter Contact Number"
                    maxLength={15}
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                </CustomFormItem>
                <CustomFormItem
                  label="Email"
                  name="contact_email"
                  rules={[
                    {
                      required: true,
                      message: requireMessage('email'),
                    },
                    {
                      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Please enter a valid email',
                    },
                  ]}
                >
                  <Input disabled={editMod} type="text" placeholder="Please enter the email" />
                </CustomFormItem>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleCancel} className="mr-4" variant={'nsc-secondary'} type="button">
                  Cancel
                </Button>

                <UIFormSubmitButton type="button" onClick={form.submit} api={updateInstituteMutation}>
                  Update
                </UIFormSubmitButton>
              </div>
            </Form>
          </>
        )}
      </Modal>
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
