import UISelect from '@/components/global/Form/v4/UISelect';
import { Button, Form, Input, Modal, Select, Steps } from 'antd';
import React, { useState } from 'react';

// Define Props Type
interface MultiStepModalProps {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  handleGenerateQuiz: (payload: GenerateQuizPayload) => void;
  termOptions: { value: number; label: string }[];
  subjectListQuery: { subjects: Subject[] } | null;
  requireMessage: (field: string, action?: string) => string;
  formatTerm: (term: string) => string;
}

// Define Types for Subject and Payload
interface Subject {
  id: number;
  master_subject: { subject_name: string };
  term: { term_name: string };
}

interface GenerateQuizPayload {
  title: string;
  term: number;
  subject: number;
  number_of_questions: number;
  weaknesses: string[];
}

const MultiStepModal: React.FC<MultiStepModalProps> = ({
  openModal,
  setOpenModal,
  handleGenerateQuiz,
  termOptions,
  subjectListQuery,
  requireMessage,
  formatTerm,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([]);

  const weaknesses: string[] = ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus', 'Probability'];

  const handleNext = async () => {
    try {
      await form.validateFields(); // Validate current step fields
      setCurrentStep(currentStep + 1); // Go to the next step
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1); // Go to the previous step
  };

  const handleFinish = (values: Record<string, any>) => {
    const payload: any = {
      ...values,
      weaknesses: selectedWeaknesses,
    };
    handleGenerateQuiz(payload);
    setOpenModal(false);
  };

  return (
    <Modal title="Generate Quiz" open={openModal} onCancel={() => setOpenModal(false)} footer={null} centered>
      <Steps current={currentStep}>
        <Steps.Step title="Step 1" />
        <Steps.Step title="Step 2" />
      </Steps>

      {currentStep === 0 && (
        <Form form={form} layout="vertical" onFinish={handleNext}>
          <div className="grid grid-cols-1 gap-4">
            <Form.Item
              name="title"
              label="Quiz Name"
              rules={[{ required: true, message: requireMessage('quiz name') }]}
            >
              <Input placeholder="Enter Quiz Name" />
            </Form.Item>
            <Form.Item
              name="term"
              label="Select Term"
              rules={[{ required: true, message: requireMessage('term', 'select') }]}
            >
              <UISelect
                allowClear
                placeholder="Select Term"
                options={termOptions.map((item) => ({
                  value: item.value,
                  label: `${formatTerm(item?.label)}`,
                }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="subject"
              label="Select Subject"
              rules={[{ required: true, message: requireMessage('subject', 'select') }]}
            >
              <UISelect
                allowClear
                placeholder="Select Subject"
                options={subjectListQuery?.subjects?.map((item: Subject) => ({
                  value: item.id,
                  label: `${item.master_subject.subject_name} ${formatTerm(item.term.term_name)}`,
                }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="number_of_questions"
              label="Number of Questions"
              rules={[{ required: true, message: requireMessage('questions') }]}
            >
              <Select
                placeholder="Enter Number of Questions"
                options={[
                  { value: '5', label: '5' },
                  { value: '10', label: '10' },
                  { value: '15', label: '15' },
                  { value: '20', label: '20' },
                ]}
              />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </div>
        </Form>
      )}

      {currentStep === 1 && (
        <div>
          <h3 className="mb-4">Select Weaknesses</h3>
          <UISelect
            mode="multiple"
            allowClear
            placeholder="Select Weaknesses"
            options={weaknesses.map((item) => ({
              value: item,
              label: item,
            }))}
            style={{ width: '100%', maxHeight: '200px', overflowY: 'auto' }}
            value={selectedWeaknesses}
            onChange={(values: string[]) => setSelectedWeaknesses(values)}
          />
          <div className="flex justify-between gap-2 mt-4">
            <Button onClick={handlePrevious}>Previous</Button>
            <Button
              type="primary"
              onClick={() => {
                form.validateFields().then((values) => handleFinish(values));
              }}
            >
              Generate Quiz
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MultiStepModal;
