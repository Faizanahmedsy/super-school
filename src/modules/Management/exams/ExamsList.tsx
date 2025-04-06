import AppPageMeta from '@/app/components/AppPageMeta';
import CreateButton from '@/components/custom/buttons/CreateButton';
import UIPrimaryButton from '@/components/custom/buttons/UIPrimaryButton';
import NewChooseTerm from '@/components/global/ChooseCardsNew/NewChooseTerm';
import PageTitle from '@/components/global/PageTitle';
import ChooseClassTile from '@/components/global/Tiles/ChooseClassTile';
import ChooseGradeTile from '@/components/global/Tiles/ChooseGradeTile';
import ChooseYearTile from '@/components/global/Tiles/ChooseYearTile';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ACTION, MODULE, ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';
import { BadgePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import { Button } from "antd";

const ExamsList = () => {
  const navigate = useNavigate();
  const params = useLocation();
  const breadcrumbs: any = useGlobalState((state) => state.breadcrumbs_step);
  const [step, setStep] = useState<number>(breadcrumbs ? breadcrumbs : 1);
  const setCurrentStep = useGlobalState((state) => state.setCurrentStep);

  const user = useGlobalState((state) => state.user);

  const setBreadCrumbStep = useGlobalState((state) => state.setBreadCrumbStep);
  const breadcrumbStep = useGlobalState((state) => state.breadcrumbs_step);

  setBreadCrumbStep(step);

  const filterData = useGlobalState((state) => state.filterData);
  const setFilterData = useGlobalState((state) => state.setFilterData);

  // Define the breadcrumb labels for each step
  const breadcrumbItems = [
    { label: filterData.batch?.name, step: 1 },
    { label: filterData.grade?.name, step: 2 },
    { label: filterData.term?.name, step: 3 },
    { label: filterData.class?.name, step: 4 },
    { label: 'Assessment List', step: 5 },
  ];

  // Filter breadcrumb items to show only completed steps and current step
  const visibleBreadcrumbItems =
    filterData && Object.keys(filterData).length === 0
      ? [] // Set visibleBreadcrumbItems to an empty array when filterData is empty
      : breadcrumbItems.filter((item) => item.step < step + 1);

  useEffect(() => {
    if (Object.keys(filterData).length === 0) {
      setStep(1);
    }
  }, [filterData]);

  // useEffect(() => {
  //   if (breadcrumbStep === 0) {
  //     setStep(1);
  //   }
  // }, [breadcrumbStep]);

  useEffect(() => {
    if (breadcrumbs) {
      setStep(breadcrumbs);
    }
  }, [breadcrumbs]);

  useEffect(() => {
    // Update the breadcrumbs step
    setBreadCrumbStep(step);
  }, [step]);

  return (
    <>
      <AppPageMeta title="Exams List" />
      <PageTitle
        extraItem={
          <div className="flex gap-3">
            <UIPrimaryButton onClick={() => navigate('/assessments/list')} className="rounded-full">
              Assessments List
            </UIPrimaryButton>
            <CreateButton
              moduleName={MODULE.ASSESSMENTS}
              action={ACTION.ADD}
              onClick={() => {
                navigate('/assessment/add');
                setCurrentStep(1);
              }}
            />
          </div>
        }
      >
        {params.pathname == '/assessments/list' ? 'Assessment List' : 'Assessment'}
      </PageTitle>

      <div className="pb-5">
        <Breadcrumb>
          <BreadcrumbList>
            {step > 1 &&
              visibleBreadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={item.step}>
                  <BreadcrumbLink
                    href="#"
                    onClick={() => {
                      if (item.step === 1) {
                        setFilterData({});
                      } else if (item.step === 2) {
                        setFilterData({
                          batch: filterData.batch,
                          grade: filterData.grade,
                        });
                        if (setFilterData.length < 0) {
                          setBreadCrumbStep(0);
                        }
                      } else if (item.step === 3) {
                        setFilterData({
                          batch: filterData.batch,
                          grade: filterData.grade,
                          term: filterData.term,
                        });
                        if (setFilterData.length < 0) {
                          setBreadCrumbStep(0);
                        }
                      } else if (item.step === 4) {
                        setFilterData({
                          batch: filterData.batch,
                          grade: filterData.grade,
                          term: filterData.term,
                          class: filterData.class,
                        });
                        if (setFilterData.length < 0) {
                          setBreadCrumbStep(0);
                        }
                      }
                      setStep(item.step);
                    }}
                    className={step === item.step ? 'font-bold text-blue-600' : ''}
                  >
                    {item.label}
                  </BreadcrumbLink>
                  {index < visibleBreadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {step == 1 && <ChooseYearTile step={step} setStep={setStep} />}
      {step == 2 && <ChooseGradeTile step={step} setStep={setStep} viewBtn={false} />}
      {step == 3 && <NewChooseTerm step={step} setStep={setStep} />}
      {step == 4 && <ChooseClassTile step={step} setStep={setStep} viewBtn={false} />}
    </>
  );
};

export default ExamsList;
