import AppPageMeta from '@/app/components/AppPageMeta';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import UIFormCardTitle from '@/components/global/Card/UIFormCardTitle';
import UIMultiSelect from '@/components/global/Form/v4/UIMultiSelect';
import UISelect from '@/components/global/Form/v4/UISelect';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useRoleBasedSchoolType } from '@/hooks/role-based-ids/use-rolebased-school-type';
import { useListOption } from '@/hooks/use-select-option';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { transformSubjectsPayload } from '@/lib/helpers/payloadHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import {
  useAddTeacherMutation,
  useAddTeacherSubjects,
  useTeacherGetDataById,
  useTeacherSubjectlistGetDataById,
  useUpdateTeacher,
} from '@/services/management/teacher/teacher.hook';
import { getDivisionListApi } from '@/services/master/division/division.api';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { QueryParams } from '@/services/types/params';
import { TeacherPayload } from '@/services/types/payload';
import useGlobalState from '@/store';
import { SchoolType } from '@/types/types';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Image as AntdImage, Card, DatePicker, Form, Input, Modal, Select, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { UploadFile } from 'antd/lib';
import dayjs from 'dayjs';
import { CircleX, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ValidateDuplicateSubjects } from '../../helper/teacher.utils';
import { SubjectDetailsColumns } from '../subjectDetails-column';
import { displayError } from '@/lib/helpers/errorHelpers';

