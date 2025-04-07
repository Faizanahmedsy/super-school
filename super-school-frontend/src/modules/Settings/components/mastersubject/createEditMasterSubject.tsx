import AppsContainer from '@/app/components/AppsContainer';
import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UILoader from '@/components/custom/loaders/UILoader';
import UISelect from '@/components/global/Form/v4/UISelect';
import PageTitle from '@/components/global/PageTitle';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { StyledFormItem } from '@/modules/Management/exams/AssessmentSelectSubject/AssessmentSelectSubject';
import {
  useCreateMasterSubject,
  useMasterSubjectGetById,
  useUpdateMasterSubject,
} from '@/services/mastersubject/mastersubject.hook';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Card, Form, Input, Radio, Select } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CreateEditMasterSubject = ({ editMode = false }: { editMode?: boolean }) => {
  const navigate = useNavigate();
  const params: any = useParams();
  const [form] = Form.useForm();
  const addMasterSubject = useCreateMasterSubject();
  const updateMasterSubject = useUpdateMasterSubject();
  const { data: getmastersubjectdata, isLoading } = useMasterSubjectGetById(params?.id);

  useEffect(() => {
    if (getmastersubjectdata) {
      form.setFieldsValue({
        subject_name: getmastersubjectdata?.subject_name,
        grade_number: getmastersubjectdata?.grade_number,
        is_language: Boolean(getmastersubjectdata?.is_language),
        subject_code: getmastersubjectdata?.subject_code,
      });
    }
  }, [getmastersubjectdata]);

  const onFinish = (values: any) => {
    const data = values.subjects.map((subject: any) => {
      if (subject.is_language == 'true') {
        subject.is_language = true;
      }

      if (subject.is_language == 'false') {
        subject.is_language = false;
      }
      return {
        subject_name: subject.subject_name,
        grade_number: subject.grade_number,
        is_language: subject.is_language,
        subject_code: subject.subject_code,
      };
    });

    const payload = {
      subjects: data,
    };

    addMasterSubject.mutate(payload, {
      onSuccess: () => {
        navigate('/settings', { state: { key: '4' } });
      },
    });
  };

  const handleEditData = (values: any) => {
    const payload: any = {
      subject_name: values?.subject_name,
      grade_number: values?.grade_number,
      is_language: Boolean(values?.is_language),
      subject_code: values?.subject_code,
    };

    updateMasterSubject.mutate(
      { id: Number(params?.id), payload },
      {
        onSuccess: () => {
          navigate('/settings', { state: { key: '4' } });
        },
      }
    );
  };

  useEffect(() => {
    form.setFieldValue(['subjects', 0, 'is_language'], 'false');
  }, []);

  return (
    <div>
      <PageTitle
        breadcrumbs={[
          {
            label: 'Master Subject List',
            href: '/settings',
            onClick: () => {
              navigate('/settings', { state: { key: '4' } });
            },
          },
          { label: `${editMode ? 'Edit' : 'Create'} Master Subject` },
        ]}
      >
        {`${editMode ? 'Edit' : 'Create'} Master Subject`}
      </PageTitle>
      <AppsContainer fullView={true} cardStyle={{ padding: '20px' }}>
        {editMode ? (
          <Form
            form={form}
            name="dynamic_card_form"
            onFinish={handleEditData}
            layout="vertical"
            autoComplete="off"
            initialValues={{ subjects: [{}] }}
          >
            <Card className="mb-2">
              {isLoading ? (
                <UILoader />
              ) : (
                <div className="mb-0 pb-0 grid md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                  <StyledFormItem
                    label="Select Grade Number"
                    name="grade_number"
                    rules={[{ required: true, message: 'Please enter grade number' }]}
                  >
                    <Select
                      placeholder="Select Grade Number"
                      options={[
                        { label: 'Grade 1', value: '1' },
                        { label: 'Grade 2', value: '2' },
                        { label: 'Grade 3', value: '3' },
                        { label: 'Grade 4', value: '4' },
                        { label: 'Grade 5', value: '5' },
                        { label: 'Grade 6', value: '6' },
                        { label: 'Grade 7', value: '7' },
                        { label: 'Grade 8', value: '8' },
                        { label: 'Grade 9', value: '9' },
                        { label: 'Grade 10', value: '10' },
                        { label: 'Grade 11', value: '11' },
                        { label: 'Grade 12', value: '12' },
                      ]}
                    />
                  </StyledFormItem>
                  <CustomFormItem label="Subject Code" name="subject_code">
                    <Input placeholder="Enter Subject Code" />
                  </CustomFormItem>
                  <CustomFormItem label="Subject Name" name="subject_name">
                    <Input placeholder="Enter Subject Name" />
                  </CustomFormItem>
                  <CustomFormItem label="Is Langauge" name="is_language">
                    <Radio.Group defaultValue={'false'}>
                      <Radio value={true}>True</Radio>
                      <Radio value={false}>False</Radio>
                    </Radio.Group>
                  </CustomFormItem>
                  <div>
                    <div className="flex gap-5">
                      <UIFormSubmitButton api={updateMasterSubject} type="submit">
                        Update
                      </UIFormSubmitButton>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </Form>
        ) : (
          <Form
            form={form}
            name="dynamic_card_form"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
            initialValues={{ subjects: [{}] }}
          >
            <Form.List name="subjects">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <>
                      <Card key={key} className="mb-2">
                        {fields.length > 1 && (
                          <CloseOutlined
                            onClick={() => remove(name)}
                            className="text-red-500 absolute top-4 right-4 cursor-pointer text-lg"
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                          />
                        )}
                        <div>
                          <div className="mb-0 pb-0 grid md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                            <CustomFormItem
                              {...restField}
                              label="Select Grade"
                              name={[name, 'grade_number']}
                              rules={[{ required: true, message: 'Please enter a grade name' }]}
                            >
                              <UISelect
                                placeholder="Select Grade"
                                options={[
                                  { label: 'Grade 1', value: '1' },
                                  { label: 'Grade 2', value: '2' },
                                  { label: 'Grade 3', value: '3' },
                                  { label: 'Grade 4', value: '4' },
                                  { label: 'Grade 5', value: '5' },
                                  { label: 'Grade 6', value: '6' },
                                  { label: 'Grade 7', value: '7' },
                                  { label: 'Grade 8', value: '8' },
                                  { label: 'Grade 9', value: '9' },
                                  { label: 'Grade 10', value: '10' },
                                  { label: 'Grade 11', value: '11' },
                                  { label: 'Grade 12', value: '12' },
                                ]}
                              />
                            </CustomFormItem>
                            <CustomFormItem
                              {...restField}
                              label="Subject Code"
                              name={[name, 'subject_code']}
                              rules={[{ required: true, message: 'Please enter a subject code' }]}
                            >
                              <Input placeholder="Subject Code" />
                            </CustomFormItem>
                            <CustomFormItem
                              {...restField}
                              label="Subject Name"
                              name={[name, 'subject_name']}
                              rules={[{ required: true, message: 'Please enter a subject name' }]}
                            >
                              <Input placeholder="Subject Name" />
                            </CustomFormItem>
                            <CustomFormItem
                              {...restField}
                              label="Is Language"
                              name={[name, 'is_language']}
                              rules={[{ required: true, message: 'Please select is language' }]}
                            >
                              <Radio.Group>
                                <Radio value={'true'}>True</Radio>
                                <Radio value={'false'}>False</Radio>
                              </Radio.Group>
                            </CustomFormItem>
                          </div>
                        </div>
                      </Card>
                    </>
                  ))}
                  <Form.Item className="mb-4 py-5 grid md:grid-cols-4 relative">
                    <div className="flex gap-5">
                      <UIFormSubmitButton api={addMasterSubject} type="submit">
                        Save
                      </UIFormSubmitButton>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          add();
                        }}
                        className="gap-2"
                      >
                        <PlusOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                        <UIText>Add More</UIText>
                      </Button>
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
        )}
      </AppsContainer>
    </div>
  );
};

export default CreateEditMasterSubject;
