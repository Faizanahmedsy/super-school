import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isNonEmptyArray } from '@/lib/common-functions';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { displayError } from '@/lib/helpers/errorHelpers';
import {
  useCreateMultiSubject,
  useDeleteSubject,
  useMasterSubjectList,
  useSubjectList,
} from '@/modules/Master/subject/subject.action';
import { SubjectListApiResponse } from '@/modules/SetUpWizard/components/SetUpAddSubjectForm';
import { useTermList } from '@/services/master/term/term.action';
import useGlobalState from '@/store';
import { Form, Modal } from 'antd';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeftIcon, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import UIMultiSelect from '../Form/v4/UIMultiSelect';
import TileLoader from './TileLoader';

import { getColorScheme } from '@/lib/helpers/colors';
import { UITitles } from '../Card/UITiles';
import TileNotFound from './TileNotFound';
import UIText from '../Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';

export default function NewChooseSubject({
  step,
  setStep,
  allowActions = true,
}: {
  step: number;
  setStep: (step: number) => void;
  allowActions?: boolean;
}) {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [form] = Form.useForm();

  const user = useGlobalState((state) => state.user);
  const schoolId = useRoleBasedSchoolId();

  let description = '';

  if (user?.role_name === ROLE_NAME.TEACHER) {
    description = 'This are the subjects you are teaching this year';
  } else {
    description = 'Select a subject to view the list of students and their performance';
  }

  const filterData = useGlobalState((state) => state.filterData);

  const setFilterData = useGlobalState((state) => state.setFilterData);
  const subjectListApi = useMasterSubjectList({
    grade_number: filterData.grade?.name,
  }) as SubjectListApiResponse;

  const masterSchool = useGlobalState((state) => state.masterSchool);

  const getSchoolId = () => {
    if (user?.role_name === 'super_admin') {
      return masterSchool?.id;
    } else if (schoolId) {
      return schoolId;
    } else {
      return null;
    }
  };

  const {
    data: subjectData,
    refetch,
    isPending,
  } = useSubjectList({
    school_id: getSchoolId() as number,
    student_count: true,
    sort: 'asc',
    batch_id: filterData.batch?.id,
    grade_id: filterData.grade?.id,
  });

  const createSubjectMutation = useCreateMultiSubject();

  const termsQuery = useTermList({
    batch_id: filterData.batch?.id,
    school_id: schoolId,
  });

  const deleteSubjectMutation = useDeleteSubject();

  const handleSubmit = (values: any) => {
    const gradeId = Number(filterData.grade?.id);
    const batchId = Number(filterData.batch?.id);

    // Helper function to generate subject payload
    const generateSubjectPayload = (subjects: string[], type: string) => {
      return subjects.map((subjectId: string) => ({
        master_subject_id: Number(subjectId),
        school_id: Number(schoolId),
        grade_id: gradeId,
        batch_id: batchId,
      }));
    };

    // Generating payloads for normal and language subjects
    const normalSubjectsPayload = generateSubjectPayload(values.normalSubjects || [], 'normal');

    const languageSubjectsPayload = generateSubjectPayload(values.languageSubjects || [], 'language');

    // Combine both payloads
    const finalPayload = {
      subjects: [...normalSubjectsPayload, ...languageSubjectsPayload],
    };
    // Send the payload to the backend
    createSubjectMutation.mutate(finalPayload, {
      onSuccess: () => {
        refetch();
        setOpenAddModal(false);
        form.resetFields();
      },
      onError: (error: any) => {
        console.error('Error submitting subjects:', error);
        displayError(error?.response?.data?.message);
      },
    });
  };

  return (
    <>
      <div className="w-full p-1">
        <Card className="w-full">
          <CardHeader className="relative z-10">
            <CardTitle className="flex justify-between items-center">
              <div>
                <UIText>Select a Subject</UIText>
              </div>
              <div className="flex justify-center items-center gap-4">
                {allowActions && (
                  <Button size="sm" onClick={() => setOpenAddModal(true)}>
                    <UIText>Create Subject</UIText>
                  </Button>
                )}
                <Button size="sm" variant="nsc-secondary" onClick={() => setStep(step - 1)}>
                  <ChevronLeftIcon className="w-4 h-4" />
                  <UIText>Back</UIText>
                </Button>
              </div>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-6">
              {isNonEmptyArray(subjectData?.subjects) &&
                subjectData?.subjects.map((subject: any, index: number) => {
                  const { color, lightColor } = getColorScheme(index);
                  return (
                    <motion.div
                      key={subject?.master_subject?.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <UITitles
                        title={subject?.master_subject?.subject_name}
                        color={color}
                        lightColor={lightColor}
                        allowDelete={allowActions ? true : false}
                        onClick={() => {
                          setFilterData({
                            ...filterData,
                            subject: {
                              id: String(subject?.id),
                              name: subject?.master_subject?.subject_name,
                              details: subject,
                            },
                            masterSubject: {
                              id: String(subject?.master_subject?.id),
                              name: subject?.master_subject?.subject_name,
                            },
                          });
                          setStep(step + 1);
                        }}
                        onDelete={() => {
                          setDeleteId(Number(subject?.id));
                          setOpenDeleteModal(true);
                        }}
                        footer={
                          <div>
                            <div className="text-sm text-gray-white pt-4">{subject?.studentCount} Learners</div>
                          </div>
                        }
                      />
                    </motion.div>
                  );
                })}
              {subjectData?.subjects.length === 0 && (
                <>
                  <TileNotFound title="subjects" />
                </>
              )}
              {isPending && <TileLoader />}
            </div>
          </CardContent>
        </Card>
      </div>
      <Modal
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        title="Delete Subject"
        centered
        okButtonProps={{
          loading: deleteSubjectMutation.isPending,
        }}
        onOk={() => {
          deleteSubjectMutation.mutate(deleteId, {
            onSuccess: () => {
              refetch();
              setOpenDeleteModal(false);
            },
            onError: (error: unknown) => {
              console.error('Error deleting subject:', error);
            },
          });
        }}
      >
        <div className="space-y-2 mt-[30px]">
          {/* Warning Icon and Main Message */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-lg font-medium text-gray-900">Are you sure you want to delete this subject?</p>
          </div>

          {/* Warning Box */}
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="mb-2">
                If you choose to delete this subject, the following data will be permanently deleted:
              </p>
              <ul className="ml-4 space-y-1 list-disc">
                <li>All learner records</li>
                <li>Teacher assignments</li>
                <li>Quizzes and results</li>
                <li>Memos and documentation</li>
                <li>Other associated data</li>
              </ul>
            </div>
          </div>

          {/* Final Warning */}
          <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">⚠️ This action cannot be undone</p>
          </div>
        </div>
      </Modal>
      {/* <DeleteAssessmentModal /> */}
      <Modal
        title={
          <>
            <UIText>Add New Subject</UIText>
          </>
        }
        open={openAddModal}
        onCancel={() => setOpenAddModal(false)}
        centered
        okText={
          <>
            <UIText>Add Subject</UIText>
          </>
        }
        okButtonProps={{
          loading: createSubjectMutation.isPending,
        }}
        onOk={form.submit}
      >
        <GradeInfoHeader filterData={filterData} />
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <CustomFormItem
            label="Subjects"
            name="normalSubjects"
            rules={[{ required: true, message: 'Please select a subject' }]}
          >
            <UIMultiSelect
              mode="multiple"
              options={subjectListApi.data?.list.map((subject) => ({
                label: `${subject.subject_name} (${subject.subject_code})`,
                value: subject.id,
              }))}
              placeholder="Select Subjects"
            />
          </CustomFormItem>
        </Form>
      </Modal>
    </>
  );
}

const GradeInfoHeader = ({
  filterData,
}: {
  filterData: {
    batch?: { id: string; name: string };
    grade?: { id: string; name: string };
    class?: { id: string; name: string };
  };
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100 mb-3">
      <div className="flex items-center justify-center flex-wrap gap-2 text-sm">
        <span className="text-gray-600">
          <UIText>You are creating this subject for</UIText>
        </span>
        <div className="flex items-center gap-2">
          <span className="flex gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            <UIText>Year</UIText> {filterData.batch?.name}
          </span>
          <ChevronRight className="text-gray-400" size={16} />
          <span className="flex gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
            <UIText>Grade</UIText> {filterData.grade?.name}
          </span>
          <ChevronRight className="text-gray-400" size={16} />
          <span className="flex gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
            <UIText>Class</UIText> {`${filterData.grade?.name} ${filterData.class?.name.toUpperCase()}`}
          </span>
        </div>
      </div>
    </div>
  );
};
