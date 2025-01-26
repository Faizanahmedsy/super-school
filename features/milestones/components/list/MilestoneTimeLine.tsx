"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NewStepper from "./NewSteper";

const MilestoneTimeLine = () => {
  const [currentStep, setCurrentStep] = useState(2);

  const steps = [
    { id: 1, label: "Chapter 1" },
    { id: 2, label: "In Editorial" },
    { id: 3, label: "Author Reviewed" },
    { id: 4, label: "Editorial Finalized" },
  ];

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>My Writing Journey</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Steps UI */}
        <NewStepper />

        {/* <ol className="flex items-center w-full p-3 space-x-2 text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-xs dark:text-gray-400 sm:text-base dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse">
          {steps.map((step, index) => (
            <Step
              key={step.id}
              stepNumber={step.id}
              label={step.label}
              isActive={currentStep >= step.id}
              isLastStep={index === steps.length - 1}
            />
          ))}
        </ol> */}

        {/* Step Content */}
        {currentStep === 1 && <Step1Content onNext={handleNextStep} />}
        {currentStep === 2 && (
          <Step2Content
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
          />
        )}
        {currentStep === 3 && (
          <Step3Content
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
          />
        )}
        {currentStep === 4 && <Step4Content onPrevious={handlePreviousStep} />}
      </CardContent>
    </Card>
  );
};

// Dynamic Step Component
const Step = ({
  stepNumber,
  label,
  isActive,
  isLastStep,
}: {
  stepNumber: number;
  label: string;
  isActive: boolean;
  isLastStep: boolean;
}) => {
  const activeClass = isActive
    ? "text-blue-600 dark:text-blue-500 border-blue-600 dark:border-blue-500"
    : "text-gray-500 dark:text-gray-400 border-gray-500 dark:border-gray-400";

  return (
    <li className={`flex items-center ${isActive ? "text-blue-600" : ""}`}>
      <span
        className={`flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0 ${activeClass}`}
      >
        {stepNumber}
      </span>
      {label}
      {!isLastStep && (
        <svg
          className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 12 10"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m7 9 4-4-4-4M1 9l4-4-4-4"
          />
        </svg>
      )}
    </li>
  );
};

// Step Content Components (No Changes)
const Step1Content = ({ onNext }: { onNext: () => void }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Step 1: Chapter 1</h2>
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-500">Target Date</p>
      <p className="text-gray-700 font-medium">12/12/2022</p>
    </div>
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-500">Submit Date</p>
      <p className="text-gray-700 font-medium">22/12/2022</p>
    </div>
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-500">Review Editorial</p>
      <p className="text-gray-700 font-medium">-</p>
    </div>
    <div className="flex justify-end">
      <Button onClick={onNext} className="px-6 py-3">
        Next <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  </div>
);

const Step2Content = ({
  onPrevious,
  onNext,
}: {
  onPrevious: () => void;
  onNext: () => void;
}) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Step 2: In Editorial</h2>
    <p className="mb-6 text-gray-600">
      In this step, you&apos;ll submit your chapter to the journal.
    </p>
    <div className="flex justify-between">
      <Button onClick={onPrevious} variant="outline" className="px-6 py-3">
        <ChevronLeft size={18} className="mr-2" />
        Previous
      </Button>
      <Button onClick={onNext} className="px-6 py-3">
        Next <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  </div>
);

const Step3Content = ({
  onPrevious,
  onNext,
}: {
  onPrevious: () => void;
  onNext: () => void;
}) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Step 3: Awaiting Approval</h2>
    <p className="mb-6 text-gray-600">
      Your chapter is now awaiting approval from the editorial team.
    </p>
    <div className="flex justify-between">
      <Button onClick={onPrevious} variant="outline" className="px-6 py-3">
        <ChevronLeft size={18} className="mr-2" />
        Previous
      </Button>
      <Button onClick={onNext} className="px-6 py-3">
        Next <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  </div>
);

const Step4Content = ({ onPrevious }: { onPrevious: () => void }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Step 4: Editorial Finalized</h2>
    <p className="mb-6 text-gray-600">
      Your chapter has been finalized by the editorial team.
    </p>
    <div className="flex justify-between">
      <Button onClick={onPrevious} variant="outline" className="px-6 py-3">
        <ChevronLeft size={18} className="mr-2" />
        Previous
      </Button>
    </div>
  </div>
);

export default MilestoneTimeLine;
