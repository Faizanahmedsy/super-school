import AppPageMeta from '@/app/components/AppPageMeta';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import BatchSelect from '@/components/global/Form/SelectBatch';
import SelectGender from '@/components/global/Form/SelectGender';
import UIMultiSelect from '@/components/global/Form/v4/UIMultiSelect';
import UISelect from '@/components/global/Form/v4/UISelect';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';
import { convertToCommaSeparatedString } from '@/lib/common-functions';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { useDivisionSubjectList } from '@/modules/Master/subject/subject.action';
import {
  StyledInfoUpload,
  StyledInfoUploadAvatar,
  StyledInfoUploadBtnView,
  StyledInfoUploadContent,
} from '@/modules/Profile/UserProfile/PersonalInfo/index.styled';
import { useCreateParent, useParentList } from '@/services/management/parent/parent.hook';
import {
  useAddStudentMutation,
  useStudentGetDataById,
  useUpdateStudent,
  useUpdateStudentParents,
} from '@/services/management/students/students.hook';
import { getDivisionListApi } from '@/services/master/division/division.api';
import { useGradeList } from '@/services/master/grade/grade.hook';
import { StudentPayload } from '@/services/types/payload';
import { PlusOutlined } from '@ant-design/icons';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { Card, DatePicker, Form, Input, Modal, Upload, Image as AntdImage } from 'antd';
import { UploadFile } from 'antd/lib';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useParams } from 'react-router-dom';

