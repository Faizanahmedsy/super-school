import UIFormSubmitButton from '@/components/custom/buttons/UIFormSubmitButton';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import UIMultiSelect from '@/components/global/Form/v4/UIMultiSelect';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { useReLogin } from '@/services/auth/signin/signin.hook';
import useGlobalState from '@/store';
import useSubjectStore from '@/store/secondary-store';
import { Form, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useCreateMultiSubject, useMasterSubjectList } from '../../Master/subject/subject.action';
import { useUpdateSetupStatus } from '../actions/set-wizard.action';
import UIFormCardV2 from './shared/UIFormCard';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';

interface GradeData {
  id: number;
  grade_number: number;
}

export interface SubjectListApiResponse {
  data?: {
    list: {
      id: number;
      subject_name: string;
      subject_code: string;
      is_language: boolean;
    }[];
  };
}

export interface Subject {
  id: number;
  statid?: string;
  subject_name: string;
  subject_code: string;
  is_language: boolean;
}

interface SetUpData {
  grade: GradeData[];
  batch?: {
    id: number;
  };
}

export default function SetUpAddSubjectForm() {
  const [form] = Form.useForm();
  const multiSubjectMutation = useCreateMultiSubject();
  const updateSetupStatusMutation = useUpdateSetupStatus();
  const schoolId = useRoleBasedSchoolId();

  const [openAddSubjectModal, setOpenAddSubjectModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [gradeNumber, setGradeNumber] = useState(8);

  const setUpData = useGlobalState((state) => state.setUpData) as SetUpData;
  const addSubject: any = useSubjectStore((state) => state.addSubject);
  const resetSubjects = useSubjectStore((state) => state.resetSubjects);
  const setUpSubjects = useSubjectStore((state) => state.setUpSubjects);
  const setSetupSubjects = useSubjectStore((state) => state.setSetupSubjects);

  const gradeList = setUpData?.grade;
  const batchId = setUpData?.batch?.id || {};
  const user = useGlobalState((state) => state.user);
  const reLoginMutate = useReLogin();

  const subjectListApi = useMasterSubjectList({
    grade_number: gradeNumber,
  }) as SubjectListApiResponse;

  useEffect(() => {
    const formattedSubjectsArr = setUpData?.grade.map((grade) => ({
      grade: `Grade ${grade.grade_number}`,
      subjects: [],
    }));
    setSetupSubjects(formattedSubjectsArr);
  }, [setUpData?.grade]);

  const handleAddSubject = (values: any) => {
    const selectedSubjects = [...(values.normalSubjects || []), ...(values.languageSubjects || [])];

    if (selectedSubjects.length === 0) {
      return displayError('Please select at least one subject or language subject!');
    }

    const existingSubjects = (setUpSubjects.find((item: any) => item.grade === selectedGrade) as any)?.subjects || [];
    const duplicateSubjects = selectedSubjects.filter((subjectId) =>
      existingSubjects.some((subject: any) => subject.id === subjectId)
    );

    if (duplicateSubjects.length > 0) {
      return displayError('One or more selected subjects have already been added!');
    }

    const subjects = selectedSubjects
      .map((subjectId, index) => {
        const subject = subjectListApi.data?.list.find((s) => s.id === subjectId);

        return subject
          ? {
              id: subject?.id,
              statid: `${Date.now()}-${index}`,
              subject_name: subject.subject_name,
              subject_code: subject.subject_code,
              is_language: subject.is_language,
            }
          : null;
      })
      .filter(Boolean);

    const updatedSubjects: any = [...setUpSubjects];
    const existingGradeIndex = updatedSubjects.findIndex((item: any) => item?.grade === selectedGrade);

    if (existingGradeIndex !== -1) {
      updatedSubjects[existingGradeIndex] = {
        ...updatedSubjects[existingGradeIndex],
        subjects: [...updatedSubjects[existingGradeIndex].subjects, ...subjects],
      };
    } else {
      updatedSubjects.push({
        id: Date.now(),
        grade: selectedGrade,
        subjects: subjects,
      });
    }

    addSubject(updatedSubjects);
    form.resetFields();
    setOpenAddSubjectModal(false);
  };

  const handleDeleteSubject = (subjectId: number) => {
    const updatedSubjects = [...setUpSubjects];
    updatedSubjects.forEach((grade: any) => {
      const updatedGradeSubjects = grade.subjects.filter((subject: any) => subject?.statid !== subjectId);
      if (updatedGradeSubjects.length !== grade.subjects.length) {
        grade.subjects = updatedGradeSubjects;
      }
    });
    addSubject(updatedSubjects);
  };

  const handleSubmit = () => {
    if (setUpSubjects.some((grade: any) => grade.subjects && grade.subjects.length === 0)) {
      return displayError('Please select at least one subject for each grade');
    }

    const formattedData = {
      subjects: setUpSubjects.flatMap((gradeEntry: any) => {
        const gradeId = gradeList.find((grade) => `Grade ${grade.grade_number}` === gradeEntry.grade)?.id;

        return gradeEntry.subjects.map((subject: any) => ({
          master_subject_id: Number(subject.id),
          school_id: Number(schoolId),
          grade_id: Number(gradeId),
          batch_id: Number(batchId as Number),
        }));
      }),
    };

    multiSubjectMutation.mutate(formattedData, {
      onSuccess: () => {
        updateSetupStatusMutation.mutate(
          {
            step: 'ASSIGN_SUBJECTS',
            data: formattedData,
          },
          {
            onSuccess: () => {
              resetSubjects();
              reLoginMutate.mutate(
                {
                  user_id: Number(user?.id),
                },
                {
                  onSuccess: () => {
                    displaySuccess('Account setup completed');
                  },
                }
              );
            },
          }
        );
      },
    });
  };

  const extractGradeNumber = (grade: string): number | null => {
    const match = grade.match(/Grade\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  return (
    <>
      <div className="px-4">
        {setUpSubjects?.length > 0 &&
          setUpSubjects.map((item: any) => {
            return (
              <UIFormCardV2 key={item?.grade} title={item?.grade} description="" className="mb-5">
                <Card className="col-span-2">
                  <CardContent className="px-10 py-10 gap-4">
                    <div className="flex justify-end pb-5">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedGrade(item?.grade);
                          setOpenAddSubjectModal(true);
                          const gradeNumber = extractGradeNumber(item?.grade);
                          if (gradeNumber !== null) {
                            setGradeNumber(gradeNumber);
                          }
                        }}
                      >
                        <UIText>Add Subjects</UIText>
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <UIText>Subject</UIText>
                          </TableHead>
                          <TableHead>
                            <UIText>Code</UIText>
                          </TableHead>
                          <TableHead>
                            <UIText>Type</UIText>
                          </TableHead>
                          <TableHead>
                            <UIText>Action</UIText>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(item?.subjects) &&
                          item?.subjects.map((subject: any) => (
                            <TableRow key={subject?.id}>
                              <TableCell>{subject?.subject_name}</TableCell>
                              <TableCell>{subject?.subject_code}</TableCell>
                              <TableCell>{subject?.is_language ? 'Language' : 'Normal'}</TableCell>
                              <TableCell>
                                <TableDeleteBtn
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    return Modal.confirm({
                                      title: 'Delete Subject',
                                      centered: true,
                                      content: 'Are you sure you want to delete this subject?',
                                      onOk: () => handleDeleteSubject(subject?.statid),
                                    });
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </UIFormCardV2>
            );
          })}

        <div className="w-full bg-white border-t p-4">
          <div className="mx-auto text-right space-x-4">
            <UIFormSubmitButton onClick={handleSubmit} api={multiSubjectMutation}>
              Submit
            </UIFormSubmitButton>
          </div>
        </div>
      </div>
      <Modal
        title={`Add New Subject for ${selectedGrade}`}
        open={openAddSubjectModal}
        width={600}
        onCancel={() => {
          setOpenAddSubjectModal(false);
          form.resetFields();
        }}
        maskClosable={false}
        centered
        okText={
          <>
            <UIText>Add Subject</UIText>
          </>
        }
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSubject}
          initialValues={{ normalSubjects: [], languageSubjects: [] }}
        >
          <CustomFormItem label="Subjects" name="normalSubjects">
            <UIMultiSelect
              mode="multiple"
              showSearch
              options={[
                { label: 'Select All', value: 'all' }, // Add "Select All" option
                ...(subjectListApi.data?.list
                  .filter((subject) => !subject.is_language)
                  .map((subject) => ({
                    label: `${subject.subject_name} (${subject.subject_code})`,
                    value: subject.id,
                  })) || []),
              ]}
              placeholder="Select Subjects"
              filterOption={(input: any, option: any) =>
                option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
              onChange={(selectedValues: any) => {
                // Handle "Select All" logic
                if (selectedValues.includes('all')) {
                  const allNormalSubjectIds =
                    subjectListApi.data?.list.filter((subject) => !subject.is_language).map((subject) => subject.id) ||
                    [];
                  form.setFieldsValue({ normalSubjects: allNormalSubjectIds });
                } else {
                  form.setFieldsValue({ normalSubjects: selectedValues });
                }
              }}
            />
          </CustomFormItem>

          {/* <CustomFormItem label="Subjects" name="normalSubjects">
            <UIMultiSelect
              mode="multiple"
              showSearch
              filterOption={(input: any, option: any) =>
                option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
              }
              options={subjectListApi.data?.list
                .filter((subject) => !subject.is_language)
                .map((subject) => ({
                  label: `${subject.subject_name} (${subject.subject_code})`,
                  value: subject.id,
                }))}
              placeholder="Select Subjects"
            />
          </CustomFormItem> */}

          {/* <CustomFormItem label="Language Subjects" name="languageSubjects">
            <UIMultiSelect
              mode="multiple"
              options={subjectListApi.data?.list
                .filter((subject) => subject.is_language)
                .map((subject) => ({
                  label: `${subject.subject_name} (${subject.subject_code})`,
                  value: subject.id,
                }))}
              placeholder="Select Language Subjects"
              filterOption={(input: any, option: any) =>
                option?.label.toLowerCase().includes(input.toLowerCase()) || false
              }
            />
          </CustomFormItem> */}

          <CustomFormItem label="Language Subjects" name="languageSubjects">
            <UIMultiSelect
              mode="multiple"
              options={[
                { label: 'Select All', value: 'all' }, // Add Select All option
                ...(subjectListApi.data?.list
                  .filter((subject) => subject.is_language)
                  .map((subject) => ({
                    label: `${subject.subject_name} (${subject.subject_code})`,
                    value: subject.id,
                  })) || []),
              ]}
              placeholder="Select Language Subjects"
              filterOption={(input: any, option: any) =>
                option?.label.toLowerCase().includes(input.toLowerCase()) || false
              }
              onChange={(selectedValues: any) => {
                // Handle "Select All" logic
                if (selectedValues.includes('all')) {
                  const allLanguageSubjectIds =
                    subjectListApi.data?.list.filter((subject) => subject.is_language).map((subject) => subject.id) ||
                    [];
                  form.setFieldsValue({ languageSubjects: allLanguageSubjectIds });
                } else {
                  form.setFieldsValue({ languageSubjects: selectedValues });
                }
              }}
            />
          </CustomFormItem>

          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues.normalSubjects !== curValues.normalSubjects ||
              prevValues.languageSubjects !== curValues.languageSubjects
            }
          >
            {() => {
              const normalSubjects = form.getFieldValue('normalSubjects');
              const languageSubjects = form.getFieldValue('languageSubjects');

              return (
                <Form.Item
                  rules={[
                    {
                      validator: () => {
                        if (normalSubjects.length === 0 && languageSubjects.length === 0) {
                          return Promise.reject(new Error('Please select at least one subject or language subject!'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                />
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
