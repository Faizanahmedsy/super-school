import React, { ReactNode } from 'react';
interface MultiStepFormContainerV2Props {
  children: ReactNode;
  currentStep: number | undefined;
  steps: any;
  setUpStatus: any;
}

const SetUpWizardStepper: React.FC<MultiStepFormContainerV2Props> = ({
  children,
  currentStep = 1,
  steps,
  setUpStatus,
}) => {
  return (
    <div>
      <div className="grid place-items-start p-4">
        <div className="flex items-center">
          {steps.map((step: any, index: number) => (
            <div
              key={index}
              className="flex items-center cursor-pointer"
              onClick={() => {
                // TODO: ENABLE THIS AFTER THE API IS READY
                // if (currentStep === 1 && setUpStatus?.year_data) {
                //   step.onClick();
                // } else if (currentStep === 2 && setUpStatus?.grade_data) {
                //   step.onClick();
                // } else if (currentStep === 3 && setUpStatus?.class_data) {
                //   step.onClick();
                // }
                step.onClick();
              }}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`xl:text-lg lg:text-md md:text-xs w-fit xl:px-8 lg:px-3 md:px-1 py-2 rounded-full flex items-center justify-center mb-1 font-semibold gap-1
                      ${index + 1 <= currentStep ? 'border text-primary bg-secondary' : 'bg-gray-200 text-gray-600'}`}
                >
                  {index + 1} : {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`xl:w-25 lg:w-15 md:w-5 h-1 mx-2 ${index + 1 < currentStep ? 'bg-primary' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
};

export default SetUpWizardStepper;
