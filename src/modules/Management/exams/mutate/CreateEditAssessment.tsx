import AppsContainer from '@/app/components/AppsContainer';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UILoader from '@/components/custom/loaders/UILoader';
import MultiStepFormContainerV2 from '@/components/global/Form/MultiStepFormContainerv2';
import BatchSelect from '@/components/global/Form/SelectBatch';
import SelectGrade from '@/components/global/Form/SelectGrade';
import SelectTerm from '@/components/global/Form/SelectTerm';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import {
  useAssessmentCreate,
  useAssessmentGetById,
  useAssessmentUpdate,
} from '@/services/assessments/assessments.hook';
import useGlobalState from '@/store';
import { DatePicker, Form, Input, Select } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubjectWiseCreateAssessments from './SubjectWiseCreateAssessments';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

dayjs.extend(utc);
dayjs.extend(timezone);

const CreateEditAssessment = ({ editMode = false }: { editMode?: boolean }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const params: any = useParams();
  const setStartingDate = useGlobalState((state) => state.setStartDate);
  const setEndingDate = useGlobalState((state) => state.setEndDate);

  // LOCAL STATEs
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);

  // GLOBAL STATEs
  const user = useGlobalState((state) => state.user);
  const setFilterData = useGlobalState((state) => state.setFilterData);
  const filterData = useGlobalState((state) => state.filterData);
  const currentStep = useGlobalState((state) => state.set_step_id);
  const setCurrentStep = useGlobalState((state) => state.setCurrentStep);
  const cur_batch_id = useRoleBasedCurrentBatch();
  const schoolId = useRoleBasedSchoolId();
  const batchId = useRoleBasedCurrentBatch();
  const school_id = useRoleBasedSchoolId();

  // API CALLS
  const addAssessment = useAssessmentCreate({
    school_id: Number(schoolId),
  });
  const updateAssessment = useAssessmentUpdate();
  const { data: getAssessmentById, isLoading } = useAssessmentGetById(params.id);

  // CHECK IF FILTERS ARE APPLIED OR NOT TO SHOW/HIDE SELECT COMPONENTS IN FORM
  const isFilterApplied = {
    batch: filterData?.batch?.id && filterData?.batch?.id !== 'null' ? true : false,
    grade: filterData?.grade?.id && filterData?.grade?.id !== 'null' ? true : false,
    class: filterData?.class?.id && filterData?.class?.id !== 'null' ? true : false,
    term: filterData?.term?.id && filterData?.term?.id !== 'null' ? true : false,
  };

  // SET FORM VALUES IF EDIT MODE IS TRUE
  useEffect(() => {
    if (editMode && getAssessmentById?.results) {
      const data = getAssessmentById?.results;

      // autoFillEditForm(form, getAssessmentById?.results);
      form.setFieldsValue({
        assessment_name: data[0]?.assessment_name,
        assessment_start_datetime: dayjs(data[0]?.assessment_start_datetime),
        assessment_end_datetime: dayjs(data[0]?.assessment_end_datetime),
        status: data[0]?.status,
        batch: data[0]?.batch__start_year,
        term_name: data[0]?.term.toString(),
        grade_class: data[0]?.grade_classes,
        grade_number: data[0]?.grade__grade_number,
      });
    }
  }, [getAssessmentById?.results, form]);

  // GET PAYLOAD VALUE BASED ON FILTERS APPLIED OR FORM VALUES

  function handleSubmit(values: any) {
    setStartingDate(values.assessment_start_datetime);
    setEndingDate(values.assessment_end_datetime);
    const payload: any = {
      assessment_name: values.assessment_name,
      assessment_start_datetime: dayjs(values.assessment_start_datetime?.$d)
        .endOf('day')
        .utc()
        .startOf('day')
        .toISOString(),
      assessment_end_datetime: dayjs(values.assessment_end_datetime?.$d).endOf('day').utc().endOf('day').toISOString(),
      school: Number(schoolId),
      ...(user?.role_name == ROLE_NAME.SUPER_ADMIN && {
        batch: cur_batch_id ? cur_batch_id : undefined,
      }),
      ...(user?.role_name != ROLE_NAME.SUPER_ADMIN && {
        batch: Number(values.batch_id ? values.batch_id : filterData.batch?.id),
      }),

      term: values.term_name ? values.term_name : filterData?.term?.id,
      grade: Number(values.grade_number ? values.grade_number : filterData.grade?.id),
      // grade_class: getPayloadValue('class', 'grade_class', values),
      ...(editMode && { status: values.status }),
    };

    let submitAction = () => {
      if (editMode) {
        // NOTE: WE DONT WANT TO UPDATE GRADE IN EDIT MODE SO WE REMOVE IT FROM PAYLOAD
        delete payload.grade;
        updateAssessment.mutate(
          { id: Number(params?.id), payload },
          {
            onSuccess: (data: any) => {
              displaySuccess(data?.message);
              setCurrentStep(1);
              navigate('/assessments/list');
            },
            onError: (data: any) => {
              displayError(data?.message);
            },
          }
        );
      } else {
        addAssessment.mutate(payload, {
          onSuccess: (data) => {
            console.log('data', data);

            if (data.error) {
              displayError(data.error);
              return;
            }
            displaySuccess(data?.message);
            setCurrentStep(2);
          },
        });
      }
    };

    submitAction();
  }

  const steps = [
    {
      title: (
        <>
          <UIText>Assessment Details</UIText>
        </>
      ),
    },
    {
      title: (
        <>
          <UIText>Subject wise assessment</UIText>
        </>
      ),
    },
  ];

  if (editMode) {
    steps.pop();
  }

  const disabledStartDate: RangePickerProps['disabledDate'] = (current) => {
    const today = dayjs().endOf('day');
    const pastLimit = today.subtract(14, 'days');

    return current && current < pastLimit;
  };

  const disabledEndDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < (startDate ? startDate.startOf('day') : dayjs().startOf('day'));
  };

  const handleCancel = () => {
    navigate('/assessments/list');
  };

  useEffect(() => {
    if (filterData?.batch?.id && filterData?.batch?.id !== 'null') {
      form.setFieldsValue({
        batch_id: filterData?.batch?.id,
      });
    } else {
      form.setFieldsValue({
        batch_id: cur_batch_id ? cur_batch_id : batchId,
      });
    }
  }, [filterData?.batch?.id]);

  const setBatchId = useGlobalState((state) => state.setBatchId);
  const setGradeId = useGlobalState((state) => state.setGradeId);

  useEffect(() => {
    if (isFilterApplied.batch) {
      if (filterData.batch) {
        setBatchId(filterData.batch.id);
      }
    }

    if (isFilterApplied.grade) {
      if (filterData.grade) {
        setGradeId(filterData.grade.id);
      }
    }
  }, [filterData.batch, filterData.grade, isFilterApplied.batch, isFilterApplied.grade, setBatchId, setGradeId]);

  return (
    <>
      <PageTitle
        breadcrumbs={[
          {
            label: 'Assessment List',
            href: '/assessments/list',
            onClick: () => {
              navigate('/assessments/list');
              setFilterData({});
            },
          },
          {
            label: `${editMode ? 'Edit' : 'Create'} Assessment`,
          },
        ]}
      >
        {`${editMode ? 'Edit' : 'Create'} Assessment`}
      </PageTitle>
      <AppsContainer fullView={true} cardStyle={{ padding: '20px' }}>
        <MultiStepFormContainerV2 currentStep={currentStep as number} steps={steps} setCurrentStep={setCurrentStep}>
          {currentStep == 1 && (
            <>
              {isLoading ? (
                <UILoader />
              ) : (
                <>
                  <Form form={form} layout="vertical" className="space-y-5" onFinish={handleSubmit}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <CustomFormItem
                        label="Assessment Name"
                        name="assessment_name"
                        rules={[{ required: true, message: requireMessage('Assessment name') }]}
                      >
                        <Input placeholder="Assessment Name" />
                      </CustomFormItem>
                      <CustomFormItem
                        label="Assessment Start Date"
                        name="assessment_start_datetime"
                        rules={[{ required: true, message: requireMessage('start date', 'select') }]}
                      >
                        <DatePicker
                          disabledDate={disabledStartDate}
                          placeholder="Assessment Start Date"
                          className="w-full"
                          format={'DD/MM/YYYY'}
                          onChange={(date) => setStartDate(date)}
                        />
                      </CustomFormItem>
                      <CustomFormItem
                        label="Assessment End Date"
                        name="assessment_end_datetime"
                        rules={[{ required: true, message: requireMessage('end date', 'select') }]}
                      >
                        <DatePicker
                          disabledDate={disabledEndDate}
                          format={'DD/MM/YYYY'}
                          placeholder="Assessment End Date"
                          className="w-full"
                        />
                      </CustomFormItem>

                      {/* <RenderBatchSelect isFilterApplied={isFilterApplied.batch} filterData={filterData} /> */}

                      <BatchSelect name="batch_id" defaultValue={cur_batch_id} />

                      <RenderGradeSelect
                        isFilterApplied={isFilterApplied.grade}
                        filterData={filterData}
                        editMode={editMode}
                      />

                      {/* <RenderDivisionSelect isFilterApplied={isFilterApplied.class} filterData={filterData} /> */}

                      {/* {!isFilterApplied.term && <SelectTerm name="term_name" />} */}
                      <RenderTermSelect isFilterApplied={isFilterApplied.term} filterData={filterData} />

                      {editMode ? (
                        <Form.Item
                          label="Assessment Status"
                          name="status"
                          rules={[{ required: true, message: 'Please select a status!' }]}
                        >
                          <Select
                            placeholder="Select Status"
                            options={[
                              { label: 'Upcoming', value: 'upcoming' },
                              { label: 'Ongoing', value: 'ongoing' },
                              { label: 'Completed', value: 'completed' },
                              { label: 'Cancelled', value: 'cancelled' },
                            ]}
                          />
                        </Form.Item>
                      ) : null}
                    </div>
                    <div className="w-full bg-white border-t p-4">
                      <div className="text-right space-x-3">
                        <Button onClick={handleCancel} className="mr-4" type="button" variant={'nsc-secondary'}>
                          Cancel
                        </Button>
                        <UIFormSubmitButton api={editMode ? updateAssessment : addAssessment} type="submit">
                          {editMode ? 'Update' : 'Next'}
                        </UIFormSubmitButton>
                      </div>
                    </div>
                  </Form>
                </>
              )}
            </>
          )}
          {currentStep === 2 && <SubjectWiseCreateAssessments setStep={setCurrentStep} step={currentStep} />}
        </MultiStepFormContainerV2>
      </AppsContainer>
    </>
  );
};

