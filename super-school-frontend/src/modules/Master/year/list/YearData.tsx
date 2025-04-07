import IntlMessages from '@/app/helpers/IntlMessages';
import ChooseClass from '@/components/global/ChooseCardsNew/NewChooseClass';
import ChooseGrade from '@/components/global/ChooseCardsNew/NewChooseGrade';
import ChooseSubject from '@/components/global/ChooseCardsNew/NewChooseSubject';
import ChooseYear from '@/components/global/ChooseCardsNew/NewChooseYear';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import useGlobalState from '@/store';
import { Card } from 'antd';
import { useState } from 'react';
import SubjectDetails from '../../subject/details/SubjectDetails';

const YearData = () => {
  // const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);

  const filterData = useGlobalState((state) => state.filterData);

  // Define the breadcrumb labels for each step
  const breadcrumbItems = [
    { label: 'Year Data', step: 1 },
    { label: filterData.batch?.name, step: 2 },
    { label: filterData.grade?.name, step: 3 },
    { label: filterData.class?.name, step: 4 },

    { label: filterData.subject?.name, step: 5 },
  ];

  // Filter breadcrumb items to show only completed steps and current step
  const visibleBreadcrumbItems = breadcrumbItems.filter((item) => item.step < step + 1);

  // Pagination handlers
  // const handleNextPage = () => setPage((prev) => prev + 1);
  // const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  // const handleLimitChange = (   { label: "Term 1", step: 5 },newLimit: number) => setLimit(newLimit);
  return (
    <>
      <Card className="py-5">
        <div className="pb-5">
          <div className="flex justify-between">
            {/* <p className="text-2xl font-bold text-slate-600 mb-5">
              <IntlMessages id="page-title.yearData" />
            </p> */}
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              {step > 1 &&
                visibleBreadcrumbItems.map((item, index) => (
                  <BreadcrumbItem key={item.step}>
                    <BreadcrumbLink
                      href="#"
                      onClick={() => setStep(item.step)}
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

        {step == 1 && <ChooseYear step={step} setStep={setStep} />}
        {step == 2 && <ChooseGrade step={step} setStep={setStep} />}
        {step == 3 && <ChooseClass step={step} setStep={setStep} />}

        {step == 4 && <ChooseSubject step={step} setStep={setStep} />}
        {step == 5 && <SubjectDetails step={step} setStep={setStep} />}
      </Card>
    </>
  );
};

export default YearData;
