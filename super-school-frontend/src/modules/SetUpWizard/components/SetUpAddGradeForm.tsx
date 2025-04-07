import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UISelect from '@/components/global/Form/v4/UISelect';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { displayError } from '@/lib/helpers/errorHelpers';
import { cn } from '@/lib/utils';
import { useCreateMultiGrade } from '@/services/master/grade/grade.hook';
import useGlobalState from '@/store';
import { Form, Modal } from 'antd';
import { CircleX, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGradeSetup, useUpdateSetupStatus } from '../actions/set-wizard.action';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';

interface SetUpAddGradeFormProps {
  initialData: any;
  refetchDetails: () => void;
}

interface Grade {
  grade_number: string;
  id: number;
  description: string;
}

interface FormValues {
  grade: { grade: string }[];
}

const SetUpAddGradeForm = ({ initialData, refetchDetails }: SetUpAddGradeFormProps) => {
  // HOOKS
  const [form] = Form.useForm();

  // GLOBAL STATE
  const setUpData = useGlobalState((state) => state.setUpData);
  const setSetUpData = useGlobalState((state) => state.setSetUpData);
  const user = useGlobalState((state) => state.user);
  const step = useGlobalState((state) => state.setUpWizardCurrentStep);
  const setStep = useGlobalState((state) => state.setSetUpWizardCurrentStep);
  const setSetUpWizardSelectedGrades = useGlobalState((state) => state.setSetUpWizardSelectedGrades);
  const schoolId = useRoleBasedSchoolId();

  // LOCAL STATE
  const [openMemoModal, setOpenMemoModal] = useState<boolean>(false);
  const staticGradeList: Grade[] = [
    { grade_number: '1', id: 1, description: 'description' },
    { grade_number: '2', id: 2, description: 'description' },
    { grade_number: '3', id: 3, description: 'description' },
    { grade_number: '4', id: 4, description: 'description' },
    { grade_number: '5', id: 5, description: 'description' },
    { grade_number: '6', id: 6, description: 'description' },
    { grade_number: '7', id: 7, description: 'description' },
    { grade_number: '8', id: 8, description: 'description' },
    { grade_number: '9', id: 9, description: 'description' },
    { grade_number: '10', id: 10, description: 'description' },
    { grade_number: '11', id: 11, description: 'description' },
    { grade_number: '12', id: 12, description: 'description' },
  ];

  const mergedGradeList = [
    ...staticGradeList,
    ...(initialData?.grade?.map((g: any) => ({
      grade_number: String(g.grade_number), // Convert to string
      id: g.id,
      description: 'description',
    })) || []),
  ];

  // QUERY
  const addMultiGradeMutation = useCreateMultiGrade();
  const addSetupGrade = useGradeSetup();
  const updateSetupStatusMutation = useUpdateSetupStatus();

  useEffect(() => {
    if (initialData?.grade) {
      form.setFieldsValue({
        grade: initialData.grade.map((item: any) => ({
          grade: JSON.stringify({
            id: item.id,
            grade_number: String(item.grade_number), // Convert to string
          }),
        })),
      });
    }
  }, [initialData, form]);

  // HANDLERS
  const onFinish = async (values: FormValues) => {
    if (values.grade.length === 0) {
      displayError('Please select at least one grade');
      return;
    }

    const grads = values.grade.map((item) => ({
      // batch_id: Number(setUpData?.batch?.id),
      grade_number: Number(JSON.parse(item.grade).grade_number),
    }));

    const gradeNumbers = values.grade.map((item) => {
      return {
        // id: Number(JSON.parse(item.grade).id),
        grade_number: Number(JSON.parse(item.grade).grade_number),
      };
    });

    const payload: any = {
      batch_id: Number(setUpData?.batch?.id),
      grads,
      school_id: Number(schoolId),
    };

    addSetupGrade.mutateAsync(payload, {
      onSuccess: (addMultiResp) => {
        updateSetupStatusMutation.mutateAsync(
          {
            step: 'CREATE_GRADES',
            data: {
              grades: addMultiResp?.map((item: any) => ({
                grade_number: item.grade_number,
                id: Number(item.id), // TODO ADD THIS LATER
              })),
            },
          },
          {
            onSuccess: (data) => {
              setSetUpData({
                ...setUpData,
                grade: addMultiResp?.data,
              });
              refetchDetails();
              setStep(3);
            },
          }
        );
      },
    });

    const selectedGrades: string[] = values.grade.map((item) => JSON.parse(item.grade).grade_number);

    setSetUpWizardSelectedGrades(selectedGrades);
  };

  const getSelectedGrades = (): string[] => {
    const fieldsValue = form.getFieldValue('grade') || [];
    return fieldsValue.map((field: { grade?: string }) => field?.grade).filter(Boolean);
  };

  return (
    <>
      <Form
        form={form}
        name="dynamic_card_form"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        initialValues={{ grade: [{}] }}
        className="p-4"
      >
        <Form.List name="grade">
          {(fields, { add, remove }) => (
            <>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    title={`Grade ${key + 1}`}
                    style={{ position: 'relative' }}
                    className={cn('p-8 gap-4')}
                  >
                    {fields.length > 1 && (
                      <CircleX
                        onClick={() => remove(name)}
                        size={18}
                        style={{
                          color: 'red',
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          cursor: 'pointer',
                          borderRadius: '50%',
                        }}
                      />
                    )}

                    <CustomFormItem
                      {...restField}
                      label="Grade"
                      name={[name, 'grade']}
                      rules={[
                        {
                          required: true,
                          message: 'Please select a grade',
                        },
                      ]}
                    >
                      <UISelect
                        placeholder="Select Grade"
                        options={mergedGradeList
                          .map((item) => ({
                            label: item.grade_number,
                            value: JSON.stringify({
                              id: item.id,
                              grade_number: item.grade_number, // Already a string
                            }),
                          }))
                          .filter((option) => {
                            const currentFieldValue = form.getFieldValue(['grade', name, 'grade']);
                            const selectedGrades = getSelectedGrades();
                            return !selectedGrades.includes(option.value) || option.value === currentFieldValue;
                          })}
                      />
                    </CustomFormItem>
                  </Card>
                ))}
              </div>
              <Form.Item>
                <Button
                  variant="outline"
                  onClick={() => {
                    const fieldsValue = form.getFieldValue('grade') || [];
                    const unselected = fieldsValue.some((field: { grade?: string }) => !field?.grade);
                    if (unselected) {
                      displayError('Please select a grade for all existing cards before adding a new one.');
                      return;
                    }
                    add();
                  }}
                  className="gap-2 my-4"
                  type="button"
                >
                  <Plus />
                  <UIText>Add Grade</UIText>
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <div className="flex justify-end gap-5">
          <UIFormSubmitButton api={addMultiGradeMutation}>
            {/* <IntlMessages id="button.submit" /> */}
            Submit
          </UIFormSubmitButton>
        </div>
      </Form>

      <Modal
        open={openMemoModal}
        onClose={() => setOpenMemoModal(false)}
        onCancel={() => setOpenMemoModal(false)}
        title="Upload Memo and Question Paper"
        centered
        width={600}
      >
        <Form layout="vertical">
          <Form.Item
            className="mt-4"
            label="Upload Memo"
            name="question"
            rules={[
              {
                required: true,
                message: 'Please enter a question',
              },
            ]}
          >
            <Button variant={'outline'}>Upload Memo</Button>
          </Form.Item>
          <Form.Item
            className="mt-4"
            label="Upload Question Paper"
            name="question"
            rules={[
              {
                required: true,
                message: 'Please enter a question',
              },
            ]}
          >
            <Button variant={'outline'}>Upload Question paper</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SetUpAddGradeForm;
