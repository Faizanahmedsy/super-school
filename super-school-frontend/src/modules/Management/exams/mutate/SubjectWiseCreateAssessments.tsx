import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import DivisionSelect from '@/components/global/Form/SelectDivision';
import PrivacyNotice from '@/components/global/Notes/PrivacyNotice';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { useSubjectWiseAssessmentCreate } from '@/services/assessments/assessments.hook';
import djangoAxios from '@/services/djangoInstance';
import { useCoverpageDelete } from '@/services/downloadcoverpage/downloadcoverpage.hooks';
import { API, JANGO_PDF_ENDPOINT } from '@/services/endpoints';
import useGlobalState from '@/store';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { DatePicker, Form, Input, message, Modal, Radio, Space, TimePicker, Upload } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentSelectSubject from '../AssessmentSelectSubject/AssessmentSelectSubject';
import SelectDivisionBasedOnSubject from '@/components/global/Form/SelectV2/SelectDivisionBasedOnSubject';

dayjs.extend(utc);
dayjs.extend(timezone);

interface DynamicCardFormProps {
  setStep: (step: number) => void;
  step: number;
}

interface FormValues {
  subjects: {
    subject: string;
    date: any;
    startTime: any;
    endTime: any;
    memo: any;
    questionPaper: any;
    grade_class: number[];
    paper_title: string;
  }[];
}

interface CoverPaperResponse {
  message: string;
  file_path: string;
  file_url: string;
}

