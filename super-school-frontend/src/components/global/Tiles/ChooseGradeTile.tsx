import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { requireMessage } from '@/lib/form_validations/formmessage';
import { useCreateGrade, useDeleteGrade, useGradeList } from '@/services/master/grade/grade.hook';
import useGlobalState from '@/store';
import { Form, Modal, Spin } from 'antd';
import { AlertTriangle, ChevronLeftIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { UITitles } from '../Card/UITiles';
import UISelect from '../Form/v4/UISelect';
import UIText from '../Text/UIText';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';

const colorSchemes = [
  { color: 'bg-[#1B7C22]', lightColor: 'bg-[#3DB047]' },
  { color: 'bg-[#C49E44]', lightColor: 'bg-[#E6BC66]' },
  { color: 'bg-[#950707]', lightColor: 'bg-[#C34141]' },
  { color: 'bg-[#BE6518]', lightColor: 'bg-[#D47E33]' },
  { color: 'bg-[#F67820]', lightColor: 'bg-[#FFA552]' },
];

export default function ChooseGradeTile({
  step,
  setStep,
  viewBtn,
}: {
  step: number;
  setStep: (step: number) => void;
  viewBtn: boolean;
}) {
  const [modalTrue, setModalTrue] = useState(false);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [gradeModal, setGradeModal] = useState(false);
  const [form] = Form.useForm();

  const user = useGlobalState((state) => state.user);
  const term_id = useGlobalState((state) => state.term_id);
  const schoolId = useRoleBasedSchoolId();

  const setFilterData = useGlobalState((state) => state.setFilterData);
  const filterData = useGlobalState((state) => state.filterData);

  const {
    data: gradeData,
    refetch,
    isPending,
  } = useGradeList({
    school_id: schoolId,
    term_id: term_id ?? undefined,
    sort: 'asc',
    batch_id: filterData.batch?.id,
    checkstudent: false,
  });

  const createGradeMutation = useCreateGrade();

  const deleteGradeMutation = useDeleteGrade();

  const handleSubmit = (values: any) => {
    const payload = {
      grade_number: Number(values.gradeName),
      description: 'description',
      batch_id: Number(filterData.batch?.id),
      school_id: Number(schoolId),
    };

    createGradeMutation.mutate(payload, {
      onSuccess: () => {
        refetch();
        setGradeModal(false);
        form.resetFields();
      },
    });
  };

  const getColorScheme = (index: number) => {
    return colorSchemes[index % colorSchemes.length];
  };

  return (
    <>
      <div className="w-full p-1">
        <Card className="w-full">
          <CardHeader className="relative z-10">
            <CardTitle className="flex justify-between items-center">
              <div>
                <UIText>Select a Grade</UIText>
              </div>
              <div className="flex justify-center items-center gap-4">
                {viewBtn ? (
                  <Button size="sm" onClick={() => setGradeModal(true)}>
                    Create Grade
                  </Button>
                ) : (
                  ''
                )}

                <Button size="sm" variant="nsc-secondary" onClick={() => setStep(step - 1)}>
                  <ChevronLeftIcon className="w-4 h-4" />
                  Back
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              <UIText>Select a grade to explore the associated data and insights.</UIText>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-4 gap-6">
              {gradeData?.list?.map(
                (grade: { id: number; grade_number: string; studentCount: number }, index: number) => {
                  const { color, lightColor } = getColorScheme(index);
                  return (
                    <UITitles
                      key={grade.id}
                      title={grade.grade_number}
                      color={color}
                      lightColor={lightColor}
                      onClick={() => {
                        setFilterData({
                          ...filterData,
                          grade: {
                            id: String(grade.id),
                            name: grade.grade_number,
                          },
                        });
                        setStep(step + 1);
                      }}
                      footer={
                        <div>
                          <div className="text-sm text-gray-white pt-4">{grade?.studentCount} Learners</div>
                        </div>
                      }
                      {...(viewBtn && {
                        onDelete: () => {
                          setDeleteId(grade.id);
                          setModalTrue(true);
                        },
                      })}
                      // onDelete={() => {
                      //   setDeleteId(grade.id);
                      //   setModalTrue(true);
                      // }}
                    />
                  );
                }
              )}

              {gradeData?.list?.length === 0 && (
                <>
                  <div className="flex items-center justify-center col-span-full min-h-72">
                    <p className="text-lg font-medium text-gray-600">No grades found</p>
                  </div>
                </>
              )}
              {isPending && (
                <div className="flex items-center justify-center col-span-full min-h-72">
                  <Spin />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------------DELETE MODAL ---------------------- */}
      <Modal
        open={modalTrue}
        onCancel={() => setModalTrue(false)}
        title="Delete Grade"
        centered
        okButtonProps={{
          loading: deleteGradeMutation.isPending,
        }}
        onOk={() => {
          deleteGradeMutation.mutate(Number(deleteId), {
            onSuccess: () => {
              refetch();
              setModalTrue(false);
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
            <p className="text-lg font-medium text-gray-900">Are you sure you want to delete this grade?</p>
          </div>

          {/* Warning Box */}
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="mb-2">
                If you choose to delete this grade, the following data will be permanently deleted:
              </p>
              <ul className="ml-4 space-y-1 list-disc">
                <li>All student records</li>
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

      {/* Add Grade Modal */}
      <Modal
        open={gradeModal}
        onCancel={() => setGradeModal(false)}
        title="Add Grade"
        centered
        okButtonProps={{
          loading: createGradeMutation.isPending,
        }}
        onOk={() => {
          form.submit();
          // setGradeModal(false);
        }}
      >
        {filterData.batch && <GradeInfoHeader filterData={filterData} />}
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Select Grade"
            name="gradeName"
            rules={[{ required: true, message: requireMessage('grade name', 'select') }]}
          >
            <UISelect
              placeholder="Select Grade"
              options={[
                { label: 'Grade 1', value: '1' },
                { label: 'Grade 2', value: '2' },
                { label: 'Grade 3', value: '3' },
                { label: 'Grade 4', value: '4' },
                { label: 'Grade 5', value: '5' },
                { label: 'Grade 6', value: '6' },
                { label: 'Grade 7', value: '7' },
                { label: 'Grade 8', value: '8' },
                { label: 'Grade 9', value: '9' },
                { label: 'Grade 10', value: '10' },
                { label: 'Grade 11', value: '11' },
                { label: 'Grade 12', value: '12' },
              ].filter(
                (option) =>
                  !gradeData?.list?.some(
                    (grade: { grade_number: number }) => grade.grade_number.toString() === option.value
                  )
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const GradeInfoHeader = ({ filterData }: { filterData: { batch?: { id: string; name: string } } }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100 mb-3">
      <div className="flex items-center justify-center flex-wrap gap-2 text-sm">
        <div className="text-gray-600">You are creating this grade for</div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            Year {filterData.batch?.name}
          </span>
        </div>
      </div>
    </div>
  );
};
