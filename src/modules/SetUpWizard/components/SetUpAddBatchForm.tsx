import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import { useAddBatchMutation } from '@/services/setup/setup.hook';
import useGlobalState from '@/store';
import { DatePicker, Form } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useBatchSetup, useUpdateSetupStatus } from '../actions/set-wizard.action';
import UIFormCardV2 from './shared/UIFormCard';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';

export default function SetUpAddBatchForm({ initialData, refetchDetails }: { initialData: any; refetchDetails: any }) {
  // HOOKS
  const [form] = Form.useForm();

  // GLOBAL STATE
  const user = useGlobalState((state) => state.user);
  const setUpData = useGlobalState((state) => state.setUpData);
  const setSetUpData = useGlobalState((state) => state.setSetUpData);
  const step = useGlobalState((state) => state.setUpWizardCurrentStep);
  const setStep = useGlobalState((state) => state.setSetUpWizardCurrentStep);
  const schoolId = useRoleBasedSchoolId();

  // LOCAL STATE
  const [startYear, setStartYear] = useState('');

  // QUERY
  const addBatchMutation = useAddBatchMutation();
  const addSetupBatch = useBatchSetup();

  const updateSetupStatusMutation = useUpdateSetupStatus();

  // EFFECTS
  useEffect(() => {
    if (initialData?.year) {
      setStartYear(dayjs(initialData?.year).format('YYYY'));
      form.setFieldsValue({
        year: dayjs(initialData?.year),
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    let batchPayload: any = {
      start_year: Number(startYear),
      school_id: Number(schoolId),
      is_active: true,
    };

    const response: any = await addSetupBatch.mutateAsync(batchPayload, {
      onSuccess: (data: any) => {
        updateSetupStatusMutation.mutateAsync(
          {
            step: 'CREATE_YEAR',
            data: {
              year: Number(startYear),
              batch_id: Number(data?.id),
            },
          },
          {
            onSuccess: (data: any) => {
              setSetUpData({
                ...setUpData,
                batch: response,
              });
              refetchDetails();
              setStep(2 as number);
            },
          }
        );
      },
    });

    form.resetFields();
  };

  return (
    <>
      <div className="px-4">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <UIFormCardV2 title={'Year Details'} description={``}>
            <CustomFormItem label="Year" name="year" rules={[{ required: true, message: 'Please select the year' }]}>
              <DatePicker
                onChange={(_, value) => {
                  if (typeof value === 'string') {
                    setStartYear(value);
                  }
                }}
                picker="year"
                disabledDate={(current) => current && current.year() < dayjs().year()}
                defaultPickerValue={dayjs()} // Ensures the dropdown starts at the current year
              />
            </CustomFormItem>
          </UIFormCardV2>
        </Form>

        <div className="w-full bg-white border-t p-4">
          <div className=" mx-auto text-right space-x-4">
            <UIFormSubmitButton api={addBatchMutation} onClick={() => form.submit()}>
              Save and Next
            </UIFormSubmitButton>
          </div>
        </div>
      </div>
    </>
  );
}
