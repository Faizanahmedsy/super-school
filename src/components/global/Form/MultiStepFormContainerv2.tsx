import React, { ReactNode } from 'react';
interface MultiStepFormContainerV2Props {
  children: ReactNode;
  currentStep: number | undefined;
  steps: { title: any }[];
  setCurrentStep: (step: number) => void;
}

const MultiStepFormContainerV2: React.FC<MultiStepFormContainerV2Props> = ({
  children,
  currentStep = 1,
  steps,
  // setCurrentStep,
}) => {
  return (
    <div>
      <div className="grid place-items-start p-4">
        <div className="flex items-center">
          {steps.map((step, index: number) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`xl:text-lg lg:text-md md:text-xs w-fit xl:px-8 lg:px-3 md:px-1 py-2 rounded-full flex items-center justify-center mb-1 font-semibold
                      ${index + 1 <= currentStep ? 'border text-primary bg-secondary' : 'bg-gray-200 text-gray-600'}`}
                >
                  {index + 1}: {step.title}
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

export default MultiStepFormContainerV2;
