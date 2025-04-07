import UIPrimaryButton from '@/components/custom/buttons/UIPrimaryButton';
import UILoader from '@/components/custom/loaders/UILoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useManualReviewData, useUpdateManualReviewData } from '@/services/manualReview/manualReview.action';
import { Form, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MarkedAnswerSheetPdf from '../MarkedAnswerSheet/MarkedAnswerSheetPdf';
import { ManualReviewItem } from './ManualReview.types';
import QuestionDisplay from './QuestionDisplay';
import UIText from '@/components/global/Text/UIText';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import RedCircle from '@/components/global/circle';

interface OCRScannedDataTabContentProps {
  form: any;
  assessment_id: number;
  grade_class_id: number;
  studentDetails?: any;
  refetchData?: any;
}

interface FormValues {
  [key: string]: unknown;
}

export default function OCRScannedDataTabContent({
  form,
  assessment_id,
  grade_class_id,
  studentDetails,
  refetchData,
}: OCRScannedDataTabContentProps) {
  const [openPreviewModal, setOpenPreviewModal] = useState<boolean>(false);
  const [value, setValue] = useState<any>(null);
  const [isLocked, setLocked] = useState(false);
  const params: any = useParams<any>();

  useEffect(() => {
    setValue('question_number');
  }, []);

  const {
    data: apiData,
    isSuccess,
    isPending,
    isError,
    refetch,
  } = useManualReviewData({ order_by: value }, params?.id);

  useEffect(() => {
    if (apiData && Array.isArray(apiData)) {
      const isOcrStatus = apiData.some((item: any) => 'is_reviewed' in item && item.is_reviewed === true);
      setLocked(isOcrStatus);
    }
  }, [apiData]);

  const data: any = apiData || [];

  const { mutate } = useUpdateManualReviewData();

  useEffect(() => {
    if (isSuccess && data) {
      const initialValues = {
        ...data.reduce(
          (acc: any, item: any, index: number) => ({
            ...acc,
            [`answer-${index}`]: item.answer,
            [`marks-${item.id}`]: item.obtained_mark,
          }),
          {}
        ),
      };

      form.setFieldsValue(initialValues);
    }
  }, [form, data, isSuccess]);

  const handleSubmit = (values: FormValues) => {
    // Filter the answers to include only those where marks or teacherComment are defined
    const formattedAnswers = data
      ?.map((item: ManualReviewItem) => {
        // const obtained_marks = values[`marks-${item.id}`];
        const teacher_comment = values[`comment-${item.id}`];

        // Only include items where both marks and teacherComment are defined
        if (teacher_comment !== undefined) {
          return {
            id: item.id,

            teacher_comment,
          };
        }

        // Return undefined for entries with no data, which can be filtered later
        return null;
      })
      .filter(Boolean); // .filter(Boolean) removes null or undefined entries

    mutate({ id: Number(params.id), payload: formattedAnswers });
  };

  const handleChange = (newValue: any) => {
    setValue(newValue);
  };

  return (
    <>
      <Card className="w-1/2 h-full rounded-s-none rounded-t-none">
        <CardHeader>
          <CardTitle>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              {/* Title */}
              {/* <UIText className="w-full sm:w-auto">Scanned Data</UIText> */}

              {/* Order By Section */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="mb-0">
                  <UIText>Order By:</UIText>
                </label>
                <Select
                  value={value}
                  onChange={handleChange}
                  style={{ width: 200 }}
                  defaultValue={value}
                  placeholder="Select Order"
                  className="w-full sm:w-auto"
                  options={[
                    {
                      value: 'obtained_mark',
                      label: <UIText>Obtained marks low to high</UIText>,
                    },
                    {
                      value: '-obtained_mark',
                      label: <UIText>Obtained marks high to low</UIText>,
                    },
                    {
                      value: 'question_number',
                      label: <UIText>Question Number Order</UIText>,
                    },
                    {
                      value: 'not_detected_word_count',
                      label: <UIText>Answers Not Detected</UIText>,
                    },
                  ]}
                />
              </div>

              {/* Button Section */}
              <div className="space-x-2 w-full sm:w-auto flex justify-end">
                <UIPrimaryButton
                  variant="outline"
                  onClick={() => {
                    setValue('question_number');
                    setOpenPreviewModal(true);
                  }}
                >
                  {isLocked ? 'Preview Result' : 'Preview'}
                </UIPrimaryButton>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            <UIText>Questions highlighted in red require careful manual review. Please verify them thoroughly.</UIText>
          </CardDescription>
          <div className="flex justify-start gap-2 pb-3">
            <RedCircle size={20} color="#FAE2E2" />
            Zero Marks
            <RedCircle size={20} color="#FCF9C3" />
            Partial Marks
          </div>
        </CardHeader>

        <CardContent className="px-5 w-full">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="max-h-[70vh] overflow-y-auto scroll-area w-full overflow-x-hidden">
              {isPending && <UILoader />}
              {isError && (
                <div>
                  <UIText>Error fetching data</UIText>
                </div>
              )}
              {data &&
                data.map((item: ManualReviewItem) => (
                  <QuestionDisplay
                    data={item}
                    studentDetails={studentDetails}
                    isLocked={isLocked}
                    refetch={refetch}
                    refetchData={refetchData}
                  />
                ))}
            </div>
          </Form>
        </CardContent>
      </Card>

      <Modal
        open={openPreviewModal}
        onCancel={() => setOpenPreviewModal(false)}
        title={
          <>
            <UIText>Preview Marked Answer Sheet</UIText>
          </>
        }
        footer={null}
        width={1200}
        maskClosable={false}
      >
        <MarkedAnswerSheetPdf
          assessment_id={assessment_id}
          grade_class_id={grade_class_id}
          data={data}
          setOpenPreviewModal={setOpenPreviewModal}
          isLocked={isLocked}
          refetch={refetch}
          isPending={isPending}
        />
      </Modal>
    </>
  );
}