export default CreateEditAssessment;

// const RenderDivisionSelect = ({ isFilterApplied, filterData }: { isFilterApplied: boolean; filterData: any }) => {
//   if (isFilterApplied) {
//     return <DivisionSelect name="grade_class" initialValue={[filterData.class.id]} />;
//   }

//   return <DivisionSelect name="grade_class" />;
// };

const RenderTermSelect = ({ isFilterApplied, filterData }: { isFilterApplied: boolean; filterData: any }) => {
  if (isFilterApplied) {
    return <SelectTerm name="term_name" initialValue={filterData.term.id} />;
  }

  return <SelectTerm name="term_name" />;
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
    return <SelectGrade name="grade_number" initialValue={filterData.grade.id} />;
  }

  // NOTE: USER IS NOT ALLOWED TO CHANGE GRADE IN EDIT MODE
  if (editMode) {
    return <SelectGrade name="grade_number" disabled={true} params={{ checkStudent: false }} />;
  }

  return <SelectGrade name="grade_number" params={{ checkStudent: false }} />;
};

// const RenderBatchSelect = ({ isFilterApplied, filterData }: { isFilterApplied: boolean; filterData: any }) => {
//   if (isFilterApplied) {
//     return <BatchSelect name="batch_id" initialValue={filterData.batch.id} />;
//   }

//   return <BatchSelect name="batch_id" />;
// };
