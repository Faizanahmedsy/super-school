import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { formatTerm, isNonEmptyArray } from '@/lib/common-functions';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { getColorScheme } from '@/lib/helpers/colors';
import { useDeleteSubject, useSubjectList } from '@/modules/Master/subject/subject.action';
import useGlobalState from '@/store';
import { Checkbox, Modal } from 'antd';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeftIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { UITitles } from '../Card/UITiles';
import TileLoader from './TileLoader';
import TileNotFound from './TileNotFound';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';

//TODO: THis component should display a list of subjects based on the selected term, currently it is displaying all subjects for all terms

export default function NewChooseTermWiseSubject({
  step,
  setStep,
  allowActions = true,
}: {
  step: number;
  setStep: (step: number) => void;
  allowActions?: boolean;
}) {
  // HOOKS

  // LOCAL STATES
  const [_, setOpenAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [subjectTerms] = useState<any[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<any[]>([]);

  // GLOBAL STATES

  const user = useGlobalState((state) => state.user);
  const setFilterData = useGlobalState((state) => state.setFilterData);
  const filterData = useGlobalState((state) => state.filterData);
  const batchId = useRoleBasedCurrentBatch();

  const getSchoolId = useRoleBasedSchoolId();

  // QUERIES

  const {
    data: subjectData,
    refetch,
    isPending,
  } = useSubjectList({
    school_id: getSchoolId as number,
    sort: 'asc',
    batch_id: filterData.batch?.id ? filterData.batch.id : batchId,
    grade_id: filterData.grade ? filterData.grade?.id : user?.details?.grade?.id,
    term_id: filterData.term ? filterData.term?.id : user?.details?.term?.id,
    checkStudent: true,
  });

  console.log('subjectData', subjectData);

  const deleteSubjectMutation = useDeleteSubject();

  //   if (user?.role_name === 'student') {
  //     return null;
  //   }
  //   return (
  //     <>
  //       <div>
  //         {/* Show number of students */}
  //         <div className="text-sm text-gray-white pt-4">50 Learners</div>
  //       </div>
  //     </>
  //   );
  // };

  let description = '';

  if (user?.role_name === ROLE_NAME.TEACHER) {
    description = 'This are the subjects you are teaching this year';
  } else {
    description = 'Select a subject to view the list of students and their performance';
  }

  return (
    <>
      <div className="w-full p-1">
        <Card className="w-full">
          <CardHeader className="relative z-10">
            <CardTitle className="flex justify-between items-center">
              <div>Select a Subject</div>
              <div className="flex justify-center items-center gap-4">
                {allowActions && (
                  <Button size="sm" onClick={() => setOpenAddModal(true)}>
                    Create Subject
                  </Button>
                )}
                {step != 1 && (
                  <Button size="sm" variant="nsc-secondary" onClick={() => setStep(step - 1)}>
                    <ChevronLeftIcon className="w-4 h-4" />
                    Back
                  </Button>
                )}
              </div>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-4 gap-6">
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
                            {/* Show number of students */}
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
            onError: (error) => {
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
          <div className="flex flex-col gap-2">
            <Checkbox
              className="flex gap-2 bg-slate-100 px-4 py-2 rounded-md"
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTerms(subjectTerms.map((term) => term.id));
                } else {
                  setSelectedTerms([]);
                }
              }}
            >
              Select All
            </Checkbox>
            {subjectTerms.length > 0 &&
              subjectTerms.map((terms) => {
                return (
                  <>
                    <Checkbox
                      className="flex gap-2 bg-slate-100 px-4 py-2 rounded-md"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTerms([...selectedTerms, terms.id]);
                        } else {
                          setSelectedTerms(selectedTerms.filter((term) => term !== terms.id));
                        }
                      }}
                    >
                      {formatTerm(terms.term_name)}
                    </Checkbox>
                  </>
                );
              })}
          </div>

          {/* Final Warning */}
          <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">⚠️ This action cannot be undone</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
