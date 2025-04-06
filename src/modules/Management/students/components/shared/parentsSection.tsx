import SelectGender from '@/components/global/Form/SelectGender';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Form, Input, Select, Upload } from 'antd';
import { UserPlus, X } from 'lucide-react';
import { useState } from 'react';

// Add this to your existing component's state
const ParentsSection = ({ form }: any) => {
  interface Student {
    id: number;
    isNew?: boolean;
    formKey?: string;
    isExisting?: boolean;
    firstName?: string;
    lastName?: string;
    grade?: string;
  }

  const [students, setStudents] = useState<Student[]>([]);
  // const [showAddStudent, setShowAddStudent] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Mock existing students - replace with your API call

  const handleUpload = ({ fileList }: any) => {
    setFileList(fileList);
  };

  // const addNewStudent = () => {
  //     const newStudent = {
  //         id: Date.now(),
  //         isNew: true,
  //         formKey: `student_${Date.now()}`, // Unique key for form fields
  //     };
  //     setStudents([...students, newStudent] as any);
  //     setShowAddStudent(false);
  // };

  const addExistingStudent = (student: any) => {
    setStudents([...students, { ...student, isExisting: true }] as any);
    // setShowAddStudent(false);
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
        <CardHeader className="lg:col-span-3  col-span-12">
          <CardTitle>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Parents Details
              </span>
              {/* {!showAddStudent && (
                                <Button
                                    onClick={() => setShowAddStudent(true)}
                                    className="flex items-center gap-2 rounded-full"
                                    size={"sm"}
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Add Parents
                                </Button>
                            )} */}
            </div>
          </CardTitle>
          <CardDescription>Enter the parents details of the students.</CardDescription>
        </CardHeader>
        <CardContent className="lg:col-span-9 col-span-12">
          <div className=" rounded-lg  lg:p-6">
            <div className="grid lg:grid-cols-1 gap-6">
              {/* Add Student Options */}
              {/* {showAddStudent && (
                                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                                    <div className="flex gap-4 mb-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1 p-2 h-auto"
                                            onClick={addNewStudent}
                                        >
                                            <div className="text-center">
                                                <UserPlus className="w-6 h-6 mx-auto mb-2" />
                                                <div className="font-medium">Add New Parents</div>
                                                <div className="text-sm text-gray-500">
                                                    Create a new parents profile
                                                </div>
                                            </div>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 p-2 h-auto"
                                            onClick={() => setActiveStudent("existing" as any)}
                                        >
                                            <div className="text-center">
                                                <User className="w-6 h-6 mx-auto mb-2" />
                                                <div className="font-medium">Link Existing Parents</div>
                                                <div className="text-sm text-gray-500">
                                                    Connect to registered parents
                                                </div>
                                            </div>
                                        </Button>
                                    </div>

                                    {activeStudent === "existing" && (
                                        <div className="border rounded-md p-4 bg-white">
                                            <h4 className="font-medium mb-3">
                                                Select Existing Parents
                                            </h4>
                                            <div>
                                                <div className="justify-center items-start">
                                                    <div className="relative">
                                                        <input type="text" className="h-14 w-96 pr-8 pl-5 rounded z-0 focus:shadow focus:outline-none" placeholder="Search anything..." />
                                                        <div className="absolute top-4 right-3">
                                                            <i className="fa fa-search text-gray-400 z-20 hover:text-gray-500"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {existingStudents.map((student) => (
                                                    <div
                                                        key={student.id}
                                                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                                        onClick={() => addExistingStudent(student)}
                                                    >
                                                        <div>
                                                            <div className="font-medium">
                                                                {student.firstName} {student.lastName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Grade: {student.grade}
                                                            </div>
                                                        </div>
                                                        <div className="text-gray-400">→</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )} */}

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
                        // Existing Student View
                        <Alert>
                          <AlertDescription>
                            Linked to existing Parents: {student.firstName} {student.lastName} - Grade: {student.grade}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        // New Student Form
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
                              {/* Add more grades as needed */}
                            </Select>
                          </Form.Item>

                          <SelectGender />
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-x-6 w-100">
                        <Button
                          type="submit"
                          onClick={() => {}}
                          className="flex items-center gap-2 rounded-full w-100"
                          size={'sm'}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* {students.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No Parents added yet. Click "Add Student" to begin.
                                </div>
                            )} */}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ParentsSection;