const SubjectWiseCreateAssessments: React.FC<DynamicCardFormProps> = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [disabledIndexes, setDisabledIndexes] = useState<number[]>([]);
  const [subjectName, setSubjectName] = useState<string>();
  const [openModel, setOpenModel] = useState(false);
  const [saveandmore, setsaveandmorer] = useState(false);
  const [value, setValue] = useState('');
  const [ordering, setOrdering] = useState('');
  const fileUrl = JANGO_PDF_ENDPOINT;
  const filterData = useGlobalState((state) => state.filterData);
  const [subjectId] = useState([]);
  const { mutate: deleteData } = useCoverpageDelete();
  const [selectedStartTime, setSelectedStartTime] = useState<Dayjs | null>(null);
  const [filterSubjectId, setFilterSubjectId] = useState<any>();
  const [_, checkSetTrue] = useState(false);
  const [modelOpenedOnce, setModelOpenedOnce] = useState(false);
  const [coverPageLoading, setCoverPageLoading] = useState(false);
  const [coverPageError, setCoverPageError] = useState<any>();
  const [subjectIds, setSubjectIds] = useState([]);
  const [removeData, setRemoveData] = useState(false);

  // const {
  //   data: coverpageDownload,
  //   error: coverPageError,
  //   isSuccess: coverPageSuccess,
  //   isLoading: coverPageLoading,
  // } = useDownloadCoverpage({
  //   ordering: checkTrue ? value : false,
  //   assessment_subject_id: Number(subjectId),
  // });

  useEffect(() => {
    if (coverPageLoading) {
      message.loading('Downloading cover page...');
    } else {
      // message.destroy();
    }
  }, [coverPageLoading]);

  // useEffect(() => {
  //   if (coverPageSuccess) {
  //     setOpenModel(true);
  //   }
  // }, [coverPageSuccess]);

  const isFilterApplied = {
    batch: filterData?.batch?.id && filterData?.batch?.id !== 'null' ? true : false,
    grade: filterData?.grade?.id && filterData?.grade?.id !== 'null' ? true : false,
    class: filterData?.class?.id && filterData?.class?.id !== 'null' ? true : false,
    term: filterData?.term?.id && filterData?.term?.id !== 'null' ? true : false,
  };

  const schoolId = useRoleBasedSchoolId();

  const setCurrentStep = useGlobalState((state) => state.setCurrentStep);
  const addSubjectwiseAssessment = useSubjectWiseAssessmentCreate({
    school_id: Number(schoolId),
  });

  const startDate = useGlobalState((state) => state.start_date);

  const endDate = useGlobalState((state) => state.end_date);

  const assessmentId = useGlobalState((state) => state.assessment_id);

  const uploadProps = (allowedTypes: string[]) => ({
    customRequest: (options: any) => {
      const { file, onSuccess, onError } = options;
      setTimeout(() => {
        if (allowedTypes.includes(file.type)) {
          file.url = URL.createObjectURL(file); // Set preview URL
          onSuccess('ok', file);
          displaySuccess(`${file.name} uploaded successfully.`);
        } else {
          onError(new Error('Upload failed'));
          displayError(`${file.name} upload failed. Only ${allowedTypes.join(', ')} files are allowed.`);
        }
      }, 1000);
    },
    beforeUpload: (file: File) => {
      if (!allowedTypes.includes(file.type)) {
        displayError(`${file.name} is not a valid file type. Only ${allowedTypes.join(', ')} files are allowed.`);
        return false;
      }
      return true;
    },
    onPreview: async (file: any) => {
      if (file.url) {
        window.open(file.url, '_blank');
      } else {
        displayError(`Preview not available.`);
      }
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    maxCount: 1,
  });

  const handleFinish = (values: FormValues, saveAndAddMore?: boolean) => {
    setsaveandmorer(saveAndAddMore == true);
    const data = values.subjects.map((subject: any) => {
      const assessment_start_datetime = dayjs(subject.date)
        .hour(subject.startTime.hour())
        .minute(subject.startTime.minute())
        .second(0)
        .millisecond(0)
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

      const assessment_end_datetime = dayjs(subject.date)
        .hour(subject.endTime.hour())
        .minute(subject.endTime.minute())
        .second(0)
        .millisecond(0)
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

      return {
        subject: subject.subject,
        memorandom: subject.memo?.[0]?.originFileObj || null,
        question_paper: subject.questionPaper?.[0]?.originFileObj || null,
        assessment_start_datetime: assessment_start_datetime,
        assessment_end_datetime: assessment_end_datetime,
        grade_class: subject.grade_class,
        paper_title: subject.paper_title ? subject.paper_title : subjectName,
        paper_marks: subject.paper_marks,
      };
    });
    const formData = new FormData();
    formData.append('assessment', String(assessmentId));
    const data1 = data.slice(-1);

    data1.forEach((item: any) => {
      formData.append(`subject`, item.subject);
      if (item.memorandom) {
        formData.append(`memorandom`, item.memorandom);
      }
      if (item.question_paper) {
        formData.append(`question_paper`, item.question_paper);
      }
      formData.append(`assessment_start_datetime`, item.assessment_start_datetime);
      formData.append(`assessment_end_datetime`, item.assessment_end_datetime);
      formData.append('grade_class', item.grade_class);
      formData.append('paper_title', item.paper_title);
      formData.append('paper_marks', item.paper_marks);
    });
    addSubjectwiseAssessment.mutate(formData, {
      onSuccess: async (response: any) => {
        if (response.error) {
          displayError(response.error);
          return;
        }
        const subjectIds = response?.data;
        setSubjectIds(subjectIds);
        setOpenModel(true);

        if (saveAndAddMore) {
          displaySuccess('Data saved successfully. You can add more subjects.');
          // setOpenModel(true);
          const newDisabledIndex = values.subjects.length - 1;
          setDisabledIndexes((prev) => [...prev, newDisabledIndex]);
          setCurrentStep(2);
          // form.resetFields([['subjects', newDisabledIndex]]);
        } else {
          // displaySuccess('AssessmentSubject created successfully.');
        }
      },
      onError: (error: any) => {
        displayError(error.response?.data?.error);
        setOpenModel(false);
        if (error?.response?.data?.errors[0]?.error) {
          displayError(error?.response?.data?.errors[0]?.error);
        } else if (error?.response?.data?.error) {
          displayError(error?.response?.data?.error);
        } else {
          displayError('Something went wrong');
        }
      },
    });
  };

  const disabledDate = (current: dayjs.Dayjs | null) => {
    if (!current) return false;
    return current.isBefore(startDate, 'day') || current.isAfter(endDate, 'day');
  };
  const handleCancel = () => {
    navigate('/assessments/list');
  };

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  const handleDOwnloadCoverPageOnOk = async () => {
    const url = setCoverPageLoading(true);
    if (Array.isArray(subjectIds) && subjectIds.length > 0) {
      try {
        const requests = subjectIds.map((id) => {
          return djangoAxios
            .get(API.DOWNLOAD_COVER_PAGE.GET, {
              params: {
                assessment_subject_id: id,
                ordering: value,
                school_id: schoolId,
              },
            })
            .then((response) => {
              // Handle the response data as needed
              if (response?.data?.file_url) {
                downloadCoverPagePDf(response?.data?.file_url);
              }

              setOpenModel(false);
              if (!saveandmore) {
                navigate('/assessments/list');
                setCurrentStep(1);
              }

              if (response?.data?.response?.data?.error) {
                displayError(response?.data?.response?.data?.error);
              }
            })
            .catch((error) => {
              // Handle the error as needed
              setCoverPageError(error);
              console.error(`Error------------- for ID ${id}:`, error);

              if (error?.response?.data?.error) {
                displayError(error.response?.data?.error);
              } else {
                displayError('An error occurred while sending the request');
              }
            });
        });

        // Wait for all the requests to complete
        await Promise.all(requests);
        // setOpenModel(true);
        // setModelOpenedOnce(true);
        setCoverPageLoading(false);
      } catch (error) {
        setCoverPageLoading(false);
        setCoverPageError(error);
      }
    }
  };

  useEffect(() => {
    if (coverPageError && (coverPageError as any).response) {
      displayError((coverPageError as any).response.data.error);
      if (!saveandmore) {
        navigate('/assessments/list');
        setCurrentStep(1);
      }
    }
  }, [coverPageError]);

  const downloadCoverPagePDf = async (generatedPageData: CoverPaperResponse) => {
    checkSetTrue(true);
    if (generatedPageData) {
      const coverpageurl = `${fileUrl}${generatedPageData}`;

      try {
        // Fetch the PDF file content
        const response = await fetch(coverpageurl);
        if (!response.ok) {
          throw new Error('Failed to fetch the PDF file');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'coverpage.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        if (generatedPageData?.message) {
          displaySuccess(generatedPageData.message);
          subjectId.map((subjectId) => {
            deleteData(subjectId);
          });
        }
      } catch (error) {
        console.error('Error downloading PDF:', error);
        displayError((error as Error).message || 'An error occurred while downloading');
      }
    }
  };

  const validateEndTime = (_: any, value: Dayjs): Promise<void> => {
    const startTime = form.getFieldValue([name, 'startTime']);

    if (!startTime || !value) {
      return Promise.resolve();
    }

    // Check if times are exactly the same
    if (value.isSame(startTime)) {
      return Promise.reject(new Error('End time cannot be the same as start time'));
    }

    // Check if end time is before start time
    if (value.isBefore(startTime)) {
      return Promise.reject(new Error('End time must be after start time'));
    }

    return Promise.resolve();
  };

  const handleStartTimeChange = (time: Dayjs | null): void => {
    setSelectedStartTime(time);
    // Clear end time if it's before or same as the new start time
    const endTime = form.getFieldValue([name, 'endTime']);
    if (time && endTime && (endTime.isBefore(time) || endTime.isSame(time))) {
      form.setFieldValue([name, 'endTime'], null);
    }
  };

  const getDisabledTime = (): {
    disabledHours: () => number[];
    disabledMinutes: (hour: number) => number[];
  } => {
    return {
      disabledHours: () => {
        if (!selectedStartTime) return [];
        const hours: number[] = [];
        for (let i = 0; i < selectedStartTime.hour(); i++) {
          hours.push(i);
        }
        return hours;
      },
      disabledMinutes: (selectedHour: number) => {
        if (!selectedStartTime) return [];

        // If it's the same hour, disable all minutes up to and including the start time's minute
        if (selectedHour === selectedStartTime.hour()) {
          const minutes: number[] = [];
          for (let i = 0; i <= selectedStartTime.minute(); i++) {
            minutes.push(i);
          }
          return minutes;
        }

        return [];
      },
    };
  };
  return (
    <>
      <Form
        form={form}
        name="dynamic_card_form"
        onFinish={handleFinish}
        layout="vertical"
        autoComplete="off"
        initialValues={{ subjects: [{}] }}
        className="p-4"
        onValuesChange={() => {
          if (isFilterApplied.grade) {
            form.setFieldsValue({ grade_class: undefined });
          }
        }}
      >
        <Form.List name="subjects">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <>
                  <Card key={key} title={`Subject ${key + 1}`} className="mb-4 p-8 ">
                    <div>
                      <div className="mb-4 p-8 pb-0 grid md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
                        {fields.length > 1 && !disabledIndexes.includes(index) && (
                          <CloseOutlined
                            onClick={() => {
                              remove(name);
                              setRemoveData(true);
                            }}
                            className="text-red-500 absolute top-4 right-4 cursor-pointer text-lg"
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                          />
                        )}
                        <AssessmentSelectSubject
                          disabled={disabledIndexes.includes(index)}
                          subjectName={[name, 'subject']}
                          onSubjectChange={(selectedSubject) => {
                            setFilterSubjectId(selectedSubject?.subjectId);
                            setSubjectName(selectedSubject?.subjectName);
                          }}
                        />
                        <SelectDivisionBasedOnSubject
                          disabled={disabledIndexes.includes(index)}
                          name={[name, 'grade_class']}
                          filterSubjectId={filterSubjectId}
                          params={{
                            checkStudent: true,
                          }}
                        />
                        {/* <RenderDivisionSelect isFilterApplied={isFilterApplied.class} filterData={filterData} /> */}
                        <CustomFormItem label="Paper Title" name={[name, 'paper_title']}>
                          <Input disabled={disabledIndexes.includes(index)} placeholder="Enter Paper Title" />
                        </CustomFormItem>
                        <CustomFormItem
                          label="Date"
                          name={[name, 'date']}
                          rules={[{ required: true, message: requireMessage('date', 'select') }]}
                        >
                          <DatePicker
                            disabled={disabledIndexes.includes(index)}
                            disabledDate={disabledDate}
                            format={'DD/MM/YYYY'}
                            placeholder="Select Date"
                            className="w-full"
                          />
                        </CustomFormItem>

                        <CustomFormItem
                          {...restField}
                          label="Start Time"
                          name={[name, 'startTime']}
                          rules={[{ required: true, message: requireMessage('start time', 'select') }]}
                        >
                          <TimePicker
                            disabled={disabledIndexes.includes(index)}
                            placeholder="Start Time"
                            format="HH:mm"
                            className="w-full"
                            onChange={handleStartTimeChange}
                            showNow={false}
                          />
                        </CustomFormItem>

                        <CustomFormItem
                          {...restField}
                          label="End Time"
                          name={[name, 'endTime']}
                          rules={[
                            { required: true, message: requireMessage('end time', 'select') },
                            { validator: validateEndTime },
                          ]}
                          dependencies={[[name, 'startTime']]}
                        >
                          <TimePicker
                            disabled={disabledIndexes.includes(index)}
                            placeholder="End Time"
                            format="HH:mm"
                            className="w-full"
                            disabledTime={getDisabledTime}
                            showNow={false}
                          />
                        </CustomFormItem>
                        <CustomFormItem
                          label="Paper Marks"
                          name={[name, 'paper_marks']}
                          rules={[{ required: true, message: requireMessage('paper marks') }]}
                        >
                          <Input
                            min={0}
                            type="number"
                            autoComplete="off"
                            disabled={disabledIndexes.includes(index)}
                            pattern="[0-9]*"
                            placeholder="Enter Paper marks"
                          />
                        </CustomFormItem>
                        <CustomFormItem
                          {...restField}
                          label="Upload Question Paper"
                          name={[name, 'questionPaper']}
                          valuePropName="fileList"
                          getValueFromEvent={(e: any) => (Array.isArray(e) ? e : e?.fileList)}
                          rules={[{ required: true, message: 'Please upload the question paper.' }]}
                        >
                          <Upload
                            disabled={disabledIndexes.includes(index)}
                            accept=".pdf"
                            {...uploadProps(['application/pdf'])}
                            maxCount={1}
                          >
                            <Button type="button" disabled={disabledIndexes.includes(index)}>
                              Upload Question Paper
                            </Button>
                          </Upload>
                        </CustomFormItem>
                        <CustomFormItem
                          {...restField}
                          label="Upload Memo"
                          name={[name, 'memo']}
                          valuePropName="fileList"
                          getValueFromEvent={(e: any) => (Array.isArray(e) ? e : e?.fileList)}
                          rules={[{ required: true, message: 'Please upload the memo.' }]}
                        >
                          <Upload
                            disabled={disabledIndexes.includes(index)} // Ensure `disabledIndexes` and `index` are accurate
                            accept=".pdf"
                            {...uploadProps(['application/pdf'])}
                            maxCount={1}
                          >
                            <Button type="button" disabled={disabledIndexes.includes(index)}>
                              Upload Memo
                            </Button>
                          </Upload>
                        </CustomFormItem>
                      </div>
                      <div className="mb-4 p-8 py-0 gap-4 relative">
                        <PrivacyNotice
                          message={
                            <>
                              <UIText>
                                if the question paper and memo are in one document, they are required to upload it twice
                                in both places.
                              </UIText>
                            </>
                          }
                        />
                      </div>
                    </div>
                  </Card>
                </>
              ))}
              <Form.Item className="mb-4 py-5 grid md:grid-cols-4 relative">
                <div className="flex gap-5">
                  <Button onClick={handleCancel} className="mr-4" type="button" variant={'nsc-secondary'}>
                    Cancel
                  </Button>
                  {/* Save Button */}
                  {!removeData && (
                    <>
                      <UIFormSubmitButton api={addSubjectwiseAssessment} type="submit">
                        <UIText>Save</UIText>
                      </UIFormSubmitButton>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form
                            .validateFields()
                            .then((values) => {
                              handleFinish(values, true);
                              add();
                            })
                            .catch((err) => console.error(err, 'Validation Error'));
                        }}
                        className="gap-2"
                      >
                        <PlusOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                        <UIText>Save & Add More</UIText>
                      </Button>
                    </>
                  )}
                </div>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* <div className="flex justify-end gap-5">
          <Button onClick={handleCancel} className="mr-4" type="button" variant={'nsc-secondary'}>
            Cancel
          </Button>
          <UIFormSubmitButton api={addSubjectwiseAssessment} type="submit">
            Submit
          </UIFormSubmitButton>
        </div> */}
      </Form>
      <Modal
        open={openModel}
        okText="Download Cover Page"
        maskClosable={false}
        onOk={handleDOwnloadCoverPageOnOk}
        onCancel={() => {
          setOpenModel(false);
          if (!saveandmore) {
            navigate('/assessments/list');
            setCurrentStep(1);
          }
        }}
        width={500}
        className="p-0"
        centered={true}
      >
        <div className="p-0">
          <h2 className="text-lg font-semibold mb-4">Download Cover Page</h2>
        </div>

        {/* Form below the buttons */}
        <div className="p-4">
          <Radio.Group onChange={onChange} value={value}>
            <Space direction="vertical">
              <Radio value={''}>Order By Admission Number</Radio>
              <Radio value={'surname'}>Order By Surname</Radio>
            </Space>
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
};

export default SubjectWiseCreateAssessments;
