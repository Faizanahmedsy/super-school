import NewChooseClass from '@/components/global/ChooseCardsNew/NewChooseClass';
import NewChooseGrade from '@/components/global/ChooseCardsNew/NewChooseGrade';
import NewChooseTerm from '@/components/global/ChooseCardsNew/NewChooseTerm';
import NewChooseTermWiseSubject from '@/components/global/ChooseCardsNew/NewChooseTermWiseSubjects';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { BadgePlus, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StatsBasedOnAssessment from '../Analytics/StatsBasedOnAssessment';
import StatsBasedOnSubject from '../Analytics/StatsBasedOnSubject';
import GenerateEditAIQuizModal from '../Quiz/GenerateEditAIQuizModal';
import PerformanceInsights from '../Student/PerformanceInsights';
import UIText from '@/components/global/Text/UIText';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';

export default function TeacherPracticeExercises() {
  // HOOKS
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useGlobalState((state) => state.user);

  // LOCAL STATE
  const [openGenQuizModal, setOpenGenQuizModal] = useState(false);

  // DERIVE STEP FROM QUERY PARAMS
  const stepFromQuery = Number(searchParams.get('step')) || 1;

  // FUNCTION: UPDATE STEP IN QUERY PARAMS
  const handleSetStep = (newStep: number) => {
    setSearchParams({ step: newStep.toString() }); // UPDATE QUERY PARAM
  };

  return (
    <>
      {/* PAGE TITLE */}
      <PageTitle
        extraItem={
          <>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <Button onClick={() => navigate('/practice/quiz-list')} className="gap-2 rounded-full">
                <UIText>Quiz List</UIText>
              </Button>
              {user.role_name !== ROLE_NAME.PARENT && user.role_name !== ROLE_NAME.DEPARTMENT_OF_EDUCATION && (
                <>
                  <Button onClick={() => navigate('/generate-quiz')} className="gap-2 rounded-full">
                    <BadgePlus size={18} />
                    <UIText>Create Quiz Manually</UIText>
                  </Button>
                  <Button onClick={() => setOpenGenQuizModal(true)} className="gap-2 rounded-full" variant={'ai_magic'}>
                    <BadgePlus size={18} />
                    <UIText>Generate Quiz using AI</UIText>
                  </Button>
                </>
              )}
            </div>
          </>
        }
      >
        Practice Exercises
      </PageTitle>

      {/* STEP 1: CHOOSE GRADE */}
      {stepFromQuery === 1 && <NewChooseGrade step={stepFromQuery} setStep={handleSetStep} allowActions={false} />}

      {/* STEP 2: CHOOSE TERM */}
      {stepFromQuery === 2 && <NewChooseTerm step={stepFromQuery} setStep={handleSetStep} />}

      {/* STEP 3: TERM-WISE SUBJECT AND INSIGHTS */}
      {stepFromQuery === 3 && (
        <div className="space-y-4">
          <PerformanceInsights />
          {user.role_name != ROLE_NAME.PARENT && user.role_name != ROLE_NAME.STUDENT && <StatsBasedOnAssessment />}

          <NewChooseTermWiseSubject step={stepFromQuery} setStep={handleSetStep} allowActions={false} />
        </div>
      )}

      {/* STEP 4: CLASS AND SUBJECT STATS */}
      {stepFromQuery === 4 && (
        <div className="space-y-4">
          <NewChooseClass
            step={stepFromQuery}
            setStep={handleSetStep}
            navigateOnClick={() => navigate('/practice/quiz-list')}
            allowActions={false}
          />
          <StatsBasedOnSubject />
        </div>
      )}

      {/* MODAL FOR GENERATING/EDITING QUIZ */}
      <GenerateEditAIQuizModal openGenQuizModal={openGenQuizModal} setOpenGenQuizModal={setOpenGenQuizModal} />
    </>
  );
}
