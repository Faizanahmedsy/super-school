import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import UILoader from '@/components/custom/loaders/UILoader';
import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import BatchSelect from '@/components/global/Form/SelectBatch';
import DivisionSelect from '@/components/global/Form/SelectDivision';
import SelectTerm from '@/components/global/Form/SelectTerm';
import UIFormItemSelect from '@/components/global/Form/v4/UIFormItem';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';
import { capitalizeFirstLetter } from '@/lib/common-functions';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { ACTION, MODULE, ROLE_NAME } from '@/lib/helpers/authHelpers';
import {
  useCreateExamtimetable,
  useDeleteExamtimetable,
  useExamtimetableDetailsGetById,
  useExamtimetableList,
  useUpdateExamtimetable,
} from '@/services/examtimetable/examtimetable.hook';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { ColumnDef, Row } from '@tanstack/react-table';
import { DatePicker, Form, Input, Modal, Select, TimePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDivisionSubjectList } from '../Master/subject/subject.action';
import { RangePickerProps } from 'antd/es/date-picker';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import SelectDivisionBasedOnSubject from '@/components/global/Form/SelectV2/SelectDivisionBasedOnSubject';
import { useRoleBasedLearnerId } from '@/hooks/role-based-ids/use-rolebased-learner-id';

