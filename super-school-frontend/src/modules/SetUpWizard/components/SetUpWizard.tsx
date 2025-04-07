import AppsContainer from '@/app/components/AppsContainer';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import useGlobalState from '@/store';
import { useEffect } from 'react';
import { useFetchSetupStatus } from '../actions/set-wizard.action';
import SetUpAddBatchForm from './SetUpAddBatchForm';
import SetUpAddClassForm from './SetUpAddClassForm';
import SetUpAddGradeForm from './SetUpAddGradeForm';
import SetUpAddSubjectForm from './SetUpAddSubjectForm';
import SetUpWizardStepper from './shared/SetUpWizardStepper';

const stepMapping: Record<string, number> = {
  CREATE_YEAR: 1,
  CREATE_GRADES: 2,
  CREATE_CLASSES: 3,
  ASSIGN_SUBJECTS: 4,
};

const SETUP_WIZARD_STEPS = [
  { title: <UIText>Create Year</UIText>, step: 1 },
  { title: <UIText>Create Grades</UIText>, step: 2 },
  { title: <UIText>Create Classes</UIText>, step: 3 },
  { title: <UIText>Assign Subjects</UIText>, step: 4 },
];

const SetUpWizard = () => {
  const currentStep = useGlobalState((state) => state.setUpWizardCurrentStep) ?? 1;
  const setCurrentStep = useGlobalState((state) => state.setSetUpWizardCurrentStep);
  const setSetupData = useGlobalState((state) => state.setSetUpData);

  const { data: setupData, refetch } = useFetchSetupStatus();
  // THIS IS USED TO CHECK IF USER HAS ALREADY DONE SOME STEPS AND THEN REDIRECT TO THAT STEP
  useEffect(() => {
    if (!setupData) return;

    setSetupData({
      grade: setupData.grades_data?.grades,
      batch: {
        ...setupData.year_data?.year,
        startYear: setupData.year_data?.year,
        id: setupData?.batch_id,
      },
    });

    const mappedStep = stepMapping[setupData.current_step] ?? 1;
    if (mappedStep !== currentStep) {
      setCurrentStep(mappedStep);
    }
  }, [setupData]);

  return (
    <>
      <PageTitle>Set Up Your School</PageTitle>
      <AppsContainer fullView={true}>
        <SetUpWizardStepper
          currentStep={currentStep}
          steps={SETUP_WIZARD_STEPS.map(({ title, step }) => ({
            title,
            // onClick: () => setCurrentStep(step),
            onClick: () => {
              if (step <= currentStep) {
                setCurrentStep(step);
              }
            },
          }))}
          setUpStatus={setupData}
        >
          {currentStep === 1 && (
            <SetUpAddBatchForm
              initialData={{ year: setupData?.year_data?.year?.toString() || '' }}
              refetchDetails={refetch}
            />
          )}
          {currentStep === 2 && (
            <SetUpAddGradeForm initialData={{ grade: setupData?.grades_data?.grades }} refetchDetails={refetch} />
          )}
          {currentStep === 3 && (
            <SetUpAddClassForm
              initialData={{ classes_data: { grades: setupData?.classes_data?.grades } }}
              refetchDetails={refetch}
            />
          )}
          {currentStep === 4 && <SetUpAddSubjectForm />}
        </SetUpWizardStepper>
      </AppsContainer>
    </>
  );
};

export default SetUpWizard;
