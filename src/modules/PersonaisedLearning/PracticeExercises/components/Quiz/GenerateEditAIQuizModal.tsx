import UIFormItemSelect from '@/components/global/Form/v4/UIFormItem';
import UIMultiSelect from '@/components/global/Form/v4/UIMultiSelect';
import UISelect from '@/components/global/Form/v4/UISelect';
import { useListOption } from '@/hooks/use-select-option';
import { formatTerm } from '@/lib/common-functions';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import { useDivisionList } from '@/services/master/division/division.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { useTermList } from '@/services/master/term/term.action';
import useGlobalState from '@/store';
import { Button, Form, Input, Modal } from 'antd';
import { DatePicker } from 'antd/lib';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { QuizLimitIndicator } from '../../shared/QuizLimitIndicator';
import { useGenerateQuiz } from '../../action/personalized-learning.action';
import useIsFilterApplied from '@/hooks/use-Is-filter-applied';
import UIText from '@/components/global/Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import { RangePickerProps } from 'antd/es/date-picker';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';

dayjs.extend(utc);
dayjs.extend(timezone);

const GenerateEditAIQuizModal = ({ openGenQuizModal, setOpenGenQuizModal }: any) => {
  //LOCAL STATES
  const [isAIQuizModalOpen, setIsAIQuizModalOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([{ question: '', options: [''] }]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const batchId = useRoleBasedCurrentBatch();

  const filterData = useGlobalState((state) => state.filterData);
  const isFilterApplied = useIsFilterApplied();

  const user = useGlobalState((state) => state.user);

  const generateQuizApi = useGenerateQuiz();

  const { data: subjectListQuery } = useSubjectList(
    {
      sort: 'asc',
      batch_id: batchId,
      grade_id: Number(selectedGrade),
      term_id: Number(selectedTerm),
    },
    Boolean(selectedGrade && selectedTerm)
  );

  const { data: termListQuery } = useTermList({
    sort: 'asc',
    batch_id: batchId,
  });

  const { options: termOptions } = useListOption({
    listData: termListQuery?.list,
    labelKey: 'term_name',
    valueKey: 'id',
  });

  const { data: classListQuery } = useDivisionList(
    {
      sort: 'asc',
      batch_id: batchId,
      grade_id: Number(selectedGrade),
      checkStudent: true,
    },
    Boolean(selectedGrade)
  );

  const { options: classOptions } = useListOption({
    listData: classListQuery?.list,
    labelKey: 'name',
    valueKey: 'id',
  });

  const { data: gradeListQuery } = useGradeList({
    sort: 'asc',
    batch_id: batchId,
    checkStudent: true,
  });

  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  const [form] = Form.useForm();

  useEffect(() => {
    setSelectedGrade(filterData?.grade?.id ? Number(filterData.grade.id) : null);
    setSelectedTerm(filterData?.term?.id ? Number(filterData.term.id) : null);
    form.setFieldsValue({
      grade: isFilterApplied.grade ? filterData?.grade?.id : undefined,
      grade_class: isFilterApplied.class ? filterData?.class?.id : undefined,
      term: isFilterApplied.term ? filterData?.term?.id : undefined,
      subject: isFilterApplied.subject ? filterData?.subject?.id : undefined,
    });
  }, [
    filterData?.grade?.id,
    filterData?.class?.id,
    filterData?.term?.id,
    filterData?.subject?.id,
    isFilterApplied.class,
    isFilterApplied.grade,
    isFilterApplied.subject,
    isFilterApplied.term,
  ]);

  // const classOptions = Array.from({ length: 12 }, (_, i) => ({
  //   value: `Class ${String.fromCharCode(65 + i)}`, // Generates Class A to Class L
  //   label: `Class ${String.fromCharCode(65 + i)}`,
  // }));

  const handleAddQuestion = () => {
    if (quizQuestions.length < 20) {
      setQuizQuestions([...quizQuestions, { question: '', options: [''] }]);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions.splice(index, 1);
    setQuizQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[index].question = value;
    setQuizQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options.push('');
    setQuizQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuizQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuizQuestions(updatedQuestions);
  };

  const handleSaveQuiz = () => {
    setIsAIQuizModalOpen(false);
  };

  const handleSubmit = (values: any) => {
    const payload = {
      title: values.title,
      grade: Number(values.grade),
      grade_class: values.grade_class,
      subject: Number(values.subject),
      term: Number(values.term),
      batch: Number(batchId),
      quiz_start_date_time: dayjs(values.quiz_start_date_time?.$d).utcOffset(0, true).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      quiz_end_date_time: dayjs(values.quiz_end_date_time?.$d).utcOffset(0, true).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      number_of_questions: Number(values.number_of_questions),
    };

    setIsSubmitting(true);

    generateQuizApi.mutate(payload, {
      onSuccess: (data) => {
        displaySuccess(data?.message);

        // Simulate a timeout of 2 seconds after successful submission
        setTimeout(() => {
          setIsSubmitting(false); // Re-enable the button after 2 seconds
          setOpenGenQuizModal(false);
          form.resetFields();
        }, 2000); // 2 seconds timeout
      },
      onError: (error: any) => {
        console.error('Quiz Generation Failed', error);
        setIsSubmitting(false);
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
      {/* Main Modal */}
      <Modal
        title={
          <>
            <UIText>Generate Quiz</UIText>
          </>
        }
        open={openGenQuizModal}
        onCancel={() => setOpenGenQuizModal(false)}
        centered
        width={800}
        footer={
          <>
            <div className="flex justify-end gap-4">
              <Button
                type="primary"
                onClick={form.submit}
                loading={isSubmitting || generateQuizApi.isPending}
                disabled={isSubmitting}
              >
                <UIText>Generate Using AI</UIText>
              </Button>
            </div>
          </>
        }
      >
        <QuizLimitIndicator />

        {/* <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100 mb-3">
          <div className="flex items-center justify-center flex-wrap gap-2 text-sm flex-col">
            <div className="text-gray-600">In 1 year, 25 quizzes can be generated per term.</div>
          </div>
          <div className="mt-3 space-y-2 text-sm flex justify-center items-center">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">2 Quizzes Remaining</span>
            </div>
          </div>
        </div> */}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 xxl:grid-cols-2 gap-4">
            <CustomFormItem
              name={'title'}
              label="Quiz Name"
              rules={[{ required: true, message: requireMessage('quiz name') }]}
            >
              <Input placeholder="Enter Quiz Name" />
            </CustomFormItem>
            <UIFormItemSelect
              name={'grade'}
              label="Select Grade"
              rules={[{ required: true, message: requireMessage('grade', 'select') }]}
            >
              <UISelect
                allowClear
                placeholder="Select Grade"
                options={gradeOptions}
                className="w-full"
                onChange={(value: number) => setSelectedGrade(value)}
              />
            </UIFormItemSelect>
            <CustomFormItem
              name={'grade_class'}
              label="Select Classes"
              rules={[{ required: true, message: requireMessage('class', 'select') }]}
            >
              <UIMultiSelect
                mode="multiple"
                allowClear
                placeholder="Select Classes"
                options={classOptions}
                className="w-full"
              />
            </CustomFormItem>

            <UIFormItemSelect
              name={'term'}
              label="Select Term"
              rules={[{ required: true, message: requireMessage('term', 'select') }]}
            >
              <UISelect
                allowClear
                placeholder="Select a Term"
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
              />
            </UIFormItemSelect>
            <CustomFormItem
              name={'number_of_questions'}
              label="Number of Questions"
              rules={[{ required: true, message: requireMessage('number of question') }]}
            >
              <UISelect
                placeholder="Select Number of Questions"
                options={[
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                  { value: 20, label: '20' },
                ]}
              />
            </CustomFormItem>
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
                showTime
              />
            </CustomFormItem>

            <CustomFormItem
              name={'quiz_end_date_time'}
              label="Select End Date and Time"
              rules={[{ required: true, message: requireMessage('End Date and Time', 'select') }]}
              className="w-full"
            >
              <DatePicker disabledDate={disabledEndDate} className="w-full" format="YYYY-MM-DD HH:mm" showTime />
            </CustomFormItem>

            {/* Action Buttons */}
          </div>
        </Form>
      </Modal>

      {/* AI Quiz Modal */}
      <Modal
        title="Create Quiz"
        open={isAIQuizModalOpen}
        onCancel={() => setIsAIQuizModalOpen(false)}
        centered
        footer={
          <div className="flex justify-end gap-4">
            <Button onClick={() => setIsAIQuizModalOpen(false)} htmlType="button">
              Cancel
            </Button>
            <Button type="primary" onClick={handleSaveQuiz}>
              Save Quiz
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {quizQuestions.map((q, questionIndex) => (
            <div key={questionIndex} className="border-b pb-4">
              <div className="mb-2 flex justify-between items-center">
                <Input
                  placeholder={`Question ${questionIndex + 1}`}
                  value={q.question}
                  onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                  style={{ width: '90%' }}
                />
                {quizQuestions.length > 1 && (
                  <Button type="text" danger onClick={() => handleRemoveQuestion(questionIndex)}>
                    Remove
                  </Button>
                )}
              </div>

              {/* Options */}
              {q.options.map((option: string, optionIndex: number) => (
                <div key={optionIndex} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                    style={{ width: '85%' }}
                  />
                  {q.options.length > 1 && (
                    <Button type="text" danger onClick={() => handleRemoveOption(questionIndex, optionIndex)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}

              {/* Add Option Button */}
              <Button type="dashed" onClick={() => handleAddOption(questionIndex)} className="w-full">
                Add Option
              </Button>
            </div>
          ))}

          {/* Add Question Button */}
          {quizQuestions.length < 20 && (
            <Button type="dashed" onClick={handleAddQuestion} block>
              Add Question
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
};

export default GenerateEditAIQuizModal;
