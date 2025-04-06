import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { useAddExamMutation, useGetDataByIdExam, useUpdateExam } from '@/services/management/exams/exams.hook';
import { useQueryClient } from '@tanstack/react-query';
import { Card, DatePicker, Form, Input, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react'; // Import useEffect
import { useLocation } from 'react-router-dom';

export default function AddExam({ editMode = false }: { editMode?: boolean }) {
  const addExam = useAddExamMutation();
  const [form] = Form.useForm();

  const location = useLocation();
  const id: any = location.pathname.split('/').pop();
  const [payload, setPayload] = useState<any>({});
  const [updateId, setUpdateId] = useState<any>(id);

  const queryclient = useQueryClient();

  const { data = {} } = useGetDataByIdExam(id);

  const { mutate: editExamdata } = useUpdateExam(updateId, payload, queryclient);

  useEffect(() => {
    if (data.id) {
      form.setFieldsValue({
        exam_name: data.exam_name,
        total_students: data.total_students,
        batch_id: data.id,
        status: data.status,
        start_date: dayjs(data.start_date),
        end_date: dayjs(data.end_date),
        start_time: dayjs(data.start_time, 'HH:mm'),
        end_time: dayjs(data.end_time, 'HH:mm'),
      });
    }
  }, [data, form]);

  const handleSubmit = (values: any) => {
    const payload = {
      exam_name: values.exam_name,
      total_students: Number(values.total_students),
      batch_id: Number(values.batch_id),
      status: values.status,
      start_date: dayjs(values.start_date).format('YYYY-MM-DD'),
      end_date: dayjs(values.end_date).format('YYYY-MM-DD'),
      start_time: dayjs(values.start_time).format('HH:mm'),
      end_time: dayjs(values.end_time).format('HH:mm'),
    };

    addExam.mutate(payload);
  };

  const handleEdit = (values: any) => {
    const payload: any = {
      exam_name: values.exam_name,
      total_students: Number(values.total_students),
      batch_id: Number(values.batch_id),
      status: values.status,
      start_date: dayjs(values.start_date).format('YYYY-MM-DD'),
      end_date: dayjs(values.end_date).format('YYYY-MM-DD'),
      start_time: dayjs(values.start_time).format('HH:mm'),
      end_time: dayjs(values.end_time).format('HH:mm'),
    };
    setUpdateId(values.batch_id);
    setPayload(payload);
    editExamdata();
  };

  const validateDates = (_: any) => {
    const { start_date, end_date } = form.getFieldsValue();
    if (start_date && end_date && dayjs(end_date).isBefore(dayjs(start_date))) {
      return Promise.reject(new Error('End date must be after start date'));
    }
    return Promise.resolve();
  };

  const validateTimes = (_: any) => {
    const { start_time, end_time, start_date, end_date } = form.getFieldsValue();
    if (
      start_time &&
      end_time &&
      dayjs(end_time, 'HH:mm').isBefore(dayjs(start_time, 'HH:mm')) &&
      dayjs(start_date).isSame(dayjs(end_date))
    ) {
      return Promise.reject(new Error('End time must be after start time'));
    }
    return Promise.resolve();
  };

  const validateNumber = (_: any, value: any) => {
    if (!Number.isInteger(Number(value))) {
      return Promise.reject(new Error('Value must be a number'));
    }
    return Promise.resolve();
  };

  return (
    <>
      <PageTitle
        extraItem={
          <Button
            className=""
            variant="cust_01"
            onClick={form.submit}
            type="submit"
            // htmlType="submit"
            // loading={addExam.isPending}
          >
            {`${editMode ? 'Submit Edit Details' : 'Create Assessment Details'}`}
            {/* {editMode == "edit" ? "Submit Edit Details" : "Create Exam Details"} */}
          </Button>
        }
      >
        {`${editMode ? 'Edit' : 'Create'} Exam`}
      </PageTitle>

      <Form onFinish={editMode ? handleEdit : handleSubmit} layout="vertical" form={form}>
        <div className="flex gap-4">
          <Card className="w-4/6 bg-slate-200 rounded-lg ">
            <p className="text-xl font-bold text-slate-600 mb-5">General Info</p>
            <div className="grid md:grid-cols-2 gap-4">
              <Form.Item
                name={'exam_name'}
                label="Exam Name"
                className="w-full"
                rules={[{ required: true, message: 'Please enter exam name' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={'total_students'}
                label="Total Students"
                className="w-full"
                rules={[{ required: true, message: 'Please enter total students' }, { validator: validateNumber }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={'batch_id'}
                label="Year"
                className="w-full"
                rules={[{ required: true, message: 'Please enter batch id' }, { validator: validateNumber }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name={'status'} label="Status" className="w-full">
                <Input />
              </Form.Item>
            </div>
          </Card>
          <Card className="w-2/6 bg-slate-200 rounded-lg">
            <p className="text-xl font-bold text-slate-600 mb-5">Date and Timings</p>
            <div className="grid md:grid-cols-2 gap-4">
              <Form.Item
                name={'start_date'}
                label="Start Date"
                className="w-full"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item
                name={'end_date'}
                label="End Date"
                className="w-full"
                rules={[{ required: true, message: 'Please select a date' }, { validator: validateDates }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item
                name={'start_time'}
                label="Start Time"
                className="w-full"
                rules={[{ required: true, message: 'Please select a start time' }, { validator: validateTimes }]}
              >
                <TimePicker className="w-full" showSecond={false} />
              </Form.Item>

              <Form.Item
                name={'end_time'}
                label="End Time"
                className="w-full"
                rules={[{ required: true, message: 'Please select an end time' }, { validator: validateTimes }]}
              >
                <TimePicker className="w-full" showSecond={false} />
              </Form.Item>
            </div>
          </Card>
        </div>
      </Form>
    </>
  );
}
