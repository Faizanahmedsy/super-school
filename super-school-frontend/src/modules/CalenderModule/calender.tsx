import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import UIPrimaryButton from '@/components/custom/buttons/UIPrimaryButton';
import UILoader from '@/components/custom/loaders/UILoader';
import DivisionSelect from '@/components/global/Form/SelectDivision';
import SelectGrade from '@/components/global/Form/SelectGrade';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { cn } from '@/lib/utils';
import {
  useAddEventhook,
  useEventDeleteById,
  useEventGetDataById,
  useEventList,
  useUpdateEvent,
} from '@/services/calendar/calendar.hook';
import useGlobalState from '@/store';
import { useQueryClient } from '@tanstack/react-query';
import { ColorPicker, DatePicker, Form, Input, Modal, Radio, TimePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import enUS from 'antd/lib/calendar/locale/en_US';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { RiDeleteBin6Line } from 'react-icons/ri';
import './calender.css';
import { CustomToolbar } from './customToolbar';
import { useExamtimetableDetailsGetById } from '@/services/examtimetable/examtimetable.hook';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UIFormItemSelect from '@/components/global/Form/v4/UIFormItem';
import UIText from '@/components/global/Text/UIText';
import { borderRightStyle } from 'html2canvas/dist/types/css/property-descriptors/border-style';
import { getItem } from '@/lib/localstorage';
import RedCircle from '@/components/global/circle';

interface Events {
  id: number;
  school_id: number;
  type: string | undefined | any;
  title: string;
  class_id: number | string | undefined;
  start: Date;
  end: Date;
  start_time: string;
  end_time: string;
  description?: string;
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calender = () => {
  const school_id = useRoleBasedSchoolId();
  const [updateId, setUpdateId] = useState<any>();
  const [detailsId, setDetailsId] = useState<any>();
  const [examdetailsId, setExamDetailsId] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const queryclient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const [createId, setCreateId] = useState<number | undefined>();
  const [selectedStartTime, setSelectedStartTime] = useState<Dayjs | null>(null);
  const [type, setType] = useState('school');
  const [maintype, setmainType] = useState('school');
  const [form] = Form.useForm();

  const schoolLevelColor = '#FFFBCC';
  const gradeLevelColor = '#CCF2FF';
  const classLevelColor = '#DFFFD6';
  const examTimetableColor = '#88E788';
  const self = '#C8A2C8';

  const addEvent = useAddEventhook();
  const editEventData = useUpdateEvent(updateId, queryclient);
  const { data: getDataById, isLoading } = useEventGetDataById(detailsId);
  const { data: getExamdatabyid, isLoading: examLoding } = useExamtimetableDetailsGetById(examdetailsId);
  const { mutate: deleteEvent } = useEventDeleteById(deleteId!, queryclient);
  const user = useGlobalState((state: any) => state.user);
  const setGradeId = useGlobalState((state) => state.setGradeId);
  const [calendarView, setCalendarView] = useState(getItem('calendar-view'));

  const isCreateEvent =
    user.role_name !== ROLE_NAME.SUPER_ADMIN &&
    user.role_name !== ROLE_NAME.ADMIN &&
    user.role_name !== ROLE_NAME.TEACHER &&
    user.role_name !== ROLE_NAME.STUDENT;

  let eventListProps = {};
  if (user?.role_name === ROLE_NAME.SUPER_ADMIN) {
    eventListProps = {
      school_id: school_id,
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCalendarView(getItem('calendar-view'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const eventListQuery = useEventList(eventListProps);
  const transformedData = eventListQuery?.data?.map((event: any) => {
    // Get time components from start_date and end_date
    const startDateTime = dayjs(event?.start_date);
    const endDateTime = dayjs(event?.end_date);

    let title = '';
    if (calendarView == 'month' || calendarView == 'day' || calendarView == 'week') {
      title = event?.event_outside;
    } else {
      title = event?.event_name;
    }

    return {
      id: event?.id,
      school_id: event?.school_id ? Number(event?.school_id) : null,
      type: event?.type,
      title: title,
      start: startDateTime.toDate(),
      end: endDateTime.toDate(),
      start_time: event?.start_time,
      end_time: event?.end_time,
      description: event?.description,
    };
  });

  useEffect(() => {
    if (getDataById) {
      setCreateId(getDataById?.created_by);
      setType(getDataById?.type);
      setmainType(getDataById?.type);
      form.setFieldsValue({
        ...getDataById,
        title: getDataById?.event_name,
        start_date: dayjs(getDataById?.start_date),
        end_date: dayjs(getDataById?.end_date),
        start_time: dayjs(getDataById?.start_time, 'HH:mm'),
        end_time: dayjs(getDataById?.end_time, 'HH:mm'),
        description: getDataById?.description,
        class_id: getDataById?.division?.name,
        grade_id: getDataById?.grade_id,
        grade_number: getDataById?.grade_id,
      });
    }
  }, [getDataById, form]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isModalOpen) {
      setEditMode(false);
      setStartDate(null);
      setSelectedStartTime(null);
    }
    form.setFieldsValue({ type: 'school' });
  }, [isModalOpen, form]);

  const handleCreate = () => {
    setEditMode(false);
    setType('create');
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setmainType('school');
  };

  const handleFormSubmit = (values: any) => {
    const payload: any = {
      school_id: Number(school_id),
      type: user.role_name == ROLE_NAME.STUDENT ? 'student' : maintype,
      event_name: values.title,
      grade_id: maintype === 'grade' ? values.grade_number : maintype === 'class' ? [values.grade_id] : undefined,
      class_id: maintype === 'class' ? values.class_id : undefined,
      // start_date: values.start_date,
      // end_date: values.end_date,
      start_date: dayjs(values.start_date?.$d).endOf('day').utc().startOf('day').toISOString(),
      end_date: dayjs(values.end_date?.$d).endOf('day').utc().startOf('day').toISOString(),
      start_time: dayjs(values.start_time).format('HH:mm'),
      end_time: dayjs(values.end_time).format('HH:mm'),
      description: values.description,
    };

    // Updating the payload with the specified structure
    const updatedPayload: any = {
      event_name: payload.event_name,
      description: payload.description,
      start_date: payload.start_date,
      end_date: payload.end_date,
      start_time: dayjs(values.start_time).format('HH:mm'),
      end_time: dayjs(values.end_time).format('HH:mm'),
    };

    if (isEditMode) {
      editEventData.mutate(updatedPayload as Events as any, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
        onError: () => setIsModalOpen(true),
      });
    } else {
      addEvent.mutate(payload as Events as any, {
        onSuccess: () => {
          setIsModalOpen(false);
          eventListQuery.refetch();
        },
        onError: () => setIsModalOpen(true),
      });
    }
    setStartDate(null);
    setEndDate(null);
  };

  const handleEventSelect = (event: Events) => {
    if (event?.type == 'Exam') {
      setExamDetailsId(event.id);
      setType('Exam');
      setEditMode(false);
      setUpdateId(null);
      setDetailsId(null);
      setCreateId(undefined);
    } else {
      setDetailsId(event?.id);
      setUpdateId(event?.id);
      setEditMode(true);
    }
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (eventId: number) => {
    setDeleteId(eventId);
    Modal.confirm({
      centered: true,
      title: 'Are you sure you want to delete this event?',
      onOk: () => {
        deleteEvent();
        setIsModalOpen(false);
      },
    });
  };
  const disabledStartDate: RangePickerProps['disabledDate'] = (current: any) => {
    if (endDate) {
      return current && (current < dayjs().startOf('day') || current > endDate.startOf('day'));
    }
    return current && current < dayjs().startOf('day');
  };

  const disabledEndDate: RangePickerProps['disabledDate'] = (current: any) => {
    if (startDate) {
      return current && current < startDate.startOf('day');
    }
    return current && current < dayjs().startOf('day');
  };

  const validateEndTime = (_: any, value: Dayjs): Promise<void> => {
    const startTime = form.getFieldValue('start_time');

    if (!startTime || !value) {
      return Promise.resolve();
    }

    if (value.isSame(startTime)) {
      return Promise.reject(new Error('End time cannot be the same as start time'));
    }

    if (value.isBefore(startTime)) {
      return Promise.reject(new Error('End time must be after start time'));
    }

    return Promise.resolve();
  };

  const handleStartTimeChange = (time: Dayjs | null): void => {
    setSelectedStartTime(time);
    const endTime = form.getFieldValue('end_time');
    if (time && endTime && (endTime.isBefore(time) || endTime.isSame(time))) {
      form.setFieldValue(['end_time'], null);
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

  const events = transformedData?.map((event: any) => {
    // Calculate start and end date-time
    const startDate = dayjs(event?.start)
      .startOf('day')
      .add(dayjs(event.start_time, 'HH:mm').hour(), 'hour')
      .add(dayjs(event.start_time, 'HH:mm').minute(), 'minute');
    const endDate = dayjs(event.end)
      .startOf('day')
      .add(dayjs(event.end_time, 'HH:mm').hour(), 'hour')
      .add(dayjs(event.end_time, 'HH:mm').minute(), 'minute');

    return {
      ...event,
      start: startDate.toDate(),
      end: endDate.toDate(),
    };
  });

  const formats = {
    timelineHeaderFormat: (date: any) => {
      const start = format(date.start, 'dd/MM/yyyy');
      const end = format(date.end, 'dd/MM/yyyy');
      return `${start} – ${end}`;
    },
    timelineDateFormat: (date: any) => {
      return format(date, 'EEE MMM dd');
    },
    dayRangeHeaderFormat: ({ start, end }: any) => {
      const startStr = format(start, 'dd/MM/yyyy');
      const endStr = format(end, 'dd/MM/yyyy');
      return `${startStr} – ${endStr}`;
    },
  };

  const handleOk = () => {
    setmainType('school'); // Set the value
  };

  const title =
    user?.id != createId && (type === 'Exam' || type === 'grade' || type === 'class' || type === 'school')
      ? isEditMode == false
        ? 'Exam Details'
        : 'Event Details'
      : isEditMode
        ? 'Edit Event Details'
        : 'Create Event';

  return (
    <div>
      <AppPageMeta title="Admin List" />
      <PageTitle
        extraItem={
          <>
            {!isCreateEvent && (
              <UIPrimaryButton
                disabled={isCreateEvent}
                onClick={() => {
                  handleCreate();
                  form.resetFields();
                }}
              >
                Create Event
              </UIPrimaryButton>
            )}
          </>
        }
      >
        Event Timetable
      </PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom" cardStyle={{ paddingBottom: '50px' }}>
        <div style={{ height: '800px', padding: '30px' }}>
          <div className="mb-5 flex items-center flex-wrap">
            <div className="mb-5 mx-3 flex items-center">
              <RedCircle color={schoolLevelColor} size={25} />
              <label className="mx-1">
                <UIText>School Level</UIText>
              </label>
            </div>
            <div className="mb-5 mx-3 flex items-center">
              <RedCircle color={gradeLevelColor} size={25} />
              <label className="mx-1">
                <UIText>Grade Level</UIText>{' '}
              </label>
            </div>
            <div className="mb-5 mx-3 flex items-center">
              <RedCircle color={classLevelColor} size={25} />
              <label className="mx-1">
                <UIText>Class Level</UIText>
              </label>
            </div>
            <div className="mb-5 mx-3 flex items-center">
              <RedCircle color={examTimetableColor} size={25} />
              <label className="mx-1">
                <UIText>ExamTimetable</UIText>
              </label>
            </div>
            {user.role_name == ROLE_NAME.STUDENT && (
              <div className="mb-5 mx-3 flex items-center">
                <RedCircle color={self} size={25} />
                <label className="mx-1">
                  <UIText>Self</UIText>
                </label>
              </div>
            )}
          </div>
          <Calendar
            style={{ height: '100vh', maxHeight: '100%', overflowY: 'auto' }}
            events={events}
            className="examTimetable"
            startAccessor="start"
            endAccessor="end"
            defaultDate={dayjs().toDate()}
            formats={formats}
            localizer={localizer}
            components={{
              toolbar: CustomToolbar,
            }}
            onSelectEvent={handleEventSelect}
            eventPropGetter={(event) => {
              // const startDate = dayjs(event.start);
              // const endDate = dayjs(event.end);

              let backgroundColor = 'green';
              let color = '#000';
              let borderRight = '5px solid green';
              let borderLeft = 'none';

              switch (event?.type) {
                case 'school':
                  backgroundColor = '#FFFBCC';
                  borderRight = '5px solid #D5B60A';
                  color = '#000';
                  break;
                case 'grade':
                  backgroundColor = '#CCF2FF';
                  borderRight = '5px solid skyblue';
                  break;
                case 'class':
                  backgroundColor = '#DFFFD6';
                  borderRight = '5px solid #32CD32';
                  break;
                case 'Exam':
                  backgroundColor = '#88E788';
                  borderRight = '5px solid green';
                  break;
                default:
                  backgroundColor = '#C8A2C8';
                  borderRight = '5px solid #6A506A';
              }

              const border = calendarView == 'agenda' ? borderLeft : borderRight;
              // if (startDate.isBefore(dayjs(), 'day') && endDate.isAfter(dayjs(), 'day')) {
              //   backgroundColor = 'green';
              // } else if (startDate.isSame(endDate, 'day')) {
              //   backgroundColor = 'green';
              // } else {
              //   backgroundColor = 'green';
              // }

              return {
                style: {
                  backgroundColor: backgroundColor,
                  color: color,
                  borderLeft: border,
                  borderRadius: '0 5px 5px 0',
                  marginBottom: '2px',
                },
              };
            }}
          />
        </div>
      </AppsContainer>
      <Modal
        title={<UIText>{title}</UIText>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        maskClosable={false}
        width={800}
        centered={true}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          {isLoading || examLoding ? (
            <div className="min-h-[200px] flex justify-center items-center">
              <UILoader />
            </div>
          ) : user?.id != createId && (type === 'Exam' || type === 'grade' || type === 'class' || type === 'school') ? (
            // Render details view when user is not the creator
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user?.id != createId && isEditMode == false && type == 'Exam' ? (
                <>
                  <div>
                    <strong>Type:</strong> Exam
                  </div>
                  <div>
                    <strong>Exam Name:</strong> {getExamdatabyid?.assessment_name || 'N/A'}
                  </div>
                  <div>
                    <strong>Subject Name:</strong> {getExamdatabyid?.subject?.master_subject?.subject_name || 'N/A'}
                  </div>
                  <div>
                    <strong>Subject Code:</strong> {getExamdatabyid?.subject?.master_subject?.subject_code || 'N/A'}
                  </div>
                  <div>
                    <strong>Term:</strong> {getExamdatabyid?.term?.term_name || 'N/A'}
                  </div>
                  <div>
                    <strong>Grade:</strong> {getExamdatabyid?.grade?.grade_number || 'N/A'}
                  </div>
                  <div>
                    <strong>Class:</strong> {getExamdatabyid?.division?.name || 'N/A'}
                  </div>
                  <div>
                    <strong>Exam Start Date:</strong>{' '}
                    <span>{dayjs(getExamdatabyid?.start_date).format('DD-MM-YYYY')}</span>
                  </div>
                  <div>
                    <strong>Exam End Date:</strong> <span>{dayjs(getExamdatabyid?.end_date).format('DD-MM-YYYY')}</span>
                  </div>
                  <div>
                    <strong>Start Time:</strong> {getExamdatabyid?.start_time || 'N/A'}
                  </div>
                  <div>
                    <strong>End Time:</strong> {getExamdatabyid?.end_time || 'N/A'}
                  </div>
                  <div>
                    <strong>Paper Title:</strong> {getExamdatabyid?.paper_title || 'N/A'}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong>Type:</strong> {getDataById?.type || 'N/A'}
                  </div>
                  {(getDataById?.type == 'grade' || getDataById?.type == 'class') && (
                    <>
                      <div>
                        <strong>Grade:</strong> {getDataById?.grade?.grade_number || 'N/A'}
                      </div>
                      {getDataById?.type !== 'grade' && (
                        <div>
                          <strong>Class:</strong> {getDataById?.division?.name || 'N/A'}
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <strong>Event Title:</strong> {getDataById?.event_name || 'N/A'}
                  </div>
                  <div>
                    <strong>Event Start Date:</strong>{' '}
                    <span>{dayjs(getDataById?.start_date).format('DD-MM-YYYY')}</span>
                  </div>
                  <div>
                    <strong>Event End Date:</strong> <span>{dayjs(getDataById?.end_date).format('DD-MM-YYYY')}</span>
                  </div>
                  <div>
                    <strong>Start Time:</strong> {getDataById?.start_time || 'N/A'}
                  </div>
                  <div>
                    <strong>End Time:</strong> {getDataById?.end_time || 'N/A'}
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong>Description:</strong> {getDataById?.description || 'N/A'}
                  </div>
                </>
              )}
            </div>
          ) : (
            // Render the form when user is the creator
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isEditMode && user.role_name !== ROLE_NAME.STUDENT && (
                <>
                  <CustomFormItem
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: 'Please select a type!' }]}
                    style={{ gridColumn: 'span 2' }}
                  >
                    <Radio.Group
                      onChange={(e: any) => {
                        setmainType(e.target.value);
                        form.setFieldsValue({
                          grade_id: undefined,
                          class_id: undefined,
                          grade_number: undefined,
                          start_date: undefined,
                          end_date: undefined,
                        });
                        setGradeId(null);
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      value={maintype}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          textAlign: 'center',
                          marginRight: '25px',
                          alignItems: 'center ',
                        }}
                      >
                        <Radio value="school">{<UIText>School Level</UIText>}</Radio>
                        <div>
                          <RedCircle color={schoolLevelColor} size={25} />
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          textAlign: 'center',
                          marginRight: '25px',
                          alignItems: 'center ',
                        }}
                      >
                        <Radio value="grade">{<UIText>Grade Level</UIText>}</Radio>
                        <div>
                          <RedCircle color={gradeLevelColor} size={25} />
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          textAlign: 'center',
                          marginRight: '25px',
                          alignItems: 'center ',
                        }}
                      >
                        <Radio value="class">{<UIText>Class Level</UIText>}</Radio>
                        <div>
                          <RedCircle color={classLevelColor} size={25} />
                        </div>
                      </div>
                    </Radio.Group>
                  </CustomFormItem>
                </>
              )}

              {/* {!isEditMode && (
                <>
                  {type === 'grade' && <SelectGrade name="grade_number" label="Grade" gradeName="calendar" />}
                  {type === 'class' && (
                    <>
                      <SelectGrade name="grade_id" label="Grade" />
                      <DivisionSelect name="grade_class" />
                    </>
                  )}
                </>
              )} */}

              {maintype === 'grade' && (
                <SelectGrade name="grade_number" label="Grade" gradeName="calendar" EditMode={!!isEditMode} />
              )}
              {maintype === 'class' && (
                <>
                  <SelectGrade name="grade_id" label="Grade" EditMode={!!isEditMode} />
                  <DivisionSelect name="class_id" EditMode={!!isEditMode} />
                </>
              )}

              <CustomFormItem
                name="title"
                label="Event Title"
                rules={[{ required: true, message: 'Please enter the event title' }]}
                style={{ gridColumn: 'span 2' }}
              >
                <Input placeholder="Event Title" />
              </CustomFormItem>
              <CustomFormItem
                label="Event Start Date"
                name="start_date"
                rules={[{ required: true, message: 'Please select a start date!' }]}
              >
                <DatePicker
                  disabledDate={disabledStartDate}
                  placeholder="Event Start Date"
                  format={'DD/MM/YYYY'}
                  className="w-full"
                  onChange={(date) => {
                    if (date && endDate && date.isAfter(endDate)) {
                      setEndDate(null);
                    }
                    setStartDate(date);
                  }}
                />
              </CustomFormItem>
              <CustomFormItem
                label="Event End Date"
                name="end_date"
                rules={[{ required: true, message: 'Please select an end date!' }]}
              >
                <DatePicker
                  disabledDate={disabledEndDate}
                  format={'DD/MM/YYYY'}
                  placeholder="Event End Date"
                  className="w-full"
                  onChange={(date) => {
                    if (date && startDate && date.isBefore(startDate)) {
                      setEndDate(null); // Clear if end date is before start date
                    } else {
                      setEndDate(date);
                    }
                  }}
                />
              </CustomFormItem>
              <CustomFormItem
                label="Start Time"
                name="start_time"
                rules={[{ required: true, message: 'Please select a start time' }]}
              >
                <TimePicker
                  placeholder="Start Time"
                  format="HH:mm"
                  className="w-full"
                  onChange={handleStartTimeChange}
                  showNow={false}
                />
              </CustomFormItem>
              <CustomFormItem
                label="End Time"
                name="end_time"
                rules={[{ required: true, message: 'Please select an end time' }, { validator: validateEndTime }]}
              >
                <TimePicker
                  placeholder="End Time"
                  format="HH:mm"
                  className="w-full"
                  disabledTime={getDisabledTime}
                  showNow={false}
                />
              </CustomFormItem>
              <CustomFormItem name="description" label="Description" style={{ gridColumn: 'span 2' }}>
                <Input.TextArea placeholder="Description" />
              </CustomFormItem>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            {user?.id != createId && (type === 'Exam' || type === 'grade' || type === 'class' || type === 'school') ? (
              <Button type="button" onClick={handleCancel}>
                Cancel
              </Button>
            ) : (
              <>
                <UIFormSubmitButton api={isEditMode ? editEventData : addEvent}>
                  {isEditMode ? 'Update' : 'Submit'}
                </UIFormSubmitButton>
                {isEditMode && (
                  <Button
                    type="button"
                    disabled={user.id != createId}
                    className={cn('gap-2 text-red-600 hover:text-red-600')}
                    variant="outline"
                    onClick={() => handleDeleteEvent(updateId)}
                  >
                    <RiDeleteBin6Line size={18} className="text-red-600" />
                    Delete Event
                  </Button>
                )}
              </>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Calender;
