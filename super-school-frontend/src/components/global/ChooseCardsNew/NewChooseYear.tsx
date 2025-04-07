import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBatchList } from '@/services/assessments/assessments.hook';
import { useActivateBatch, useCreateBatch } from '@/services/master/batch/batch.action';
import useGlobalState from '@/store';
import { DatePicker, Form, Modal } from 'antd';
import dayjs from 'dayjs';
import { AlertTriangle, BadgeCheck, CalendarFold } from 'lucide-react';
import { useState } from 'react';
import { UITitlesV3 } from '../Card/UITitlesV3';
import TileLoader from './TileLoader';
import TileNotFound from './TileNotFound';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import UIText from '../Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';

export default function NewChooseYear({
  step,
  setStep,
  allowActions = true,
}: {
  step: number;
  setStep: (step: number) => void;
  allowActions?: boolean;
}) {
  const user = useGlobalState((state) => state.user);
  const schoolId = useRoleBasedSchoolId();

  const setFilterData = useGlobalState((state) => state.setFilterData);
  const filterData = useGlobalState((state) => state.filterData);

  const masterSchool = useGlobalState((state) => state.masterSchool);

  const activateBatchApi = useActivateBatch();

  const getSchoolId = () => {
    if (user?.role_name === ROLE_NAME.SUPER_ADMIN) {
      return masterSchool?.id;
    } else if (schoolId) {
      return schoolId;
    } else {
      return null;
    }
  };

  const {
    data: yearData,
    refetch,
    isPending,
  } = useBatchList({
    school_id: getSchoolId() as number,
    sort: 'asc',
  });

  const createBatchMutation = useCreateBatch();

  const [addModal, setAddModal] = useState(false);
  const [openActiveModal, setOpenActiveModal] = useState(false);
  const [batchId, setBatchId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const handleSubmit = (values: { year: string }) => {
    createBatchMutation.mutate(
      {
        school_id: Number(schoolId),
        start_year: dayjs(values.year).year(),
      },
      {
        onSuccess: () => {
          setAddModal(false);
          form.resetFields();
          refetch();
        },
      }
    );
  };

  const handleActivateBatch = () => {
    if (batchId) {
      activateBatchApi.mutate(
        {
          batch_id: Number(batchId),
        },
        {
          onSuccess: () => {
            setOpenActiveModal(false);
            refetch();
          },
        }
      );
    }
  };

  const renderFooter = (batch: any) => {
    if (!allowActions) {
      return <TileFooterWithoutAction batch={batch} />;
    }

    return (
      <>
        {batch.showActivateBtn && (
          <div
            className="text-nowrap px-2 text-[10px] rounded-full bg-white/40 hover:bg-white/80 transition-colors duration-300 w-fit text-black flex justify-center items-center gap-1 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setBatchId(batch.id);
              setOpenActiveModal(true);
            }}
          >
            <BadgeCheck size={14} />
            Activate it
          </div>
        )}
        {batch.is_active && (
          <div className="text-nowrap px-2 text-[10px] rounded-full bg-white/80 hover:bg-white/80 transition-colors duration-300 w-fit text-black">
            <UIText>Active year</UIText>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="w-full p-1">
        <Card className="w-full">
          <CardHeader className="relative z-10">
            <CardTitle className="flex justify-between items-center">
              <div>
                <UIText>Select a Year</UIText>
              </div>
              <div className="flex justify-center items-center gap-4">
                {allowActions && (
                  <Button size="sm" onClick={() => setAddModal(true)}>
                    <UIText>Create Year</UIText>
                  </Button>
                )}
              </div>
            </CardTitle>
            <CardDescription>Select a year to explore the associated data and insights.</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {yearData?.list
                ?.slice() // Create a copy to avoid mutating the original data
                .sort(
                  (
                    a: {
                      start_year: number;
                    },
                    b: {
                      start_year: number;
                    }
                  ) => b.start_year - a.start_year
                ) // Sort years in descending order
                .map((batch: any, index: any, sortedList: any) => {
                  // Find the active year in the sorted list
                  const activeIndex = sortedList.findIndex((item: { is_active: boolean }) => item.is_active);

                  // Add showActivateBtn to years after the active year
                  const showActivateBtn = activeIndex >= 0 && index < activeIndex;

                  return { ...batch, showActivateBtn };
                })
                ?.map(
                  (
                    batch: {
                      id: number;
                      start_year: number;
                      is_active: boolean;
                      showActivateBtn: boolean;
                    },
                    index: number
                  ) => (
                    <UITitlesV3
                      key={index}
                      title={String(batch.start_year)} // Use dynamic title from data
                      onClick={() => {
                        setFilterData({
                          ...filterData,
                          batch: {
                            id: String(batch.id),
                            name: batch.start_year.toString(),
                          },
                        });
                        setStep(step + 1);
                      }}
                      active={batch.is_active} // Pass active prop from data
                      footer={renderFooter(batch)}
                    />
                  )
                )}{' '}
              {yearData?.list?.length === 0 && (
                <>
                  <TileNotFound title="year" />
                </>
              )}
              {isPending && <TileLoader />}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={addModal}
        onCancel={() => setAddModal(false)}
        title={
          <>
            <UIText>Add Year</UIText>
          </>
        }
        okButtonProps={{
          loading: createBatchMutation.isPending,
        }}
        centered
        onOk={() => {
          form.submit();
        }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <CustomFormItem
            label="Select Year"
            name="year"
            rules={[{ required: true, message: requireMessage('year', 'select') }]}
            className="w-full"
          >
            <DatePicker
              picker="year"
              className="w-full"
              disabledDate={(current) => current && current.year() - 1 < dayjs().year()}
              defaultPickerValue={dayjs()} // Ensures the dropdown starts at the current year
            />
          </CustomFormItem>
        </Form>
      </Modal>

      <Modal
        open={openActiveModal}
        onCancel={() => setOpenActiveModal(false)}
        title="Activate Year"
        centered
        okButtonProps={{
          loading: activateBatchApi.isPending,
        }}
        okText="Activate this year"
        onOk={() => handleActivateBatch()}
      >
        <div className="space-y-2 mt-[30px]">
          {/* Warning Icon and Main Message */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
              <CalendarFold className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-gray-900">Are you sure you want to activate this year?</p>
          </div>

          {/* Warning Box */}
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="mb-2">
                If you choose to activate this year, the following data will be copied to your new active year:
              </p>
              <ul className="ml-4 space-y-1 list-disc">
                <li>All teacher records</li>
                <li>All grade records</li>
                <li>All subject records</li>
                <li>All term records</li>

                <li>All class records</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

const TileFooterWithoutAction = ({
  batch,
}: {
  batch: {
    id: number;
    start_year: number;
    is_active: boolean;
    showActivateBtn: boolean;
  };
}) => {
  return (
    <>
      <>
        {batch.is_active && (
          <div className="px-2 text-[10px] rounded-full bg-white/80 hover:bg-white/80 transition-colors duration-300 w-fit text-black">
            <UIText>Currently Active Year</UIText>
          </div>
        )}
      </>
    </>
  );
};
