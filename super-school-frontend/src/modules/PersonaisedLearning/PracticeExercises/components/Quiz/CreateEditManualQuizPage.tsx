import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import UIMultiSelect from '@/components/global/Form/v4/UIMultiSelect';
import UISelect from '@/components/global/Form/v4/UISelect';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { DatePickerProps } from 'antd';
import { DatePicker, Form, Input } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateManualQuiz, useQuizDetails, useUpdateQuiz } from '../../action/personalized-learning.action';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UIText from '@/components/global/Text/UIText';
import { BadgePlus } from 'lucide-react';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import SelectGrade from '@/components/global/Form/SelectGrade';
import SelectTerm from '@/components/global/Form/SelectTerm';
import SelectSubject from '@/components/global/Form/SelectSubject';

// Types
interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  actual_answers: string[];
  multi_choice: boolean;
}

interface QuizData {
  title: string;
  quiz_topic: string;
  grade: number;
  grade_class: number[] | null;
  subject: number;
  term: number | null;
  batch: number | null;
  quiz_start_date_time: string;
  quiz_end_date_time: string;
  number_of_questions?: number;
  quiz_qanda: QuizQuestion[];
}

// Component props type (if needed)
type GenerateQuizPageProps = {
  // Add any props if needed
};

const CreateEditManualQuizPage: React.FC<GenerateQuizPageProps> = () => {
  // HOOKS

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  const quizDetailsQuery = useQuizDetails(Number(editId));
  const updateQuizApi = useUpdateQuiz();
  const batchId = useRoleBasedCurrentBatch();
  const filterData = useGlobalState((state) => state.filterData);

  const isFilterApplied = {
    batch: filterData?.batch?.id && filterData?.batch?.id !== 'null' ? true : false,
    grade: filterData?.grade?.id && filterData?.grade?.id !== 'null' ? true : false,
    class: filterData?.class?.id && filterData?.class?.id !== 'null' ? true : false,
    term: filterData?.term?.id && filterData?.term?.id !== 'null' ? true : false,
    subject: filterData?.subject?.id && filterData?.subject?.id !== 'null' ? true : false,
  };

  // LOCAL STATES
  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    quiz_topic: '',
    grade: 0,
    grade_class: [],
    subject: 0,
    term: 0,
    batch: 0,
    quiz_start_date_time: '',
    quiz_end_date_time: '',
    quiz_qanda: [
      {
        question: '',
        options: [''],
        actual_answers: [],
        multi_choice: false,
      },
    ],
  });

  const [selectedGrade, setSelectedGrade] = useState<number>();
  const [selectedTerm, setSelectedTerm] = useState<number>();

  // Add this useEffect after your existing state declarations

  useEffect(() => {
    setSelectedGrade(filterData.grade ? Number(filterData.grade.id) : undefined);
    setSelectedTerm(filterData.term ? Number(filterData.term.id) : undefined);
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

  useEffect(() => {
    form.setFieldsValue({
      subject: isFilterApplied.subject ? filterData?.subject?.id : undefined,
    });
    if (editId && quizDetailsQuery?.data) {
      const quizDetails = quizDetailsQuery.data;
      // Set form values
      form.setFieldsValue({
        title: quizDetails.main_quiz.title,
        grade: quizDetails.main_quiz.grade,
        term: quizDetails.main_quiz.subject,
        subject: quizDetails.main_quiz.subject,
        quiz_start_date_time: dayjs(quizDetails.main_quiz.quiz_start_date_time),
        quiz_end_date_time: dayjs(quizDetails.main_quiz.quiz_end_date_time),
      });

      // Set selected states for dependent dropdowns
      setSelectedGrade(quizDetails.main_quiz?.grade);

      // Transform quiz questions data
      const transformedQuestions = quizDetails.quiz_qanda.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        actual_answers: q.actual_answer, // Note: adjust if the API response uses different field name
        multi_choice: q.multi_choice,
      }));

      // Set quiz data state
      setQuizData({
        title: quizDetails.main_quiz.title,
        quiz_topic: 'data',
        grade: quizDetails.main_quiz.grade,
        grade_class: null,
        subject: quizDetails.main_quiz.subject,
        term: null,
        batch: null,
        quiz_start_date_time: quizDetails.main_quiz.quiz_start_date_time,
        quiz_end_date_time: quizDetails.main_quiz.quiz_end_date_time,
        quiz_qanda: transformedQuestions,
      });
    }
  }, [editId, quizDetailsQuery?.data, form, isFilterApplied.subject]);

  // QUERIES
  const createManualQuizApi = useCreateManualQuiz();

  const quizDetailsApi = useQuizDetails(Number(editId));

  const user = useGlobalState((state) => state.user);

  const { data: subjectListQuery } = useSubjectList({
    sort: 'asc',
    batch_id: batchId,
    grade_id: selectedGrade,
    term_id: selectedTerm,
    checkStudent: true,
    // student_count: true,
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

  const { data: classListQuery } = useDivisionList({
    sort: 'asc',
    batch_id: batchId,
    grade_id: selectedGrade,
    checkStudent: true,
  });

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

  // Handle start date change
  const handleStartDateChange: DatePickerProps['onChange'] = (date: Dayjs | null): void => {
    setQuizData({
      ...quizData,
      quiz_start_date_time: date ? date.toISOString() : '',
    });
  };

  // Handle end date change
  const handleEndDateChange: DatePickerProps['onChange'] = (date: Dayjs | null): void => {
    setQuizData({
      ...quizData,
      quiz_end_date_time: date ? date.toISOString() : '',
    });
  };

  // Disable end dates before start date
  const disabledEndDate = (current: Dayjs): boolean => {
    if (!quizData.quiz_start_date_time) return false;
    const startDate = dayjs(quizData.quiz_start_date_time);
    return current.isBefore(startDate, 'day');
  };

  const handleAddQuestion = (): void => {
    if (quizData.quiz_qanda.length < 20) {
      setQuizData({
        ...quizData,
        quiz_qanda: [
          ...quizData.quiz_qanda,
          {
            question: '',
            options: [''],
            actual_answers: [],
            multi_choice: false,
          },
        ],
      });
    }
  };

  const handleRemoveQuestion = (index: number): void => {
    const updatedQuestions = [...quizData.quiz_qanda];
    updatedQuestions.splice(index, 1);
    setQuizData({
      ...quizData,
      quiz_qanda: updatedQuestions,
    });
  };

  const handleQuestionChange = (index: number, value: string): void => {
    const updatedQuestions = [...quizData.quiz_qanda];
    updatedQuestions[index].question = value;
    setQuizData({
      ...quizData,
      quiz_qanda: updatedQuestions,
    });
  };

  const handleAddOption = (questionIndex: number): void => {
    const updatedQuestions = [...quizData.quiz_qanda];
    updatedQuestions[questionIndex].options.push('');
    setQuizData({
      ...quizData,
      quiz_qanda: updatedQuestions,
    });
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number): void => {
    const updatedQuestions = [...quizData.quiz_qanda];
    const question = updatedQuestions[questionIndex];
    const removedOption = question.options[optionIndex];

    question.options.splice(optionIndex, 1);
    question.actual_answers = question.actual_answers.filter((answer) => answer !== removedOption);
    question.multi_choice = question.actual_answers.length > 1;

    setQuizData({
      ...quizData,
      quiz_qanda: updatedQuestions,
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string): void => {
    const updatedQuestions = [...quizData.quiz_qanda];
    const question = updatedQuestions[questionIndex];
    const oldValue = question.options[optionIndex];

    question.options[optionIndex] = value;
    question.actual_answers = question.actual_answers.map((answer) => (answer === oldValue ? value : answer));

    setQuizData({
      ...quizData,
      quiz_qanda: updatedQuestions,
    });
  };

  const handleCorrectAnswerToggle = (questionIndex: number, option: string): void => {
    const updatedQuestions = [...quizData.quiz_qanda];
    const question = updatedQuestions[questionIndex];

    if (question.actual_answers.includes(option)) {
      question.actual_answers = question.actual_answers.filter((answer) => answer !== option);
    } else {
      question.actual_answers.push(option);
    }

    question.multi_choice = question.actual_answers.length > 1;

    setQuizData({
      ...quizData,
      grade_class: quizData?.grade_class?.map((item) => Number(item)) || [],
      subject: Number(quizData.subject),
      term: Number(quizData.term),
      grade: Number(quizData.grade),
      batch: Number(batchId),
      quiz_qanda: updatedQuestions,
    });
  };

  const isQuestionValid = (question: QuizQuestion): boolean => {
    return (
      question.question.trim() !== '' &&
      question.options.every((opt) => opt.trim() !== '') &&
      question.actual_answers.length > 0
    );
  };

  const isQuizValid = (): boolean => {
    return (
      quizData.title.trim() !== '' &&
      quizData.quiz_start_date_time !== '' &&
      quizData.quiz_end_date_time !== '' &&
      quizData.quiz_qanda.every((q) => isQuestionValid(q))
    );
  };

  const handleSubmit = (values: any) => {
    if (!editId) {
      const payload = {
        title: values.title,
        quiz_topic: values.quiz_topic,
        grade: Number(values.grade),
        grade_class: values.grade_class.map((item: any) => Number(item)),
        subject: Number(values.subject),
        term: Number(values.term),
        batch: Number(batchId),
        quiz_start_date_time: quizData.quiz_start_date_time,
        quiz_end_date_time: quizData.quiz_end_date_time,
        quiz_qanda: quizData.quiz_qanda,
        number_of_questions: quizData.quiz_qanda.length,
      };

      createManualQuizApi.mutate(payload, {
        onSuccess: (data) => {
          displaySuccess(data?.message);
          form.resetFields();
          setQuizData({
            title: '',
            quiz_topic: '',
            grade: 0,
            grade_class: [],
            subject: 0,
            term: 0,
            batch: 0,
            quiz_start_date_time: '',
            quiz_end_date_time: '',
            quiz_qanda: [
              {
                question: '',
                options: [''],
                actual_answers: [],
                multi_choice: false,
              },
            ],
          });

          navigate('/practice/quiz-list');
        },
        onError: (error: any) => {
          displayError(error?.response?.data?.error);
        },
      });
    } else {
      // Prepare the payload based on the example provided

      // Update existing quiz
      const updatePayload = {
        title: values.title,
        questions: quizData.quiz_qanda.map((q) => ({
          id: q?.id ? q?.id : 0, // Make sure your QuizQuestion type includes an optional id field
          question: q.question,
          actual_answers: q.actual_answers,
          multi_choice: q.multi_choice,
        })),
      };

      updateQuizApi.mutate(
        { id: Number(editId), payload: updatePayload },
        {
          onSuccess: (data) => {
            displaySuccess(data?.message || 'Quiz updated successfully');
            navigate(`/practice/quiz-details/${editId}`);
            // Optionally redirect or refresh data
          },
          onError: (error: any) => {
            displayError(error?.response?.data?.error || 'Failed to update quiz');
          },
        }
      );
    }
  };

  return (
    <div className=" p-4 ">
      {editId ? <PageTitle>Update MCQ Quiz</PageTitle> : <PageTitle>Create MCQ Quiz</PageTitle>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <h3>
                <UIText>Quiz Details</UIText>
              </h3>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form layout="vertical" onFinish={handleSubmit} form={form}>
              <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-4 gap-4">
                <CustomFormItem
                  label="Quiz Title"
                  name={'title'}
                  rules={[{ required: true, message: requireMessage('quiz title') }]}
                >
                  <Input
                    placeholder="Enter Quiz Title"
                    value={quizData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setQuizData({ ...quizData, title: e.target.value })
                    }
                    className="mb-4 max-w-lg"
                  />
                </CustomFormItem>

                <CustomFormItem
                  label="Quiz Topic"
                  name={'quiz_topic'}
                  rules={[{ required: true, message: requireMessage('quiz topic') }]}
                >
                  <Input
                    placeholder="Enter Quiz Topic"
                    value={quizData.quiz_topic}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setQuizData({ ...quizData, quiz_topic: e.target.value })
                    }
                    className="mb-4 max-w-lg"
                  />
                </CustomFormItem>

                <CustomFormItem
                  label="Start Date & Time"
                  name={'quiz_start_date_time'}
                  rules={[{ required: true, message: requireMessage('Start Date and Time', 'select') }]}
                >
                  <DatePicker
                    showTime
                    placeholder="Start Date & Time"
                    onChange={handleStartDateChange}
                    className="flex-1 w-full"
                    showSecond={false}
                  />
                </CustomFormItem>
                <CustomFormItem
                  label="End Date & Time"
                  name={'quiz_end_date_time'}
                  rules={[{ required: true, message: requireMessage('End Date and Time', 'select') }]}
                >
                  <DatePicker
                    showTime
                    placeholder="End Date & Time"
                    onChange={handleEndDateChange}
                    disabledDate={disabledEndDate}
                    className="flex-1 w-full"
                    showSecond={false}
                  />
                </CustomFormItem>
                {!editId && (
                  <>
                    {/* <CustomFormItem
                      name={'grade'}
                      label="Select Grade"
                      rules={[{ required: true, message: requireMessage('grade', 'select') }]}
                    >
                      <UISelect
                        allowClear
                        placeholder="Select Grade"
                        options={gradeOptions}
                        style={{ width: '100%' }}
                        onChange={(value: number) => {
                          setSelectedGrade(value);
                          setQuizData({ ...quizData, grade: value });
                        }}
                      />
                    </CustomFormItem> */}
                    <RenderGradeSelect
                      isFilterApplied={isFilterApplied.grade}
                      filterData={filterData}
                      editMode={!editId}
                    />
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
                        style={{ width: '100%' }}
                        onChange={(value: number[]) => setQuizData({ ...quizData, grade_class: value })}
                      />
                    </CustomFormItem>
                    <RenderTermSelect isFilterApplied={isFilterApplied.term} filterData={filterData} />
                    {/* <CustomFormItem
                      name={'term'}
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
                        onChange={(value: number) => {
                          setSelectedTerm(value);
                          setQuizData({ ...quizData, term: value });
                        }}
                      />
                    </CustomFormItem> */}

                    <CustomFormItem
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
                        onChange={(value: number) => setQuizData({ ...quizData, subject: value })}
                        style={{ width: '100%' }}
                      />
                    </CustomFormItem>
                  </>
                )}
              </div>
            </Form>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader>
            <CardTitle>
              <h3>
                <UIText>Quiz Questions</UIText>
              </h3>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form layout="vertical">
              {quizData.quiz_qanda.map((q, questionIndex) => (
                <div key={questionIndex} className="p-4 border rounded-lg space-y-4 my-5">
                  <div className="flex justify-between items-center gap-4">
                    <CustomFormItem label="Question" className="flex-1">
                      <Input
                        placeholder={`Question ${questionIndex + 1}`}
                        value={q.question}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleQuestionChange(questionIndex, e.target.value)
                        }
                        className="flex-1"
                      />
                    </CustomFormItem>
                    {quizData.quiz_qanda.length > 1 && (
                      <Button
                        variant="destructive"
                        onClick={() => handleRemoveQuestion(questionIndex)}
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {q.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-4">
                      <CustomFormItem label={`Option ${optionIndex + 1}`} className="flex-1">
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleOptionChange(questionIndex, optionIndex, e.target.value)
                          }
                          className="flex-1"
                        />
                      </CustomFormItem>
                      <Checkbox
                        checked={q.actual_answers.includes(option)}
                        onCheckedChange={() => handleCorrectAnswerToggle(questionIndex, option)}
                        className="shrink-0"
                      />
                      {q.options.length > 1 && (
                        <Button
                          variant="destructive"
                          onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                          className="shrink-0"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <Button onClick={() => handleAddOption(questionIndex)}>
                      <UIText>
                        <BadgePlus size={18} className="mx-2" />
                        Add Option
                      </UIText>
                    </Button>
                  </div>
                </div>
              ))}

              {quizData.quiz_qanda.length < 20 && (
                <div className="flex justify-end">
                  <Button type="button" onClick={handleAddQuestion}>
                    <UIText>
                      <BadgePlus size={18} className="mx-2" />
                      Add Question
                    </UIText>
                  </Button>
                </div>
              )}
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <UIFormSubmitButton
          onClick={form.submit}
          disabled={!isQuizValid()}
          api={editId ? updateQuizApi : createManualQuizApi}
        >
          {editId ? <UIText>Update Quiz</UIText> : <UIText>Save Quiz</UIText>}
        </UIFormSubmitButton>
      </div>
    </div>
  );
};

export default CreateEditManualQuizPage;

const RenderTermSelect = ({ isFilterApplied, filterData }: { isFilterApplied: boolean; filterData: any }) => {
  if (isFilterApplied) {
    return <SelectTerm name="term" initialValue={filterData.term.id} />;
  }

  return <SelectTerm name="term" />;
};

const RenderGradeSelect = ({
  isFilterApplied,
  filterData,
  editMode,
}: {
  isFilterApplied: boolean;
  filterData: any;
  editMode: boolean;
}) => {
  if (isFilterApplied) {
    return <SelectGrade name="grade" initialValue={filterData.grade.id} />;
  }

  if (editMode) {
    return <SelectGrade name="grade" disabled={true} params={{ checkStudent: false }} />;
  }

  return <SelectGrade name="grade" params={{ checkStudent: false }} />;
};
