import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateDivision, useDeleteDivision, useDivisionList } from '@/services/master/division/division.hook';
import useGlobalState from '@/store';
import { Form, Modal, Select } from 'antd';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeftIcon, ChevronRight, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { UITitles } from '../Card/UITiles';
import { getColorScheme } from '@/lib/helpers/colors';
import TileNotFound from './TileNotFound';
import TileLoader from './TileLoader';
import UIText from '../Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';

export default function NewChooseClass({
  step,
  setStep,
  allowActions = true,
  extraButtons = null,
  navigateOnClick,
}: {
  step: number;
  setStep: (step: number) => void;
  allowActions?: boolean;
  extraButtons?: React.ReactNode;
  navigateOnClick?: () => void;
}) {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [form] = Form.useForm();

  const user = useGlobalState((state) => state.user);
  const schoolId = useRoleBasedSchoolId();
  const setFilterData = useGlobalState((state) => state.setFilterData);
  const filterData = useGlobalState((state) => state.filterData);

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
    data: divisionData,
    refetch,
    isPending,
  } = useDivisionList({
    school_id: getSchoolId() as number,
    sort: 'asc',
    batch_id: filterData.batch?.id,
    grade_id: filterData.grade?.id,
  });

  const createClassMutation = useCreateDivision();

  const deleteClassMutation = useDeleteDivision();

  const handleSubmit = (values: any) => {
    const payload = {
      name: values.className,
      batch_id: Number(filterData.batch?.id),
      grade_id: Number(filterData.grade?.id),
      school_id: Number(schoolId),
    };
    createClassMutation.mutate(payload, {
      onSuccess: () => {
        refetch();
        setOpenAddModal(false);
        form.resetFields();
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
                <UIText>Select a Class</UIText>
              </div>
              <div className="flex justify-center items-center gap-4">
                {allowActions && (
                  <Button size="sm" onClick={() => setOpenAddModal(true)}>
                    <UIText>Create Class</UIText>
                  </Button>
                )}
                {extraButtons}
                <Button size="sm" variant="nsc-secondary" onClick={() => setStep(step - 1)}>
                  <ChevronLeftIcon className="w-4 h-4" />
                  <UIText>Back</UIText>
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Select a class to explore the associated data and insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {divisionData?.list?.map(
                (
                  division: {
                    id: string;
                    name: string;
                    grades: { grade_number: string };
                    studentCount: number;
                  },
                  index: number
                ) => {
                  const { color, lightColor } = getColorScheme(index);
                  return (
                    <motion.div
                      key={division.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <UITitles
                        title={`${division?.grades?.grade_number}${division.name.toUpperCase()}`}
                        color={color}
                        allowDelete={allowActions ? true : false}
                        lightColor={lightColor}
                        onClick={() => {
                          setFilterData({
                            ...filterData,
                            class: {
                              id: division.id,
                              name: division.name,
                            },
                          });
                          if (navigateOnClick) {
                            navigateOnClick();
                          } else {
                            setStep(step + 1);
                          }
                        }}
                        footer={
                          <div>
                            {/* Show number of students */}
                            <div className="text-sm text-gray-white pt-4">{division?.studentCount} Learners</div>
                          </div>
                        }
                        onDelete={() => {
                          setDeleteId(Number(division.id));
                          setOpenDeleteModal(true);
                        }}
                      />
                    </motion.div>
                  );
                }
              )}
              {divisionData?.list?.length === 0 && (
                <>
                  <TileNotFound title="grades" />
                </>
              )}
              {isPending && <TileLoader />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------------DELETE MODAL ---------------------- */}

      <Modal
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        title="Delete Class"
        centered
        okButtonProps={{
          loading: deleteClassMutation.isPending,
        }}
        onOk={() => {
          deleteClassMutation.mutate(Number(deleteId), {
            onSuccess: () => {
              refetch();
              setOpenDeleteModal(false);
            },
          });
        }}
      >
        <div className="space-y-2 mt-[30px]">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-lg font-medium text-gray-900">Are you sure you want to delete this class?</p>
          </div>

          {/* Warning Box */}
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="mb-2">
                If you choose to delete this class, the following data will be permanently deleted:
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

      <Modal
        open={openAddModal}
        onCancel={() => setOpenAddModal(false)}
        title={
          <>
            <UIText>Add Class</UIText>
          </>
        }
        centered
        okButtonProps={{
          loading: createClassMutation.isPending,
        }}
        onOk={() => {
          form.submit();
        }}
      >
        <GradeInfoHeader filterData={filterData} />
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <CustomFormItem
            label="Select Class"
            name="className"
            rules={[{ required: true, message: 'Please enter a Class name' }]}
          >
            <Select
              placeholder="Select Class"
              options={[
                {
                  label: 'A',
                  value: 'a',
                },
                {
                  label: 'B',
                  value: 'b',
                },
                {
                  label: 'C',
                  value: 'c',
                },
                {
                  label: 'D',
                  value: 'd',
                },
                {
                  label: 'E',
                  value: 'e',
                },
                {
                  label: 'F',
                  value: 'f',
                },
                {
                  label: 'G',
                  value: 'g',
                },
                {
                  label: 'H',
                  value: 'h',
                },
                {
                  label: 'I',
                  value: 'i',
                },
                {
                  label: 'J',
                  value: 'j',
                },
                {
                  label: 'K',
                  value: 'k',
                },
                {
                  label: 'L',
                  value: 'l',
                },
                {
                  label: 'M',
                  value: 'm',
                },
                {
                  label: 'N',
                  value: 'n',
                },
                {
                  label: 'O',
                  value: 'o',
                },
                {
                  label: 'P',
                  value: 'p',
                },
                {
                  label: 'Q',
                  value: 'q',
                },
                {
                  label: 'R',
                  value: 'r',
                },
                {
                  label: 'S',
                  value: 's',
                },
                {
                  label: 'T',
                  value: 't',
                },
                {
                  label: 'U',
                  value: 'u',
                },
                {
                  label: 'V',
                  value: 'v',
                },
                {
                  label: 'W',
                  value: 'w',
                },
                {
                  label: 'X',
                  value: 'x',
                },
                {
                  label: 'Y',
                  value: 'y',
                },
                {
                  label: 'Z',
                  value: 'z',
                },
              ].filter(
                (option) =>
                  !divisionData?.list?.some((item: { name: string }) => item.name.toLowerCase() === option.value)
              )}
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
  };
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100 mb-3">
      <div className="flex items-center justify-center flex-wrap gap-2 text-sm flex-col">
        <div className="text-gray-600">
          <UIText>You are creating this class for</UIText>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            <UIText>Year</UIText> {filterData.batch?.name}
          </span>
          <ChevronRight className="text-gray-400" size={16} />
          <span className="flex gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
            <UIText>Grade</UIText> {filterData.grade?.name}
          </span>
        </div>
      </div>
    </div>
  );
};
