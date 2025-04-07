import DivisionSelect from '@/components/global/Form/SelectDivision';
import SelectGrade from '@/components/global/Form/SelectGrade';
import UIFormItemSelect from '@/components/global/Form/v4/UIFormItem';
import { caughtIn4k } from '@/lib/helpers/error/caught-in-4k';
import {
  useCreateLessonPlan,
  useLessonPlanDetails,
  useUpdateLessonPlan,
} from '@/modules/PersonaisedLearning/LessonPlan/action/lesson-plan.action';
import useGlobalState from '@/store';
import { Card, DatePicker, Form, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';

import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UIFormCardTitle from '@/components/global/Card/UIFormCardTitle';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { superEndDate, superStartDate } from '@/lib/helpers/date-time/date-time.utils';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import dayjs, { Dayjs } from 'dayjs';
import JoditEditor from 'jodit-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { claudeDailyLessonPlan } from '../../constants/claudeLessonPlan';
import { deepSeekLessonPlan, deepSeekMonthLessonPlan } from '../../constants/deepSeekLessonplan';
import { LessonPlanPayload } from '../../types/lesson-plan.types';
import UILoader from '@/components/custom/loaders/UILoader';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

export default function CreateEditLessonPlan() {
  // HOOKS
  const [form] = Form.useForm();

  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editid');
  const navigate = useNavigate();
  const curBatchId = useRoleBasedCurrentBatch();

  // REFS
  const textRichEditor = useRef(null);

  const batchId: any = useRoleBasedCurrentBatch();
  const gradeId: any = useGlobalState((state) => state.grade_id);
  const setGradeId = useGlobalState((state) => state.setGradeId);
  const setBatchId = useGlobalState((state) => state.setBatchId);

  // LOCAL STATE
  const [step, setStep] = useState<1 | 2>(1);
  const [timeline, setTimeline] = useState<'day' | 'week' | 'month'>('day');
  const [firstStepData, setFirstStepData] = useState<any>(null);
  const [textEditorValue, setTextEditorValue] = useState('');
  const [startDate, setStartDate] = useState<any>(undefined);
  const [endDate, setEndDate] = useState<any>(undefined);

  const createLessonPlanMutation = useCreateLessonPlan();
  const updateLessonPlanMutation = useUpdateLessonPlan();
  const lessonPlanDetailQuery = useLessonPlanDetails(Number(editId));
  const user = useGlobalState((state) => state.user);

  useEffect(() => {
    if (user?.role_name == ROLE_NAME.STUDENT) {
      form.setFieldsValue({
        grade: String(user?.details?.grade?.grade_number),
        grade_class: String(user?.details.division?.id),
      });
    }
  }, []);

  useEffect(() => {
    if (lessonPlanDetailQuery?.data) {
      setBatchId(lessonPlanDetailQuery?.data?.batch);
      setGradeId(String(lessonPlanDetailQuery?.data?.grade));
      setTimeline(lessonPlanDetailQuery?.data?.activity_type);

      setTextEditorValue(lessonPlanDetailQuery?.data?.activity);

      form.setFieldsValue({
        title: lessonPlanDetailQuery?.data?.title,
        grade: String(lessonPlanDetailQuery?.data?.grade),
        grade_class: String(lessonPlanDetailQuery?.data?.grade_class),
        subject_id: String(lessonPlanDetailQuery?.data?.subject),
        timeline: lessonPlanDetailQuery?.data?.activity_type,
        note: lessonPlanDetailQuery?.data?.notes,
        date:
          lessonPlanDetailQuery?.data?.activity_type === 'day' ? dayjs(lessonPlanDetailQuery?.data?.start_date) : null,
        week:
          lessonPlanDetailQuery?.data?.activity_type === 'week' ? dayjs(lessonPlanDetailQuery?.data?.start_date) : null,
        month:
          lessonPlanDetailQuery?.data?.activity_type === 'month'
            ? dayjs(lessonPlanDetailQuery?.data?.start_date)
            : null,
      });
    }
  }, [lessonPlanDetailQuery?.data, form, setGradeId, setBatchId]);

  useEffect(() => {
    if (timeline === 'day') {
      setTextEditorValue(claudeDailyLessonPlan);
    } else if (timeline === 'week') {
      setTextEditorValue(deepSeekLessonPlan);
    } else if (timeline === 'month') {
      setTextEditorValue(deepSeekMonthLessonPlan);
    } else {
      setTextEditorValue(deepSeekLessonPlan);
    }
  }, [timeline]);

  useEffect(() => {
    if (editId && lessonPlanDetailQuery?.data) {
      setTextEditorValue(lessonPlanDetailQuery?.data?.activity);
    }
  }, [editId, lessonPlanDetailQuery?.data]);

  // QUERIES
  const subjectListQuery = useSubjectList(
    {
      batch_id:
        user?.role_name === ROLE_NAME.PARENT || user?.role_name === ROLE_NAME.STUDENT
          ? user?.cur_batch?.id
          : batchId
            ? batchId
            : user?.cur_batch?.id,
      grade_id:
        user?.role_name === ROLE_NAME.PARENT || user?.role_name === ROLE_NAME.STUDENT
          ? user?.details.grade?.id
          : gradeId
            ? gradeId
            : user?.details.grade?.id,
    },
    Boolean(
      user?.role_name === ROLE_NAME.PARENT || user?.role_name === ROLE_NAME.STUDENT ? user?.cur_batch?.id : batchId
    ) &&
      Boolean(
        user?.role_name === ROLE_NAME.PARENT || user?.role_name === ROLE_NAME.STUDENT
          ? user?.details.grade?.id
          : gradeId
      )
  );

  const config = useMemo(
    () => ({
      placeholder: '',
      disablePlugins: ['class-span', 'file', 'image', 'video', 'spellcheck', 'speech-recognize', 'source', 'fullsize'],
      removeButtons: [
        'about',
        'brush',
        'copyformat',
        'cut',
        'copy',
        'paste',
        'selectall',
        'video',
        'image',
        'file',
        'image',
        'video',
        'speechRecognize',
      ],
    }),
    []
  );

  const handleWeekChange = (value: Dayjs | null) => {
    if (value) {
      const startDate = value.startOf('week');
      const endDate = value.endOf('week');
      setStartDate(startDate?.toDate());
      setEndDate(endDate?.toDate());
    }
  };

  const handleMonthChange = (value: Dayjs | null) => {
    if (value) {
      const startDate = value.startOf('month');
      const endDate = value.endOf('month');
      setStartDate(startDate?.toDate());
      setEndDate(endDate?.toDate());
    }
  };

  const handleSubmit = async (values: LessonPlanPayload) => {
    // Combine data from both steps
    const allValues = {
      ...firstStepData,
      ...values,
      textEditorValue: textEditorValue,
    };
    const payload: LessonPlanPayload = {
      grade: Number(allValues.grade),
      grade_class: Number(allValues.grade_class),
      subject: Number(allValues.subject_id),
      title: allValues.title,
      notes: allValues.note,
      activity: allValues.textEditorValue,
      batch: Number(curBatchId),
      activity_type: allValues.timeline,
      start_date: dayjs(superStartDate(startDate)).format('YYYY-MM-DD'),
      end_date: dayjs(superEndDate(endDate)).format('YYYY-MM-DD'),
    };

    if (editId) {
      updateLessonPlanMutation.mutate(
        { id: Number(editId), payload },
        {
          onSuccess: () => {
            // setOpen(false);
            form.resetFields();
            setFirstStepData(null);
            toast.success('Lesson Plan updated successfully');
            navigate('/lesson-plan');
          },
        }
      );
    } else {
      createLessonPlanMutation.mutate(payload, {
        onSuccess: () => {
          // setOpen(false);
          toast.success('Lesson Plan created successfully');
          navigate('/lesson-plan');
          form.resetFields();
          setFirstStepData(null);
        },
      });
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFirstStepData(values);
      setStep(2);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const renderStep2 = () => {
    switch (timeline) {
      case 'day':
        return (
          <>
            <CustomFormItem label="Date" name="date" rules={[{ required: true, message: 'Date is required' }]}>
              <DatePicker
                className="w-full"
                onChange={(date, dateString) => {
                  setStartDate(date?.toDate());
                  setEndDate(date?.toDate());
                }}
              />
            </CustomFormItem>
          </>
        );
      case 'week':
        return (
          <>
            <Form.Item label="Pick a Week" name="week" rules={[{ required: true, message: 'Week is required' }]}>
              <DatePicker picker="week" className="w-full" onChange={handleWeekChange} />
            </Form.Item>
          </>
        );
      case 'month':
        return (
          <>
            <Form.Item label="Pick a Month" name="month" rules={[{ required: true, message: 'Month is required' }]}>
              <DatePicker picker="month" className="w-full" onChange={handleMonthChange} />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  const renderModalForms = () => {
    switch (step) {
      case 1:
        return (
          <>
            {lessonPlanDetailQuery.isPending && editId ? (
              <>
                <UILoader />
              </>
            ) : (
              <>
                <div className="grid md:grid-cols-4 gap-4">
                  <CustomFormItem label="Title" name="title" rules={[{ required: true, message: 'Title is required' }]}>
                    <Input placeholder="Enter a title" />
                  </CustomFormItem>

                  <SelectGrade
                    name="grade"
                    config={{
                      required: false,
                    }}
                  />
                  <DivisionSelect name="grade_class" typeSelect={'single'} />
                  <UIFormItemSelect label="Select Subject" name="subject_id">
                    <Select
                      placeholder="Select Subject"
                      options={subjectListQuery?.data?.subjects.map((subject: any) => ({
                        label: subject?.master_subject?.subject_name,
                        value: subject?.id,
                      }))}
                      allowClear
                    />
                  </UIFormItemSelect>
                  <UIFormItemSelect
                    label="Timeline"
                    name="timeline"
                    rules={[{ required: true, message: 'Timeline is required' }]}
                  >
                    <Select
                      placeholder="Select Timeline"
                      options={[
                        { label: 'Day', value: 'day' },
                        { label: 'Week', value: 'week' },
                        { label: 'Month', value: 'month' },
                      ]}
                      onChange={(value: any) => setTimeline(value)}
                    />
                  </UIFormItemSelect>
                </div>
              </>
            )}
          </>
        );
      case 2:
        return (
          <>
            <CustomFormItem label="Activity">
              <JoditEditor
                ref={textRichEditor}
                value={textEditorValue}
                config={config}
                onBlur={(newContent: string) => {
                  setTextEditorValue(newContent);
                }}
              />
            </CustomFormItem>

            <div className="grid md:grid-cols-3 gap-4">
              <CustomFormItem label="Notes" name="note">
                <TextArea className="w-full" />
              </CustomFormItem>

              {renderStep2()}
            </div>
          </>
        );

      default:
        caughtIn4k(new Error('Invalid step'));
        return null;
    }
  };

  return (
    <>
      <PageTitle
        breadcrumbs={[
          { label: 'Lesson Plan List', href: '/lesson-plan' },
          { label: `${editId ? 'Edit' : 'Create'} Lesson Plan` },
        ]}
      >
        {`${editId ? 'Edit' : 'Create'} Lesson Plan`}
      </PageTitle>
      <Card>
        <UIFormCardTitle>
          <UIText>Basic Details</UIText>
        </UIFormCardTitle>
        <div className="">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {renderModalForms()}
            <div className="flex justify-end">
              {step > 1 && (
                <Button onClick={() => setStep(1)} style={{ marginRight: 8 }} type="button" variant={'nsc-secondary'}>
                  Previous
                </Button>
              )}
              {step < 2 ? (
                <Button onClick={handleNext} type="button">
                  <UIText>Next</UIText>
                </Button>
              ) : (
                <UIFormSubmitButton api={editId ? updateLessonPlanMutation : createLessonPlanMutation}>
                  Submit
                </UIFormSubmitButton>
              )}
            </div>
          </Form>
        </div>
      </Card>
    </>
  );
}
