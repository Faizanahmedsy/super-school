import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UISelect from '@/components/global/Form/v4/UISelect';
import UIText from '@/components/global/Text/UIText';
import { useCreateMultiDivision } from '@/services/master/division/division.hook';
import useGlobalState from '@/store';
import { Form } from 'antd';
import React, { JSX, useEffect, useState } from 'react';
import { useDivisionSetup, useUpdateSetupStatus } from '../actions/set-wizard.action';
import UIFormCardV2 from './shared/UIFormCard';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';

// Define the type for grade classes
type GradeClasses = {
  [key: string]: number; // Allow any string key (like "Grade 1", "Grade 2", etc.)
};

type SetUpAddClassFormProps = {
  initialData: any;
  refetchDetails: () => void;
};

type Grade = {
  id: string;
  grade_number: string;
  description?: string;
};

export default function SetUpAddClassForm({ initialData, refetchDetails }: SetUpAddClassFormProps): JSX.Element {
  const [form] = Form.useForm();

  const user = useGlobalState((state) => state.user);

  const setCurrentStep = useGlobalState((state) => state.setSetUpWizardCurrentStep);
  const currentStep = useGlobalState((state) => state.setUpWizardCurrentStep);
  const schoolId = useRoleBasedSchoolId();

  const multiCreateClassMutation = useCreateMultiDivision();
  const updateSetupStatusMutation = useUpdateSetupStatus();
  const addSetupDivision = useDivisionSetup();

  const setUpData = useGlobalState((state) => state.setUpData);

  // Instead of setUpWizardSelectedGrades, we are using gradeList
  const gradeList: Grade[] = React.useMemo(() => setUpData?.grade || [], [setUpData]);

  // Initialize gradeClasses with the correct type, based on gradeList
  const [gradeClasses, setGradeClasses] = useState<GradeClasses>(
    gradeList.reduce((acc, gradeObj) => {
      acc[gradeObj.grade_number] = 0; // Initialize each grade with 0 classes
      return acc;
    }, {} as GradeClasses)
  );

  let defaultData = '';

  useEffect(() => {
    // Create the initial gradeClasses with 0 for all grades in gradeList
    const newGradeClasses = gradeList.reduce((acc, gradeObj) => {
      acc[gradeObj.grade_number] = 0;
      return acc;
    }, {} as GradeClasses);

    // Merge with initialData if present
    if (initialData?.classes_data?.grades) {
      initialData.classes_data.grades.forEach((grade: any) => {
        const gradeNumber = grade.grade_number.toString();
        // Check if this grade exists in the newGradeClasses (i.e., is in gradeList)
        if (Object.prototype.hasOwnProperty.call(newGradeClasses, gradeNumber)) {
          newGradeClasses[gradeNumber] = grade.number_of_classes;
        }
      });
    }

    // Update the state
    setGradeClasses(newGradeClasses);

    // Set form values if initialData is present
    if (initialData?.classes_data?.grades) {
      const formValues: { [key: string]: any } = {};
      initialData.classes_data.grades.forEach((grade: any) => {
        const gradeNumber = grade.grade_number.toString();
        formValues[`${gradeNumber}_noOfClass`] = grade.number_of_classes;
      });
      form.setFieldsValue(formValues);
    }
  }, [gradeList, initialData, form]);

  // useEffect(() => {
  //   // Re-initialize the gradeClasses if gradeList changes
  //   setGradeClasses(
  //     gradeList.reduce((acc, gradeObj) => {
  //       acc[gradeObj.grade_number] = 0; // Reset the classes count
  //       return acc;
  //     }, {} as GradeClasses)
  //   );
  // }, [gradeList]);

  const handleSubmit = async () => {
    // Prepare the divisions array based on the selected number of classes for each grade
    const divisions = gradeList.map((gradeObj) => {
      const numClasses = gradeClasses[gradeObj.grade_number];
      const division = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, numClasses).split('');

      return {
        // batch_id: Number(setUpData?.batch?.id),
        grade_id: Number(gradeObj.id), // Use the grade_id from gradeList
        name: division,
      };
    });

    // Final data structure
    const data: any = {
      divisions: divisions,
      school_id: Number(schoolId),
      batch_id: Number(setUpData?.batch?.id),
    };

    const gradesPayload = gradeList.map((gradeObj) => {
      const numClasses = gradeClasses[gradeObj.grade_number];
      const classes = Array.from({ length: numClasses }, (_, index) => ({
        class: String.fromCharCode(65 + index), // Generates 'A', 'B', etc.
      }));

      return {
        grade_number: parseInt(gradeObj.grade_number, 10),
        number_of_classes: numClasses,
        classes: classes,
      };
    });

    try {
      // Execute both mutations in parallel
      const [resp, resp2] = await Promise.all([
        addSetupDivision.mutateAsync(data),
        updateSetupStatusMutation.mutateAsync({
          step: 'CREATE_CLASSES',
          data: { grades: gradesPayload },
        }),
      ]);
      refetchDetails();
      setCurrentStep(4);
    } catch (error) {
      // Handle network/request errors
      console.error('Request failed:', error);
    }
  };

  const renderClassPills = (numClasses: number): JSX.Element[] => {
    const classLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return classLabels.slice(0, numClasses).map((label) => (
      <span key={label} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
        {label}
      </span>
    ));
  };

  return (
    <div className="px-4">
      <Form form={form} layout="vertical" className="space-y-5" onFinish={handleSubmit}>
        {gradeList &&
          gradeList.map((gradeObj) => (
            <UIFormCardV2 key={gradeObj.id} title={`Grade ${gradeObj.grade_number}`} description={''}>
              <CustomFormItem
                label="Number of Classes"
                name={`${gradeObj.grade_number}_noOfClass`}
                rules={[
                  {
                    required: true,
                    message: 'Please select the number of classes.',
                  },
                ]}
              >
                <UISelect
                  placeholder="Select Number of Classes"
                  options={[...Array(26).keys()].map((num) => ({
                    label: (num + 1).toString(),
                    value: num + 1,
                  }))}
                  onChange={(value: any) =>
                    setGradeClasses((prev) => ({
                      ...prev,
                      [gradeObj.grade_number]: value as number,
                    }))
                  }
                />
              </CustomFormItem>

              <CustomFormItem label="Classes">
                {renderClassPills(gradeClasses[gradeObj.grade_number]).length > 0 ? (
                  <div className="flex flex-wrap gap-2">{renderClassPills(gradeClasses[gradeObj.grade_number])}</div>
                ) : (
                  <div className="text-muted-foreground p-2">
                    <UIText>Please select the number of classes for this grade to see the classes.</UIText>
                  </div>
                )}
              </CustomFormItem>
            </UIFormCardV2>
          ))}
        <div className="w-full bg-white border-t p-4">
          <div className="mx-auto text-right space-x-4">
            <UIFormSubmitButton
              api={multiCreateClassMutation}
              type="button"
              onClick={() => {
                form.submit();
              }}
            >
              Submit
            </UIFormSubmitButton>
          </div>
        </div>
      </Form>
    </div>
  );
}
