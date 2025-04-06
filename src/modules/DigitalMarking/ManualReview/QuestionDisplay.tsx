import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import RenderMathsGen2 from '@/components/global/RenderMaths/RenderMathsGen2';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { cn } from '@/lib/utils';
import { useUpdateManualReviewData } from '@/services/manualReview/manualReview.action';
import { Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';
import { ManualReviewItem } from './ManualReview.types';
import UIText from '@/components/global/Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import useGlobalState from '@/store';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

const QuestionDisplay: React.FC<{
  data: ManualReviewItem;
  studentDetails: any;
  isLocked: boolean;
  refetch: any;
  refetchData: any;
}> = ({ data, studentDetails, isLocked, refetch, refetchData }: any) => {
  const [form] = Form.useForm();
  const [isCommentRequired, setIsCommentRequired] = useState(false);
  const updateManualreviewMutation = useUpdateManualReviewData();
  const user = useGlobalState((state) => state.user);
  const [isMarksChanged, setIsMarksChanged] = useState(false);
  const [initialMarks, setInitialMarks] = useState<number | null>(null);

  useEffect(() => {
    if (data) {
      const obtainedMark = data?.obtained_manual_mark != null ? data?.obtained_manual_mark : data?.obtained_mark;
      setInitialMarks(obtainedMark); // Store initial marks
      form.setFieldsValue({
        [`comment-${data.id}`]: data?.teacher_reason,
        [`marks-${data.id}`]: obtainedMark,
      });
      setIsMarksChanged(false); // Reset button state
    }
  }, [data, form]);

  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setIsCommentRequired(newValue !== initialMarks);
    setIsMarksChanged(newValue !== initialMarks); // Compare with initial marks
  };

  const handleSave = async (values: any) => {
    try {
      // const values = await form.validateFields();
      const payload = {
        teacher_reason: values[`comment-${data.id}`],
        obtained_manual_mark: parseFloat(values[`marks-${data.id}`]),
      };
      updateManualreviewMutation.mutate(
        {
          id: Number(data.id),
          payload: payload,
        },
        {
          onSuccess: () => {
            displaySuccess('Answer reviewed successfully!');
            refetchData();
            refetch();
          },
          onError: (error) => {
            displayError(error.message);
          },
        }
      );
    } catch (error) {
      displayError(error);
    }
  };

  const handleSaveClick = () => {
    // const teacherComment = form.getFieldValue(`comment-${data.id}`);
    // if (teacherComment == null) {
    //   setIsCommentRequired(true);
    //   form.setFields([
    //     {
    //       name: `comment-${data.id}`,
    //       errors: ['Please enter a comment'],
    //     },
    //   ]);
    //   return; // Stop submission if comment is required but empty
    // }

    form.submit();
  };

  return (
    <>
      <div
        className={cn(
          'p-4 border rounded-lg mb-3',
          data?.not_detected_word?.length > 0 ||
            (data?.obtained_mark === 0 && !data?.is_reviewed && data?.teacher_reason == null && 'bg-red-100'),
          data?.actual_mark &&
            data?.obtained_mark &&
            data.obtained_mark < data.actual_mark &&
            !data?.is_reviewed &&
            !data?.obtained_manual_mark &&
            'bg-yellow-100',
          data?.obtained_manual_mark > data?.obtained_mark && 'bg-white-100'
        )}
      >
        {data?.not_detected_word?.length > 0 && (
          <div className="text-red-600 font-medium mb-4">
            This question contains words that were not detected by the AI. Please review the answer and assign marks
            manually.
          </div>
        )}
        <RenderMathsGen2 data={data} studentDetails={studentDetails} />
        {data?.not_detected_word?.length > 0 && (
          <div className="text-red-600 font-medium mb-4">
            <UIText>Not detected words</UIText>: {data?.not_detected_word.join(', ')}
          </div>
        )}

        <Form form={form} layout="vertical" initialValues={{ [`marks-${data.id}`]: '' }} onFinish={handleSave}>
          <Form.Item
            label={<UIText>Enter Marks Manually</UIText>}
            className="mx-1"
            name={`marks-${data.id}`}
            rules={[
              {
                required: true,
                message: 'Please enter marks',
              },
              {
                validator: async (_, value) => {
                  if (value > data?.actual_mark) {
                    return Promise.reject(new Error('The manual mark must be less than or equal to the actual mark.'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              min={0}
              disabled={isLocked}
              className={cn('w-full rounded-lg', data?.not_detected_word?.length > 0 && 'bg-gray-50')}
              type="number"
              autoComplete="off"
              pattern="[0-9]*"
              onChange={handleMarksChange} // Call function when marks change
            />
          </Form.Item>
          {(isCommentRequired || data?.teacher_reason != null) && (
            <Form.Item
              label={
                <>
                  <UIText>Teacher Comment:</UIText>
                </>
              }
              rules={[
                {
                  required: isCommentRequired,
                  message: 'Please enter a comment',
                },
              ]}
              className="pt-2 mx-1"
              name={`comment-${data.id}`}
            >
              <TextArea disabled={isLocked} />
            </Form.Item>
          )}
          <div className="flex justify-end">
            {!isLocked &&
              isMarksChanged && // Show only when marks are changed
              (user?.role_name == ROLE_NAME.TEACHER || user?.role_name == ROLE_NAME.ADMIN) && (
                <UIFormSubmitButton type="button" onClick={handleSaveClick} api={updateManualreviewMutation}>
                  <UIText>Save</UIText>
                </UIFormSubmitButton>
              )}
          </div>
        </Form>

        <div className="mt-4 space-y-2">
          <div className="text-gray-700">
            <span className="font-medium">
              <UIText>AI Comment:</UIText>
            </span>{' '}
            {data.reason}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionDisplay;