const ExamTimeTableList = () => {
  // HOOKS
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const schoolId = useRoleBasedSchoolId();
  const user = useGlobalState((state) => state.user);

  const cur_batch_id = useRoleBasedCurrentBatch();
  const [selectedStartTime, setSelectedStartTime] = useState<Dayjs | null>(null);
  const [fieledDataSet, setFieledDataSet] = useState(false);

  // GLOBAL STATE
  const setSubjectDetailsId = useGlobalState((state: any) => state.setSubjectDetailsId);

  // LOCAL STATE
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>();
  const [filterSubjectId, setFilterSubjectId] = useState<any>();
  const [editId, setEditId] = useState<any>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [subjectName, setSubjectName] = useState<string>();
  const [loading, setLoading] = useState(false);
  const studentId = useRoleBasedLearnerId();

  //QUERIES
  const addExamtimetable = useCreateExamtimetable();

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    search: '',
    sort: 'desc',
  });

  useEffect(() => {
    if (user?.role_name === ROLE_NAME.STUDENT || user?.role_name === ROLE_NAME.PARENT) {
      setPageQuery({
        ...pageQuery,
        student_id: user?.details?.id ? user?.details?.id : studentId,
        grade_id: user?.details?.grade?.id,
        batch_id: cur_batch_id,
      });
    }
  }, []);

  const {
    data: examtimetableList,
    isLoading,
    refetch,
  } = useExamtimetableList({
    ...pageQuery,
    school_id: schoolId,
  });

  const {
    data: getdatabyid,
    isLoading: editDataLoading,
    refetch: getbyidRefech,
  } = useExamtimetableDetailsGetById(editId);

  const { mutate: deleteExamTimetable } = useDeleteExamtimetable();

  const exameTimetableUpdate = useUpdateExamtimetable();

  const subjectListApi = useDivisionSubjectList(
    {
      grade_id: selectedGrade,
      batch_id: cur_batch_id,
    },
    Boolean(selectedGrade)
  );

  // HANDLERS
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const debouncedSearch = debounce((searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, 300);

  const handleSearchInputChange = (searchTerm: string) => {
    debouncedSearch(searchTerm);
  };

  const examTimetableColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'assessment_name',
      header: 'Exam Name',
      cell: (info: any) => {
        const subjectName = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <span>{subjectName ? subjectName : '-'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'subject_name',
      header: 'Subject Name',
      cell: (info: any) => {
        const subjectName = capitalizeFirstLetter(info.getValue());
        return (
          <div className="flex items-center gap-2">
            <span>{subjectName ? subjectName : '-'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'paper_title',
      header: 'Paper Title',
      cell: (info: any) => {
        const paper_title = capitalizeFirstLetter(info.getValue());
        return <>{paper_title ? paper_title : '-'}</>;
      },
    },
    {
      accessorKey: 'term_name',
      header: 'Term',
      cell: (info) => {
        const { term_name } = info.row.original;
        return <>{term_name ? term_name : '-'}</>;
      },
    },
    {
      accessorKey: 'grade_number',
      header: 'Grade',
      cell: (info) => {
        const { grade_number } = info.row.original;
        return <>{grade_number ? grade_number : '-'}</>;
      },
    },
    {
      accessorKey: 'class',
      header: 'Class',
      cell: (info) => {
        const { class: className } = info.row.original;
        return <>{className ? className : '-'}</>;
      },
    },
    {
      accessorKey: 'assessment_start_datetime',
      header: 'Date',
      cell: (info) => {
        const { start_date } = info.row.original;
        return <div>{dayjs.utc(start_date).format('DD-MM-YYYY')}</div>;
      },
    },
    {
      accessorKey: 'assessment_start_datetime',
      header: 'Start Time',
      cell: (info) => {
        const { start_time } = info.row.original;
        return <div>{start_time}</div>;
      },
    },
    {
      accessorKey: 'assessment_end_datetime',
      header: 'End Time',
      cell: (info) => {
        const { end_time } = info.row.original;
        return <div>{end_time}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<any> }) => (
        <>
          <div className="flex space-x-2 items-center">
            <TableEditBtn
              className="z-index:999;"
              onClick={(e) => handleEdit(e, row.original)}
              moduleName={MODULE.ASSESSMENTS}
              checkPermission={true}
            />
            <TableDeleteBtn
              onClick={(e) => handleDelete(e, row.original.id)}
              checkPermission={true}
              moduleName={MODULE.ASSESSMENTS}
            />
          </div>
        </>
      ),
    },
  ];

  const handleEdit = async (e: React.MouseEvent, data: any) => {
    e.stopPropagation();
    setOpenAddModal(true);
    setEditId(data?.id);
    setIsEditMode(true);
    await getbyidRefech();
    setFieledDataSet((prev) => !prev);
  };

  useEffect(() => {
    setLoading(true);
    if (getdatabyid) {
      setSelectedGrade(getdatabyid?.grade_id);
      setFilterSubjectId(getdatabyid?.subject_id);
      form.setFieldsValue({
        assessment_name: getdatabyid?.assessment_name || '',
        paper_title: getdatabyid?.paper_title || '',
        date: getdatabyid?.start_date ? dayjs(getdatabyid.start_date) : null,
        startTime: getdatabyid?.start_time ? dayjs(getdatabyid.start_time, 'HH:mm') : null,
        endTime: getdatabyid?.end_time ? dayjs(getdatabyid.end_time, 'HH:mm') : null,
        batch_id: getdatabyid?.batch_id || null,
        term_name: getdatabyid?.term_id || null,
        grade_number: getdatabyid?.grade_id || null,
        subject_id: getdatabyid?.subject_id || null,
        grade_class_id: getdatabyid?.class_id || null,
      });
      setLoading(false);
    }
    setLoading(false);
  }, [editId, getdatabyid, form, fieledDataSet]);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    Modal.confirm({
      centered: true,
      title: 'Are you sure you want to delete?',
      okText: 'yes',
      onOk: async () => {
        deleteExamTimetable(id as any, {
          onSuccess: () => {
            refetch();
          },
        });
      },
    });
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setIsEditMode(false);
    form.resetFields();
  };

  function handleSubmit(values: any) {
    const assessment_start_datetime = dayjs(values.date)
      .hour(values.startTime.hour())
      .minute(values.startTime.minute())
      .second(0)
      .millisecond(0)
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

    const assessment_end_datetime = dayjs(values.date)
      .hour(values.endTime.hour())
      .minute(values.endTime.minute())
      .second(0)
      .millisecond(0)
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const payload: {
      assessment_name: string;
      paper_title: string;
      start_date: any;
      end_date: any;
      school_id: number;
      batch_id: number;
      term_id: any;
      grade_id?: number;
      class_id?: number;
      subject_id?: number;
      start_time?: string;
      end_time?: string;
    } = {
      assessment_name: values.assessment_name,
      paper_title: values.paper_title ? values.paper_title : subjectName,
      start_date: assessment_start_datetime,
      end_date: assessment_end_datetime,
      school_id: Number(schoolId),
      batch_id: Number(values.batch_id),
      class_id: values.grade_class_id,
      term_id: values.term_name,
      grade_id: Number(values.grade_number),
      subject_id: Number(values.subject_id),
      start_time: dayjs(values.startTime).format('HH:mm'),
      end_time: dayjs(values.endTime).format('HH:mm'),
    };

    if (isEditMode && editId) {
      exameTimetableUpdate.mutate(
        { id: editId, payload: payload },
        {
          onSuccess: () => {
            setOpenAddModal(false);
            form.resetFields();
            setIsEditMode(false);
            refetch();
          },
        }
      );
    } else {
      addExamtimetable.mutate(payload, {
        onSuccess: () => {
          form.resetFields();
          setOpenAddModal(false);
          refetch();
        },
      });
    }
  }

  const { data: gradeListQuery } = useGradeList({
    batch_id: cur_batch_id,
    checkStudent: true,
  });

  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  // EFFECTS
  useEffect(() => {
    form.setFieldsValue({
      batch_id: cur_batch_id,
    });
  }, []);

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

  const validateEndTime = (_: any, value: Dayjs): Promise<void> => {
    const startTime = form.getFieldValue('startTime');

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

  const handleRowClick = (id: number, data: any) => {
    navigate(`/exam-timetable/details/${id}`);
    setSubjectDetailsId({
      subjectdetailsid: {
        id: data?.id,
      },
      gradeclass: {
        id: data?.grade_class,
      },
    });
  };

  const disabledStartDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <>
      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="flex justify-end items-center gap-4 mt-4 w-full pe-4">
          <CreateButton
            moduleName={MODULE.EXAM_TIME_TABLE}
            action={ACTION.ADD}
            overrideText="Create Exam Timetable"
            onClick={() => {
              setLoading(false);
              setOpenAddModal(true);
            }}
          />
        </div>
        <div className="p-4">
          <DynamicTable
            data={Array.isArray(examtimetableList?.list) ? examtimetableList?.list || [] : []}
            columns={examTimetableColumns}
            loading={isLoading}
            searchColumn="assessment_name"
            searchPlaceholder="Search by Exam Name"
            totalCount={examtimetableList?.totalCount || 0}
            pageSize={pageQuery.limit}
            pageIndex={(pageQuery.page ?? 1) - 1}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearchInputChange}
            moduleName="Exam Timetable"
            handleRowClick={handleRowClick}
          />
        </div>
      </AppsContainer>

      <Modal
        title={isEditMode ? 'Edit Exam Timetable' : 'Create Exam Timetable'}
        centered={true}
        open={openAddModal}
        width={1000}
        maskClosable={false}
        onCancel={() => {
          setOpenAddModal(false);
          form.resetFields();
          setIsEditMode(false);
        }}
        footer={null} // No default footer, as form buttons are inside the form
      >
        <Form form={form} layout="vertical" className="space-y-5" onFinish={handleSubmit}>
          {editDataLoading || loading ? (
            <UILoader />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CustomFormItem
                  label="Exam Name"
                  name="assessment_name"
                  rules={[{ required: true, message: requireMessage('Exam name') }]}
                >
                  <Input placeholder="Exam Name" />
                </CustomFormItem>
                <CustomFormItem label="Paper Title" name={'paper_title'}>
                  <Input placeholder="Enter Paper Title" />
                </CustomFormItem>
                <CustomFormItem
                  label="Date"
                  name={'date'}
                  rules={[{ required: true, message: requireMessage('date', 'select') }]}
                >
                  <DatePicker placeholder="Select Date" className="w-full" disabledDate={disabledStartDate} />
                </CustomFormItem>

                <CustomFormItem
                  label="Start Time"
                  name={'startTime'}
                  rules={[{ required: true, message: requireMessage('start time', 'select') }]}
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
                  name={'endTime'}
                  rules={[
                    { required: true, message: requireMessage('end time', 'select') },
                    { validator: validateEndTime },
                  ]}
                  dependencies={[[name, 'startTime']]}
                >
                  <TimePicker
                    placeholder="End Time"
                    format="HH:mm"
                    className="w-full"
                    disabledTime={getDisabledTime}
                    showNow={false}
                  />
                </CustomFormItem>

                <BatchSelect name="batch_id" />

                <SelectTerm name="term_name" />

                <UIFormItemSelect
                  label={<UIText>Select Grade</UIText>}
                  name={'grade_number'}
                  rules={[{ required: true, message: requireMessage('grade', 'select') }]}
                >
                  <Select
                    placeholder="Select Grade"
                    options={gradeOptions}
                    onChange={(value: any) => {
                      setSelectedGrade(value);
                      form.setFieldsValue({ grade_class_id: undefined });
                      form.setFieldsValue({ subject_id: undefined });
                    }}
                    allowClear
                  />
                </UIFormItemSelect>

                <UIFormItemSelect
                  label={<UIText>Select Subject</UIText>}
                  name="subject_id"
                  rules={[{ required: true, message: requireMessage('subject', 'select') }]}
                >
                  <Select
                    options={subjectListApi?.data?.list?.map((subject: any) => ({
                      label: `${subject.master_subject.subject_name} (${subject.master_subject.subject_code})`,
                      value: subject.subject_id,
                    }))}
                    onChange={(value: any) => {
                      subjectListApi?.data?.list?.forEach((subject: any) => {
                        if (subject.subject_id === value) {
                          setSubjectName(subject.master_subject.subject_name);
                        }
                      });
                      setFilterSubjectId(value);
                    }}
                    placeholder="Select Subject"
                  />
                </UIFormItemSelect>
                <SelectDivisionBasedOnSubject
                  name={'grade_class_id'}
                  filterSubjectId={filterSubjectId}
                  params={{
                    checkStudent: true,
                  }}
                  typeSelect="single"
                />
              </div>
              <div className="w-full bg-white border-t p-4">
                <div className="text-right space-x-3">
                  <Button onClick={handleCancel} className="mr-4" type="button" variant={'nsc-secondary'}>
                    Cancel
                  </Button>
                  <UIFormSubmitButton api={isEditMode ? exameTimetableUpdate : addExamtimetable} type="submit">
                    {isEditMode ? 'Update' : 'Save'}
                  </UIFormSubmitButton>
                </div>
              </div>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default ExamTimeTableList;