export default function CreateEditStudent({ editMode = false }: { editMode?: boolean }) {
  const [userImage, setUserImage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [parentForm] = Form.useForm();
  const params = useParams();
  const addStudentsMutation = useAddStudentMutation();
  const [updateId, setUpdateId] = useState<any>();
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>();
  const [selectedGradeClass, setSelectedGradeClass] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const queryclient = new QueryClient();

  const editStudentsdata = useUpdateStudent(updateId, queryclient);
  const updateParentsData = useUpdateStudentParents(queryclient);

  const [addParentModel, setAddParentModel] = useState(false);
  const [parentDetails, setParentDetails] = useState([
    { id: Date.now(), first_name: '', last_name: '', email: '', mobile_number: '', relationship: '' },
  ]);

  // const [name, setName] = useState('');
  // const [error, setError] = useState(false);

  const school_id: any = useRoleBasedSchoolId();

  const cur_batch_id: any = useRoleBasedCurrentBatch();

  const parentListQuery = useParentList({});

  const createdParentMutation = useCreateParent();

  const [selectedParents, setSelectedParents] = useState<any[]>([]);

  const handleAddParent = () => {
    setParentDetails([
      ...parentDetails,
      { id: Date.now(), first_name: '', last_name: '', email: '', mobile_number: '', relationship: '' },
    ]);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    setParentDetails((prevDetails) => {
      return prevDetails.map((parent, i) => {
        if (i === index) {
          return { ...parent, [field]: value }; // Only update the specific parent at index
        }
        return parent; // Return the parent unchanged if the index doesn't match
      });
    });
  };

  const handleRemoveParent = (id: number) => {
    const payload: any = {
      parentId: id,
      studentId: params?.id,
    };
    updateParentsData.mutate(payload);
    setParentDetails((prevDetails) => prevDetails.filter((parent) => parent.id !== id));
  };

  // const onNameChange = (e: any) => {
  //   setName(e.target.value);
  //   setError(false);
  // };

  // const addItem = () => {
  //   if (!name.trim()) {
  //     setError(true);
  //     return;
  //   }
  //   setRelationshipArr([...relationshipArr, { label: name, value: name.toLowerCase() }]);
  //   setName('');
  // };

  const subjectListApi = useDivisionSubjectList(
    {
      grade_id: selectedGrade,
      batch_id: cur_batch_id,
      grade_class_id: selectedGradeClass,
    },
    Boolean(selectedGrade)
  );

  const { data: gradeListQuery } = useGradeList({
    batch_id: cur_batch_id,
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
        grade_id: selectedGrade,
      },
    ],
    queryFn: () =>
      getDivisionListApi({
        grade_id: selectedGrade,
        sort: 'asc',
      }),
    staleTime: 1000 * 10,
    retry: 1,
    enabled: Boolean(selectedGrade),
    // enabled: Boolean(form.getFieldValue('grade')),
  });

  const { options: divisionOptions } = useListOption({
    listData: divisionListQuery?.list,
    labelKey: 'name',
    valueKey: 'id',
  });

  const navigate = useNavigate();

  const { data: getDataById } = useStudentGetDataById(updateId);

  const handleAddParentSubmit = (values: any) => {
    createdParentMutation.mutate(values, {
      onSuccess: () => {
        parentListQuery.refetch();

        parentForm.resetFields();
        setAddParentModel(false);
      },
      onError: (error) => {
        console.log('error', error);
      },
    });
  };

  useEffect(() => {
    if (editMode) {
      setUpdateId(params?.id as number | undefined);
    } else {
      form.resetFields();
    }

    if (editMode && getDataById) {
      const parentIds: number[] = getDataById?.parents?.map((parent: { id: string }) => parent.id) || [];
      form.setFieldValue('parents', parentIds);
      setSelectedParents(parentIds);

      const subjectIds = getDataById?.divisionSubjects?.map((subject: any) => subject?.subject_id);
      form.setFieldValue('subject_ids_string', subjectIds);

      // getDataById?.divisionSubjects?.map((subject: any) => {
      //   form.setFieldValue('subject_ids_string', subject?.subject_id);
      // });
      const filteredDetails = getDataById?.parents?.map((parent: any) => ({
        id: parent.id,
        first_name: parent.first_name || '',
        last_name: parent.last_name || '',
        email: parent.email || '',
        mobile_number: parent.mobile_number || '',
        relationship: parent.relationship || '',
      }));

      setParentDetails(filteredDetails);
      setSelectedGrade(getDataById?.grade_id);
      setSelectedGradeClass(getDataById?.grade_class_id);

      // form.setFieldValue('subject_ids_string', getDataById);

      form.setFieldsValue({
        first_name: getDataById?.first_name,
        last_name: getDataById?.last_name,
        cur_batch_id: getDataById?.cur_batch_id,
        email: getDataById?.email,
        mobile_number: getDataById?.mobile_number,
        addmission_no: getDataById?.addmission_no,
        date_of_birth: dayjs(getDataById?.date_of_birth, 'YYYY-MM-DD'),
        gender: getDataById?.gender,
        profile_image: getDataById?.profile_image,
        institute_id: getDataById?.institute_id,
        grade_id: getDataById?.grade_id,
        grade_class_id: getDataById?.grade_class_id,
        batch_id: getDataById?.batch_id,
        division_id: getDataById?.division_id,
        // parents_id: getDataById?.parents_id,
        // subject_ids_string: getDataById?.subject_ids_string,
        parentDetails: filteredDetails,
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

  const handleSubmit = (values: any) => {
    delete values.parents;
    const formData = new FormData();
    formData.append('first_name', values.first_name);
    formData.append('last_name', values.last_name);
    formData.append('email', values.email);
    formData.append('mobile_number', values.mobile_number);
    if (values.gender) {
      formData.append('gender', values.gender);
    }
    for (const file of fileList) {
      if (file.originFileObj) {
        formData.append('profile_image', file.originFileObj); // Append the file directly (no Base64)
      }
    }
    formData.append('addmission_no', values.addmission_no);
    formData.append('school_id', String(school_id));
    formData.append('date_of_birth', dayjs(values.date_of_birth).format('YYYY-MM-DD'));
    formData.append('grade_id', String(values.grade_id));
    formData.append('grade_class_id', String(values.grade_class_id));

    formData.append('subject_ids_string', convertToCommaSeparatedString(values.subject_ids_string));
    if (!editMode) {
      formData.append('cur_batch_id', String(cur_batch_id));
    }

    const updatedDetails = parentDetails.map(({ id, ...rest }) => rest);

    formData.append('parents', JSON.stringify(updatedDetails));

    if (editMode) {
      editStudentsdata.mutate(formData as unknown as StudentPayload);
    } else {
      addStudentsMutation.mutate(formData as unknown as StudentPayload, {
        onSuccess: (resp: any) => {
          // form.resetFields();
          navigate('/learner/list');
        },
        onError: (err: any) => {
          if (err.status === 400) {
            displayError(err?.response?.data?.message);
          }
        },
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length) {
        const file: any = acceptedFiles[0];
        setUserImage(file);
        setPreviewImage(URL.createObjectURL(file));
      }
    },
  });

  const handleCancel = () => {
    navigate(-1);
  };

  const [relationshipArr] = useState([
    { label: 'Father', value: 'father' },
    { label: 'Mother', value: 'mother' },
    { label: 'Guardian', value: 'guardian' },
  ]);

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
      <AppPageMeta title={editMode ? 'Edit' : 'Create' + ' ' + 'Learner'} />
      <PageTitle
        breadcrumbs={[
          { label: 'Students List', href: '/learner/list' },
          { label: `${editMode ? 'Edit' : 'Create'} Learner` },
        ]}
      >
        {`${editMode ? 'Edit' : 'Create'} Learner`}
      </PageTitle>
      <Form form={form} layout="vertical" className="space-y-5" onFinish={handleSubmit}>
        <Card>
          <div className="justify-between items-center pb-10">
            <div className="flex items-center text-2xl font-medium text-slate-600 mb-5">
              <div>
                <UIText>Personal Details</UIText>
              </div>
            </div>
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

              <CustomFormItem label="Email" name="email" rules={[{ required: true, message: requireMessage('email') }]}>
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

              <CustomFormItem
                name="date_of_birth"
                label="Date of Birth"
                rules={[
                  { required: true, message: requireMessage('date of birth') },
                  {
                    validator: (_: any, value: any) =>
                      value && value.isAfter(dayjs())
                        ? Promise.reject('Date of birth cannot be in the future')
                        : Promise.resolve(),
                  },
                ]}
              >
                <DatePicker
                  placeholder="Select Date of Birth"
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current.isAfter(dayjs())}
                />
              </CustomFormItem>

              <SelectGender />
            </div>
          </div>
          <div className="justify-between items-center pb-10">
            <div className="flex items-center text-2xl font-medium text-slate-600 mb-5">
              <div>
                <UIText>School Details</UIText>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CustomFormItem
                label="Admission Number"
                name="addmission_no"
                rules={[{ required: true, message: requireMessage('admission number') }]}
              >
                <Input type="text" placeholder="Enter admission number" />
              </CustomFormItem>
              <BatchSelect name="cur_batch_id" />
              <CustomFormItem
                label="Select Grade"
                name={'grade_id'}
                rules={[{ required: true, message: requireMessage('grade', 'select') }]}
              >
                <UISelect
                  placeholder="Search and select a grade"
                  options={gradeOptions}
                  showSearch
                  onChange={(value: any) => {
                    setSelectedGrade(value);
                    form.setFieldsValue({ grade_class_id: undefined });
                    form.setFieldsValue({ subject_ids_string: undefined });
                  }}
                  // filterOption={(input, option) =>
                  //   (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  // }
                  allowClear
                />
              </CustomFormItem>

              <CustomFormItem
                label="Select Class"
                name={'grade_class_id'}
                rules={[{ required: true, message: requireMessage('class', 'select') }]}
              >
                <UISelect
                  placeholder="Select an Class"
                  options={divisionOptions}
                  onChange={(value: number) => {
                    setSelectedGradeClass(value);
                    form.setFieldsValue({ subject_ids_string: undefined });
                    // displayError('Please select a grade first');
                  }}
                />
              </CustomFormItem>
              <CustomFormItem
                label="Subjects"
                name="subject_ids_string"
                rules={[{ required: true, message: requireMessage('subject', 'select') }]}
              >
                <UIMultiSelect
                  mode="multiple"
                  options={subjectListApi?.data?.list?.map((subject: any) => ({
                    label: `${subject.master_subject.subject_name} (${subject.master_subject.subject_code})`,
                    value: subject.subject_id,
                  }))}
                  placeholder="Select Subjects"
                />
              </CustomFormItem>
            </div>
          </div>

          <div className="justify-between items-center pb-10">
            <div className="flex items-center text-2xl font-medium text-slate-600 mb-5 justify-between">
              <div>
                <UIText>Parent Details</UIText>
              </div>{' '}
            </div>

            {parentDetails?.map((parent, index) => (
              <div
                key={index}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 border bg-opacity-50 p-4 rounded-md mb-4"
              >
                <CustomFormItem
                  key={index}
                  label="Name"
                  name={['parentDetails', index, 'first_name']}
                  rules={[{ required: true, message: requireMessage('name') }]}
                  initialValue={parentDetails[index].first_name}
                >
                  <Input
                    key={index}
                    type="text"
                    placeholder="Enter name"
                    value={parentDetails[index].first_name}
                    onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                  />
                </CustomFormItem>

                <CustomFormItem
                  key={index}
                  label="Surname"
                  name={['parentDetails', index, 'last_name']}
                  rules={[{ required: true, message: requireMessage('surname') }]}
                  initialValue={parent.last_name}
                >
                  <Input
                    key={index}
                    type="text"
                    placeholder="Enter surname"
                    value={parent.last_name}
                    onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                  />
                </CustomFormItem>

                <CustomFormItem
                  key={index}
                  label="Email"
                  name={['parentDetails', index, 'email']}
                  rules={[{ required: true, message: requireMessage('email') }]}
                  initialValue={parent.email}
                >
                  <Input
                    key={index}
                    type="email"
                    placeholder="Enter email address"
                    value={parent.email}
                    disabled={editMode}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                  />
                </CustomFormItem>

                <CustomFormItem
                  key={index}
                  label="Mobile Number"
                  name={['parentDetails', index, 'mobile_number']}
                  rules={[
                    { required: true, message: requireMessage('mobile number') },
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
                  initialValue={parent.mobile_number}
                >
                  <Input
                    key={index}
                    maxLength={15}
                    type="text"
                    placeholder="Enter Mobile Number"
                    value={parent.mobile_number}
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    onChange={(e) => handleInputChange(index, 'mobile_number', e.target.value)}
                  />
                </CustomFormItem>

                <CustomFormItem
                  key={index}
                  label="Relationship"
                  name={['parentDetails', index, 'relationship']}
                  rules={[{ required: true, message: requireMessage('relationship', 'select') }]}
                  initialValue={parent.relationship}
                >
                  <UISelect
                    placeholder="Select relationship"
                    value={parent.relationship}
                    onChange={(value: any) => handleInputChange(index, 'relationship', value)}
                    // Client not want this so i have commented out for now, will remove this code later on
                    // dropdownRender={(menu: any) => (
                    //   <>
                    //     {menu}
                    //     <div className="flex mt-1 w-full gap-3">
                    //       <Input
                    //         placeholder="Guardian"
                    //         value={name}
                    //         onChange={onNameChange}
                    //         onKeyDown={(e) => e.stopPropagation()}
                    //       />
                    //       <Button type="button" onClick={addItem}>
                    //         + Add new
                    //       </Button>
                    //     </div>
                    //     {error && (
                    //       <p className="text-red-700" style={{ fontSize: 12 }}>
                    //         Please enter a valid relationship.
                    //       </p>
                    //     )}
                    //   </>
                    // )}
                    options={relationshipArr.map((item) => ({
                      label: item.label,
                      value: item.value,
                    }))}
                  />
                </CustomFormItem>

                <div className="col-span-full flex justify-end">
                  {index > 0 && <Button onClick={() => handleRemoveParent(parent.id)}>Remove</Button>}
                </div>
              </div>
            ))}

            <Button type="button" onClick={handleAddParent}>
              + Add
            </Button>
          </div>

          <div className="flex justify-end mt-4 mb-10">
            <Button onClick={handleCancel} className="mr-4" type="button" variant={'nsc-secondary'}>
              Cancel
            </Button>
            <UIFormSubmitButton api={editMode ? editStudentsdata : addStudentsMutation} type="submit">
              Submit
            </UIFormSubmitButton>
          </div>
        </Card>
      </Form>

      <Modal
        open={addParentModel}
        title="Add Parent"
        onCancel={() => {
          setAddParentModel(false);
          parentForm.resetFields();
        }}
        onOk={() => {
          parentForm.submit();
          // parentForm.resetFields();
        }}
        okButtonProps={{
          loading: createdParentMutation.isPending,
        }}
      >
        <Form form={parentForm} onFinish={handleAddParentSubmit} layout="vertical">
          <CustomFormItem
            label="First Name"
            name="first_name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input type="text" placeholder="Enter first name" />
          </CustomFormItem>

          <CustomFormItem
            label="Last Name"
            name="last_name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input type="text" placeholder="Enter last name" />
          </CustomFormItem>

          <CustomFormItem
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please enter your email' }]}
            disabled={editMode}
          >
            <Input type="email" placeholder="Enter email address" disabled={editMode} />
          </CustomFormItem>
          <CustomFormItem
            label="Mobile Number"
            name={'mobile_number'}
            rules={[
              {
                required: true,
                message: 'Please enter your mobile number',
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
        </Form>
      </Modal>
    </>
  );
}