export default function CreateEditTeacher({ editMode = false }: { editMode?: boolean }) {
  // HOOKS
  const navigate = useNavigate();
  const params = useParams();
  const queryclient = useQueryClient();
  // LOCAL STATES
  const [userImage, setUserImage] = useState('');

  const [form] = Form.useForm();
  const [subjectForm] = Form.useForm();
  const [addform] = Form.useForm();
  const [updateId, setUpdateId] = useState<any>();
  const addTeacherMutation = useAddTeacherMutation();
  const addSubjectForTeacher = useAddTeacherSubjects();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>();
  const [_, setSelectedGradeNumber] = useState<number | undefined>();
  const [addModal, setAddModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // GLOBAL STATES
  const teacher_id = useGlobalState((state) => state.teacher_id);
  const setTeacherId = useGlobalState((state) => state.setTeacherId);
  const school_id = useRoleBasedSchoolId();
  const curBatchId = useRoleBasedCurrentBatch();
  const currentBatchId: any = useRoleBasedCurrentBatch();
  const schoolType = useRoleBasedSchoolType();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    batch_id: curBatchId,
  });

  // QUERIES
  const { mutate: editTeacherdata } = useUpdateTeacher(updateId, queryclient);

  const { data: getSubjectList, refetch: refetchSubjectList } = useTeacherSubjectlistGetDataById(
    { ...pageQuery },
    Number(params?.id)
  );

  const { data: getDataById } = useTeacherGetDataById(updateId);

  const subjectListApi = useSubjectList(
    {
      grade_id: selectedGrade,
      batch_id: curBatchId,
    },
    Boolean(selectedGrade)
  );

  const { data: gradeListQuery } = useGradeList({
    batch_id: curBatchId,
    school_id: school_id,
    checkStudent: false,
  });
  const { options: gradeOptions } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  const { data: divisionListQuery } = useQuery({
    queryKey: [
      'division-list',
      {
        sort: 'asc',
        grade_id: selectedGrade,
      },
    ],
    queryFn: () =>
      getDivisionListApi({
        sort: 'asc',
        grade_id: selectedGrade,
      }),
    retry: 1,
    enabled: Boolean(selectedGrade),
  });

  const { options: divisionOptions } = useListOption({
    listData: divisionListQuery?.list,
    labelKey: 'name',
    valueKey: 'id',
  });

  //  EFFECTS
  useEffect(() => {
    const filteredDetails = getDataById?.divisionSubjects?.map((values: any) => ({
      grade_id: values.grade_id || '',
      grade_class_id: values.grade_class_id || '',
      subject_id: values.subject_id || '',
    }));
    if (editMode) {
      setUpdateId(params?.id as number | undefined);
    } else {
      form.resetFields();
    }

    if (editMode && getDataById) {
      form.setFieldsValue({
        first_name: getDataById?.first_name,
        last_name: getDataById?.last_name,
        email: getDataById?.email,
        mobile_number: getDataById?.mobile_number,
        gender: getDataById?.gender,
        institute_id: getDataById?.institute_id,
        sace_number: getDataById?.sace_number,
        persal_number: getDataById?.persal_number,
        date_of_birth:
          getDataById?.date_of_birth && getDataById.date_of_birth !== null && getDataById.date_of_birth !== ''
            ? dayjs(getDataById.date_of_birth, 'YYYY-MM-DD')
            : undefined,

        hire_date:
          getDataById?.hire_date && getDataById.hire_date !== null && getDataById.hire_date !== ''
            ? dayjs(getDataById.hire_date, 'YYYY-MM-DD')
            : undefined,
        division_ids: getDataById?.division_ids,
        subject_specialization: getDataById?.subject_specialization,
        extra_activity: getDataById?.extra_activity,
        subjects: filteredDetails,
      });

      if (getDataById?.profile_image != null) {
        const url = `${getDataById?.profile_image}`;
        setPreviewImage(url);
        setFileList([
          {
            uid: '-1',
            name: 'logo.png',
            status: 'done',
            url: getDataById?.profile_image,
          },
        ]);
      } else {
        setPreviewImage('');
      }
    }
  }, [getDataById, editMode]);

  //  HANDLERS
  const handleSubjectSubmit = async (values: any) => {
    const transformedPayload = transformSubjectsPayload(values.subjects, Number(curBatchId));
    const areThereDuplicateSubjects = ValidateDuplicateSubjects(transformedPayload.subjects);

    if (!areThereDuplicateSubjects) {
      toast.error('Please choose unique subjects for same class and grade');
      return;
    }

    const payload = {
      batch_id: Number(curBatchId),
      school_id: Number(school_id),
      teacher_id: Number(teacher_id),
      ...transformedPayload,
    };

    if (values?.subjects.length > 0) {
      addSubjectForTeacher.mutate(payload, {
        onSuccess: (data) => {
          navigate('/teacher/list');
        },
      });
    } else {
      toast.error('please select subjects');
    }
  };

  const handleSubmit = async (values: TeacherPayload) => {
    const formData = new FormData();
    formData.append('first_name', values.first_name);
    formData.append('last_name', values.last_name);
    if (values.subject_specialization) {
      formData.append('subject_specialization', values.subject_specialization);
    }
    formData.append('email', values.email);
    formData.append('mobile_number', values.mobile_number);

    if (values?.sace_number) {
      formData.append('sace_number', values.sace_number);
    }

    if (values?.persal_number) {
      formData.append('persal_number', values.persal_number);
    }

    if (values.gender) {
      formData.append('gender', values.gender);
    }

    if (currentBatchId && !editMode) {
      formData.append('cur_batch_id', currentBatchId);
    }

    if (values.date_of_birth) {
      formData.append('date_of_birth', values.date_of_birth);
    }
    formData.append('hire_date', values.hire_date);

    // if (userImage && userImage != previewImage) {
    //   formData.append('profile_image', userImage);
    // }
    for (const file of fileList) {
      if (file.originFileObj) {
        formData.append('profile_image', file.originFileObj); // Append the file directly (no Base64)
      }
    }
    if (values.extra_activity) {
      formData.append('extra_activity', values.extra_activity);
    }
    formData.append('school_id', String(school_id));
    if (editMode) {
      editTeacherdata(formData as unknown as TeacherPayload);
    } else {
      addTeacherMutation.mutate(formData as unknown as TeacherPayload, {
        onSuccess: (data) => {
          setTeacherId(data.teacher.id);
          setStep(2);
        },
      });
    }
  };

  const handleAddForm = (values: any) => {
    const subjectArray = values?.subject_ids_string.map((subjectId: string) => {
      const body = {
        grade_id: Number(values?.grade_id),
        grade_class_id: Number(values?.grade_class_id),
        subject_id: Number(subjectId),
        batch_id: Number(getDataById?.curBatchId ? getDataById?.curBatch : curBatchId),
      };
      return body;
    });

    const payload = {
      batch_id: Number(curBatchId),
      school_id: Number(getDataById?.school_id),
      teacher_id: Number(getDataById?.id),
      subjects: subjectArray,
    };
    addSubjectForTeacher.mutate(payload, {
      onSuccess: () => {
        queryclient.invalidateQueries({ queryKey: ['teacher-list-get-byid'] });
        addform.resetFields();
        refetchSubjectList();
        setAddModal(false);
      },
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  function renderFieldsBasedOnSchoolType(schoolType: SchoolType) {
    if (schoolType === 'private') {
      return (
        <>
          <CustomFormItem
            name={'sace_number'}
            label={'SACE Number'}
            rules={[{ required: true, message: requireMessage('SACE Number') }]}
          >
            <Input type="text" placeholder="Enter SACE Number" />
          </CustomFormItem>
        </>
      );
    } else if (schoolType === 'public') {
      return (
        <>
          <CustomFormItem
            name={'sace_number'}
            label={'SACE Number'}
            rules={[{ required: true, message: requireMessage('SACE Number') }]}
          >
            <Input type="text" placeholder="Enter SACE Number" />
          </CustomFormItem>
          <CustomFormItem
            name={'persal_number'}
            label={'Persal Number'}
            rules={[{ required: true, message: requireMessage('Persal Number') }]}
          >
            <Input type="text" placeholder="Enter Persal Number" />
          </CustomFormItem>
        </>
      );
    }
  }

  const param: any = {
    sort: 'asc',
  };
  const ClassSelect = ({ gradeId, ...props }: any) => {
    setSelectedGrade(gradeId);
    const { data: divisionListQuery } = useQuery({
      queryKey: ['division-list', { grade_id: gradeId }],
      queryFn: () => getDivisionListApi({ ...param, grade_id: gradeId }),
      enabled: !!gradeId,
      retry: 1,
    });

    const { options: divisionOptions } = useListOption({
      listData: divisionListQuery?.list,
      labelKey: 'name',
      valueKey: 'id',
    });

    return <UISelect placeholder="Select a Class" options={divisionOptions} allowClear {...props} />;
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const validateImageDimensions = (file: any) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        displayError('Invalid image file.');
        reject(new Error('Invalid image file.'));
      };

      img.src = objectUrl;
    });
  };

  const uploadButton = (
    <div>
      <PlusOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleChange = async (info: any) => {
    const newFileList = info.fileList.slice(-1); // Keep only the latest file

    if (info.file.status === 'removed') {
      setFileList([]);
      setPreviewImage('');
      return;
    }

    const file = newFileList[0];
    try {
      // Validate dimensions
      await validateImageDimensions(file.originFileObj);

      // Set preview image
      const previewUrl = URL.createObjectURL(file.originFileObj);
      setPreviewImage(previewUrl);

      // Update file list and send payload
      setFileList(newFileList);
      displaySuccess('Image uploaded successfully.');
    } catch (error) {
      // Clear file list if validation fails
      setFileList([]);
      setPreviewImage('');
    }
  };

  return (
    <>
      <AppPageMeta title={editMode ? 'Edit' : 'Create' + ' ' + 'Teacher'} />
      <PageTitle
        breadcrumbs={[
          { label: 'Teacher List', href: '/teacher/list' },
          { label: `${editMode ? 'Edit' : 'Create'} Teacher` },
        ]}
      >
        {`${editMode ? 'Edit' : 'Create'} Teacher`}
      </PageTitle>

      {/* Your code here */}
      {step === 1 && (
        <Card>
          <UIFormCardTitle>
            <UIText>Teacher Details</UIText>
          </UIFormCardTitle>

          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CustomFormItem label="Profile Image" name="profile_image">
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  fileList={fileList}
                  maxCount={1}
                  onPreview={(file) => {
                    setPreviewImage(file.url || file.thumbUrl || null);
                    setPreviewOpen(true);
                  }}
                  onChange={handleChange}
                  beforeUpload={() => false}
                >
                  {fileList.length < 1 && uploadButton}
                </Upload>
                {previewImage && (
                  <AntdImage
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                      visible: previewOpen,
                      onVisibleChange: (visible) => setPreviewOpen(visible),
                      afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                  />
                )}
              </CustomFormItem>
              <CustomFormItem
                label="Name"
                name="first_name"
                rules={[{ required: true, message: requireMessage('name') }]}
              >
                <Input type="text" placeholder="Enter name" />
              </CustomFormItem>
              <CustomFormItem
                label="Surname"
                name="last_name"
                rules={[{ required: true, message: requireMessage('surname') }]}
              >
                <Input type="text" placeholder="Enter surname" />
              </CustomFormItem>

              <CustomFormItem
                label="Email"
                name="email"
                rules={[
                  { required: true, message: requireMessage('email') },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input type="email" placeholder="Enter email address" disabled={editMode} />
              </CustomFormItem>

              <CustomFormItem
                label="Mobile Number"
                name="mobile_number"
                rules={[
                  {
                    required: true,
                    message: requireMessage('mobile number'),
                  },
                  {
                    validator: (_: any, value: any) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      if (!/^\d+$/.test(value)) {
                        return Promise.reject('Please enter numbers only');
                      }
                      if (value.length < 10) {
                        return Promise.reject('Mobile number must be at least 10 digits');
                      }
                      if (value.length > 15) {
                        return Promise.reject('Mobile number cannot exceed 15 digits');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Enter Mobile Number"
                  maxLength={15}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </CustomFormItem>
              {renderFieldsBasedOnSchoolType(schoolType as SchoolType)}

              <CustomFormItem label="Gender" name="gender">
                <Select placeholder="Select gender">
                  <Select.Option value="Male">
                    <UIText>Male</UIText>
                  </Select.Option>
                  <Select.Option value="Female">
                    <UIText>Female</UIText>
                  </Select.Option>
                  <Select.Option value="Other">
                    <UIText>Other</UIText>
                  </Select.Option>
                </Select>
              </CustomFormItem>
              <CustomFormItem
                label="Date of Birth"
                name="date_of_birth"
                getValueProps={(i: any) => ({
                  value: i === undefined || i === null || i === 'Invalid Date' ? '' : dayjs(i),
                })}
              >
                <DatePicker
                  placeholder="Select Date of Birth"
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && dayjs(current).isAfter(dayjs())}
                />
              </CustomFormItem>

              <CustomFormItem
                name="hire_date"
                label="Appointment Date"
                getValueProps={(i: any) => ({
                  value: i === undefined || i === null || i === 'Invalid Date' ? '' : dayjs(i),
                })}
                rules={[{ required: true, message: requireMessage('Appointment date', 'select') }]}
              >
                <DatePicker
                  placeholder="Select Appointment Date"
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  allowClear={true}
                  disabledDate={(current) => current && dayjs(current).isAfter(dayjs())}
                />
              </CustomFormItem>
              <Form.Item label={<UIText>Extra Curricular Activities</UIText>} name="extra_activity">
                <TextArea placeholder="Enter Extra Curricular Activities" style={{ width: '100%' }} />
              </Form.Item>
            </div>
            {editMode && (
              <Card className="bg-slate-300">
                <div className="flex-col items-center text-2xl font-medium text-slate-600 mb-5 justify-between">
                  <div>
                    <UIText>Subject Details</UIText>
                  </div>
                  <Button
                    type="button"
                    className="float-right"
                    onClick={() => {
                      setAddModal(true);
                      addform.resetFields();
                    }}
                  >
                    + Add{' '}
                  </Button>
                </div>

                <DynamicTable
                  loading={getSubjectList?.isLoading}
                  data={getSubjectList?.list || []}
                  columns={SubjectDetailsColumns as ColumnDef<unknown>[]}
                  totalCount={getSubjectList?.totalCount || 0}
                  pageSize={pageQuery.limit}
                  pageIndex={(pageQuery.page ?? 1) - 1}
                  onPaginationChange={handlePaginationChange}
                />

                {/* <DynamicTable
                  showPagination={false}
                  data={getDataById?.divisionSubjects || []}
                  columns={SubjectDetailsColumns}
                  totalCount={getDataById?.totalCount || 0}
                /> */}
              </Card>
            )}

            <div className="flex justify-end mt-4">
              <Button variant={'nsc-secondary'} onClick={handleCancel} className="mr-4" type="button">
                Cancel
              </Button>

              {editMode ? (
                <Button type="submit" className="mr-4">
                  Submit
                </Button>
              ) : (
                <UIFormSubmitButton api={addTeacherMutation} type="submit" className="mr-4">
                  Save & Next
                </UIFormSubmitButton>
              )}
            </div>
          </Form>
        </Card>
      )}
      {step === 2 && (
        <Card className="mt-5">
          <div className="justify-between items-center pb-10">
            <div className="flex items-center text-xl md:text-2xl font-medium text-slate-600 mb-5">
              <div>Subject Details</div>
            </div>
            <Form
              form={subjectForm}
              name="dynamic_card_form"
              onFinish={handleSubjectSubmit}
              layout="vertical"
              autoComplete="off"
              initialValues={{ subjects: [{}] }}
              className="md:p-4"
            >
              <Form.List name="subjects">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => {
                      const currentGradeId = subjectForm.getFieldValue(['subjects', name, 'grade_id']);

                      return (
                        <>
                          <Card title={`Subject ${index + 1}`} className="mb-4">
                            <CircleX
                              onClick={() => remove(name)}
                              className="text-red-500 absolute top-4 right-4 cursor-pointer text-lg"
                            />
                            <div
                              key={key}
                              title={`Subject ${key + 1}`}
                              className="mb-0 py-2 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-4 gap-4 relative"
                            >
                              <CustomFormItem
                                label="Select Grade"
                                {...restField}
                                name={[name, 'grade_id']}
                                rules={[{ required: true, message: 'Please select the grade' }]}
                              >
                                <UISelect
                                  placeholder="Search and select a grade"
                                  options={gradeOptions}
                                  showSearch
                                  onChange={(value: any) => {
                                    // Reset the class ID for the current subject
                                    subjectForm.setFieldsValue({
                                      subjects: {
                                        [name]: {
                                          grade_class_id: undefined,
                                        },
                                      },
                                    });
                                    setSelectedGrade(value);
                                    const grade = gradeListQuery?.list?.find(
                                      (grade: { id: number }) => grade.id === value
                                    );
                                    setSelectedGradeNumber(grade?.grade_number);
                                  }}
                                  allowClear
                                />
                              </CustomFormItem>
                              {/* <CustomFormItem
                                {...restField}
                                label="Select Class"
                                name={[name, 'grade_class_id']}
                                rules={[{ required: true, message: 'Please select the class' }]}
                              >
                                <UISelect placeholder="Select an Class" options={divisionOptions} allowClear />
                              </CustomFormItem> */}

                              <CustomFormItem
                                {...restField}
                                label="Select Class"
                                name={[name, 'grade_class_id']}
                                rules={[{ required: true, message: 'Please select the class' }]}
                              >
                                <ClassSelect gradeId={currentGradeId} />
                              </CustomFormItem>

                              {/* <CustomFormItem
                                {...restField}
                                label="Select Class"
                                name={[name, 'grade_class_id']}
                                rules={[{ required: true, message: 'Please select the class' }]}
                              >
                                <UISelect placeholder="Select a Class" options={filteredDivisionOptions} allowClear />
                              </CustomFormItem> */}

                              <CustomFormItem
                                {...restField}
                                name={[name, 'subject_ids_string']}
                                label="Subjects"
                                rules={[{ required: true, message: 'Please select the subject' }]}
                              >
                                <UIMultiSelect
                                  mode="multiple"
                                  options={subjectListApi?.data?.subjects?.map((subject: any) => ({
                                    label: `${subject.master_subject.subject_name} (${subject.master_subject.subject_code})`,
                                    value: subject.id,
                                  }))}
                                  placeholder="Select Subjects"
                                />
                              </CustomFormItem>
                            </div>
                          </Card>
                        </>
                      );
                    })}

                    <Form.Item>
                      <Button variant="outline" onClick={() => add()} className="gap-2" type="button">
                        <Plus />
                        Add Subject
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <div className="flex justify-end mt-4">
                <UIFormSubmitButton type="submit" className="mr-4" api={addSubjectForTeacher}>
                  Submit
                </UIFormSubmitButton>
              </div>
            </Form>
          </div>
        </Card>
      )}

      <Modal
        open={addModal}
        onCancel={() => setAddModal(false)}
        title={<p className="text-center text-lg text-bold">Assign Subject</p>}
        okButtonProps={{
          loading: addSubjectForTeacher.isPending,
        }}
        centered
        onOk={() => {
          addform.submit();
        }}
      >
        <Form
          form={addform}
          onFinish={handleAddForm}
          layout="vertical"
          autoComplete="off"
          initialValues={{ subjects: [{}] }}
          className="p-4"
        >
          <div title={`Subject`} className="mb-4 py-8 grid  gap-4 relative">
            <CustomFormItem
              label="Select Grade"
              name="grade_id"
              rules={[{ required: true, message: 'Please select the grade' }]}
            >
              {/* <Select
                placeholder="Search and select a grade"
                options={gradeOptions}
                showSearch
                onChange={(value) => {
                  setSelectedGrade(value);

                  const grade = gradeListQuery?.list?.find((grade: { id: number }) => grade.id === value);
                  setSelectedGradeNumber(grade?.grade_number);
                }}
                allowClear
              /> */}
              <UISelect
                placeholder="Select a grade"
                options={gradeOptions}
                onChange={(value: any) => {
                  addform.setFieldsValue({ grade_class_id: undefined });
                  setSelectedGrade(value);
                  const grade = gradeListQuery?.list?.find((grade: { id: number }) => grade.id === value);
                  setSelectedGradeNumber(grade?.grade_number);
                }}
              />
            </CustomFormItem>
            <CustomFormItem
              label="Select Class"
              name="grade_class_id"
              rules={[{ required: true, message: 'Please select the class' }]}
            >
              <UISelect placeholder="Select a class" options={divisionOptions} />
            </CustomFormItem>

            <CustomFormItem
              name="subject_ids_string"
              label="Subjects"
              rules={[{ required: true, message: 'Please select the subjects' }]}
            >
              <UIMultiSelect
                mode="multiple"
                options={subjectListApi?.data?.subjects?.map((subject: any) => ({
                  label: `${subject?.master_subject?.subject_name} (${subject?.master_subject?.subject_code})`,
                  value: subject.id,
                }))}
                placeholder="Select the Subjects"
              />
            </CustomFormItem>
          </div>
        </Form>
      </Modal>
    </>
  );
}
