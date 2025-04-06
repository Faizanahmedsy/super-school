import SelectGender from '@/components/global/Form/SelectGender';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Form, Input, Select, Upload } from 'antd';
import { User, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

const StudentSection = ({ form }: any) => {
  interface Student {
    id: number;
    isNew?: boolean;
    formKey?: string;
    isExisting?: boolean;
    firstName?: string;
    lastName?: string;
    grade?: string;
  }

  const existingStudents = [
    { id: 1, firstName: 'John', lastName: 'Doe', grade: '10th' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', grade: '8th' },
  ];

  const [students, setStudents] = useState<Student[]>([]);
  const [__, setShowAddStudent] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const handleUpload = ({ fileList }: any) => {
    setFileList(fileList);
  };

  const addExistingStudent = () => {
    const newStudents = existingStudents.filter((student) => selectedStudents.includes(student.id));
    setStudents([...students, ...newStudents.map((student) => ({ ...student, isExisting: true }))]);
    setShowAddStudent(false);
    setSelectedStudents([]); // Clear selections
  };

  const removeStudent = (studentId: number) => {
    setStudents(students.filter((s) => s.id !== studentId));
    // Clear form fields for removed student
    const formValues = form.getFieldsValue();
    delete formValues[`student_${studentId}`];
    form.setFieldsValue(formValues);
  };

  return (
    <>
      <Card className={cn('grid grid-cols-12 lg:gap-8 lg:p-4 mt-10')}>
        <CardHeader className="lg:col-span-3 col-span-12">
          <CardTitle>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Learner Details
              </span>
            </div>
          </CardTitle>
          <CardDescription>Enter the student details of the parent.</CardDescription>
        </CardHeader>
        <CardContent className="lg:col-span-9 col-span-12">
          <div className="rounded-lg lg:p-6">
            <div className="grid lg:grid-cols-1 gap-6">
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="flex gap-4 mb-4">
                  <Button
                    variant="outline"
                    className="flex-1 p-2 h-auto"
                    onClick={() => setActiveStudent('existing' as any)}
                  >
                    <div className="text-center">
                      <User className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Link Existing Learner</div>
                      <div className="text-sm text-gray-500">Connect to registered student</div>
                    </div>
                  </Button>
                </div>

                {activeStudent === 'existing' && (
                  <div className="border rounded-md p-4 bg-white">
                    <h4 className="font-medium mb-3">Select Existing Students</h4>
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Select students"
                      value={selectedStudents}
                      onChange={setSelectedStudents}
                      style={{ width: '100%' }}
                      filterOption={(input, option) => {
                        const fullName = `${option?.firstName} ${option?.lastName}`.toLowerCase();
                        return fullName.includes(input.toLowerCase());
                      }}
                    >
                      {existingStudents.map((student) => (
                        <Select.Option
                          key={student.id}
                          value={student.id}
                          firstName={student.firstName}
                          lastName={student.lastName}
                        >
                          {student.firstName} {student.lastName} - Grade: {student.grade}
                        </Select.Option>
                      ))}
                    </Select>
                    {/* <Select
                      mode="multiple"
                      placeholder="Select students"
                      value={selectedStudents}
                      onChange={setSelectedStudents}
                      style={{ width: "100%" }}
                    >
                      {existingStudents.map((student) => (
                        <Select.Option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - Grade: {student.grade}
                        </Select.Option>
                      ))}
                    </Select> */}
                    <Button type="button" className="mt-4" onClick={addExistingStudent}>
                      Add Selected Learners
                    </Button>
                  </div>
                )}
              </div>

              {/* Students List */}
              <div className="space-y-4">
                {students.map((student) => (
                  <Card key={student.id} className="relative">
                    <div className="absolute right-2 top-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 h-8 w-8 p-0"
                        onClick={() => removeStudent(student.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-6">
                      {student.isExisting ? (
                        <Alert>
                          <AlertDescription>
                            Linked to existing learner: {student.firstName} {student.lastName} - Grade: {student.grade}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Form.Item label="Profile Image" name={[`student_${student.id}`, 'profile_image']}>
                            <Upload
                              listType="picture"
                              fileList={fileList}
                              onChange={handleUpload}
                              beforeUpload={() => false}
                            >
                              <Button type="button">Upload</Button>
                            </Upload>
                          </Form.Item>

                          <Form.Item
                            label="First Name"
                            name={[`student_${student.id}`, 'firstName']}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter first name',
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item
                            label="Last Name"
                            name={[`student_${student.id}`, 'lastName']}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter last name',
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item
                            label="Learner ID"
                            name={[`student_${student.id}`, 'student_id']}
                            rules={[{ required: true, message: 'Please enter id' }]}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item
                            label="Email"
                            name={[`student_${student.id}`, 'email']}
                            rules={[
                              { required: true, message: 'Please enter email' },
                              {
                                type: 'email',
                                message: 'Please enter a valid email',
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item
                            label="Mobile Number"
                            name={[`student_${student.id}`, 'mobile_number']}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter mobile number',
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item
                            label="Grade"
                            name={[`student_${student.id}`, 'grade']}
                            rules={[
                              {
                                required: true,
                                message: 'Please select grade',
                              },
                            ]}
                          >
                            <Select>
                              <Select.Option value="1">Grade 1</Select.Option>
                              <Select.Option value="2">Grade 2</Select.Option>
                              <Select.Option value="3">Grade 3</Select.Option>
                            </Select>
                          </Form.Item>

                          <SelectGender />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default StudentSection;
