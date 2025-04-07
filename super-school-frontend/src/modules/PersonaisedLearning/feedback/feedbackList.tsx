import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';
import NewChooseClass from '@/components/global/ChooseCardsNew/NewChooseClass';
import NewChooseGrade from '@/components/global/ChooseCardsNew/NewChooseGrade';
import NewChooseSubject from '@/components/global/ChooseCardsNew/NewChooseSubject';
import NewChooseTerm from '@/components/global/ChooseCardsNew/NewChooseTerm';
import PageTitle from '@/components/global/PageTitle';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';
import { useState } from 'react';
import IndividualFeedback from './IndividualFeedback';
// import { Button } from "antd";

const FeedbackList = () => {
  const [step, setStep] = useState<number>(1);

  const data = [
    {
      name: '10th Std Maths Mid Sem Summer 2025',
      date: '10-10-2025',
    },
    {
      name: '10th Std Science Final Exam Winter 2025',
      date: '15-12-2025',
    },
    {
      name: '9th Std English Mid Sem Spring 2025',
      date: '05-03-2025',
    },
    {
      name: '8th Std History Final Exam Autumn 2025',
      date: '25-09-2025',
    },
    {
      name: '11th Std Physics Mid Sem Winter 2025',
      date: '20-11-2025',
    },
    {
      name: '11th Std Chemistry Final Exam Summer 2025',
      date: '30-06-2025',
    },
  ];

  // Pagination handlers
  // const handleNextPage = () => setPage((prev) => prev + 1);
  // const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  // const handleLimitChange = (newLimit: number) => setLimit(newLimit);
  return (
    <>
      <AppPageMeta title="Exams List" />
      <PageTitle
        extraItem={<CreateButton moduleName={MODULE.ASSESSMENTS} action={ACTION.ADD} redirectTo="/exams/add" />}
      >
        Practice
      </PageTitle>
      <div>Select Year</div>
      <AppsContainer title={''} fullView={true} type="bottom">
        {step == 1 && <NewChooseTerm step={step} setStep={setStep} />}
        {step == 2 && <NewChooseGrade step={step} setStep={setStep} allowActions={false} />}
        {step == 3 && <NewChooseClass step={step} setStep={setStep} allowActions={false} />}
        {step == 4 && <NewChooseSubject step={step} setStep={setStep} />}
        {step == 5 && data && <IndividualFeedback />}
      </AppsContainer>
    </>
  );
};

export default FeedbackList;
