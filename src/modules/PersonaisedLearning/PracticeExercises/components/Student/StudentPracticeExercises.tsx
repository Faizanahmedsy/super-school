import NewChooseTerm from '@/components/global/ChooseCardsNew/NewChooseTerm';
import NewChooseTermWiseSubject from '@/components/global/ChooseCardsNew/NewChooseTermWiseSubjects';
import UIFormItemSelect from '@/components/global/Form/v4/UIFormItem';
import UISelect from '@/components/global/Form/v4/UISelect';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { useListOption } from '@/hooks/use-select-option';
import { formatTerm } from '@/lib/common-functions';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import { useTermList } from '@/services/master/term/term.action';

import useGlobalState from '@/store';
import { DatePicker, Form, Input, Modal } from 'antd';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuizLimitIndicator } from '../../shared/QuizLimitIndicator';
import PerformanceInsights from './PerformanceInsights';
import StudentQuizTable from './StudentQuizTable';
import {
  useGenerateSelfQuiz,
  useQuizAssessmentStrengthsAndWeaknesses,
} from '../../action/personalized-learning.action';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { BadgePlus } from 'lucide-react';
import UIText from '@/components/global/Text/UIText';

export default function StudentPracticeExercises() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stepFromQuery = Number(searchParams.get('step')) || 1;

  const handleSetStep = (newStep: number) => {
    setSearchParams({ step: newStep.toString() });
  };

  const [form] = Form.useForm();

  const [openModal, setOpenModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);

  const user = useGlobalState((state) => state.user);

  const batchId = useRoleBasedCurrentBatch();

  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const quizAssessmentStrengthWeaknessQuery = useQuizAssessmentStrengthsAndWeaknesses({
    batch: batchId,
    subject: selectedSubject,
    // grade: user?.details?.grade?.id,
    // grade_class: user?.details?.division?.id,
    student: user?.details.id,
    term: selectedTerm,
  });

  const { data: termListQuery } = useTermList({
    sort: 'asc',
    batch_id: batchId,
  });

  const { options: termOptions } = useListOption({
    listData: termListQuery?.list,
    labelKey: 'term_name',
    valueKey: 'id',
  });

  const { data: subjectListQuery } = useSubjectList(
    {
      sort: 'asc',
      batch_id: batchId,
      grade_id: user?.details?.grade_id,
      term_id: selectedTerm,
      checkStudent: true,
    },
    Boolean(selectedTerm)
  );
  const generateSelfQuizApi = useGenerateSelfQuiz();

  const handleGenerateQuiz = (payload: any) => {
    generateSelfQuizApi.mutate(payload, {
      onSuccess: () => {
        setOpenModal(false);
        handleSetStep(3);
        form.resetFields();
      },
    });
  };

  const disabledStartDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const disabledEndDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < (startDate ? startDate.startOf('day') : dayjs().startOf('day'));
  };

  return (
    <>
      <PageTitle
        extraItem={
          <>
            <Button className="gap-2" onClick={() => setOpenModal(true)}>
              <BadgePlus size={18} />
              <UIText>Generate Quiz using AI</UIText>
            </Button>
          </>
        }
      >
        Practice Exercises
      </PageTitle>
      {stepFromQuery === 1 && <NewChooseTerm step={stepFromQuery} setStep={handleSetStep} />}

      {stepFromQuery === 2 && (
        <div className="space-y-2">
          <PerformanceInsights />
          <NewChooseTermWiseSubject step={stepFromQuery} setStep={handleSetStep} allowActions={false} />
        </div>
      )}
      {stepFromQuery === 3 && <StudentQuizTable setStep={handleSetStep} step={stepFromQuery} />}

      <Modal
        title="Generate Quiz"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        centered
        onOk={() => {
          if (!generateSelfQuizApi.isPending) {
            form.submit();
          }
        }}
        confirmLoading={generateSelfQuizApi.isPending}
        width={700}
      >
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100 mb-3">
          <QuizLimitIndicator />
        </div>
        <Form form={form} layout="vertical" onFinish={handleGenerateQuiz}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name={'title'}
              label="Quiz Name"
              rules={[{ required: true, message: requireMessage('quiz name') }]}
            >
              <Input placeholder="Enter Quiz Name" />
            </Form.Item>

            <CustomFormItem
              name={'quiz_start_date_time'}
              label="Select Start Date and Time"
              rules={[{ required: true, message: requireMessage('Start Date and Time', 'select') }]}
            >
              <DatePicker
                disabledDate={disabledStartDate}
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                onChange={(date) => setStartDate(date)}
                placeholder="Select Start Date and Time"
                showTime
              />
            </CustomFormItem>

            <CustomFormItem
              name={'quiz_end_date_time'}
              label="Select End Date and Time"
              rules={[{ required: true, message: requireMessage('End Date and Time', 'select') }]}
              className="w-full"
            >
              <DatePicker
                disabledDate={disabledEndDate}
                placeholder="Select End Date and Time"
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                showTime
              />
            </CustomFormItem>

            <UIFormItemSelect
              name={'term'}
              label="Select Term"
              rules={[{ required: true, message: requireMessage('term', 'select') }]}
            >
              <UISelect
                allowClear
                placeholder="Select term"
                options={termOptions.map((item) => ({
                  value: item.value,
                  label: `${formatTerm(item?.label)}`,
                }))}
                className="w-full"
                onChange={(value: number) => setSelectedTerm(value)}
              />
            </UIFormItemSelect>

            <UIFormItemSelect
              name={'subject'}
              label="Select Subject"
              rules={[{ required: true, message: requireMessage('subject', 'select') }]}
            >
              <UISelect
                allowClear
                placeholder="Select Subject"
                options={subjectListQuery?.subjects?.map((item: any) => ({
                  value: item.id,
                  label: `${item?.master_subject?.subject_name} ${formatTerm(item?.term?.term_name)}`,
                }))}
                className="w-full"
                onChange={(value: number) => setSelectedSubject(value)}
              />
            </UIFormItemSelect>

            <UIFormItemSelect
              name={'number_of_questions'}
              label="Number of Questions"
              rules={[{ required: true, message: requireMessage('questions') }]}
            >
              <UISelect
                placeholder="Select Number of Questions"
                options={[
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                  { value: 20, label: '20' },
                ]}
                className="w-full"
              />
            </UIFormItemSelect>

            <UIFormItemSelect
              name="weaknesses"
              label="Select Weakness"
              rules={[{ required: true, message: requireMessage('Weakness', 'select') }]}
            >
              <UISelect
                allowClear
                mode="multiple"
                options={quizAssessmentStrengthWeaknessQuery?.data?.weaknesses.map((item: any) => ({
                  value: item,
                  label: item,
                }))}
                placeholder="Select Weakness"
                className="w-full"
              />
            </UIFormItemSelect>
          </div>
        </Form>
      </Modal>
    </>
  );
}
