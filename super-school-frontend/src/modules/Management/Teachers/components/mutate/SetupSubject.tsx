import AppsContainer from '@/app/components/AppsContainer';
import UIFormItemSelect from '@/components/global/Form/v4/UIFormItem';
import UISelect from '@/components/global/Form/v4/UISelect';
import PageTitle from '@/components/global/PageTitle';
import { Button, Form, Select } from 'antd';
import { useState } from 'react';

const Setupsubject = () => {
  const [form] = Form.useForm();

  const [grades, setGrades] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const batches = ['Batch 1', 'Batch 2', 'Batch 3'];
  const gradeOptions = {
    'Batch 1': ['Grade 1', 'Grade 2'],
    'Batch 2': ['Grade 3', 'Grade 4'],
    'Batch 3': ['Grade 5', 'Grade 6'],
  };
  const classOptions = {
    'Grade 1': ['Class A', 'Class B'],
    'Grade 2': ['Class C', 'Class D'],
    'Grade 3': ['Class E', 'Class F'],
  };
  const subjectOptions = {
    'Class A': ['Math', 'Science'],
    'Class B': ['History', 'Geography'],
    'Class C': ['English', 'Art'],
  };

  const handleBatchChange = (value: keyof typeof gradeOptions) => {
    form.resetFields(['grade', 'class', 'subject']);
    setGrades(gradeOptions[value] || []);
    setClasses([]);
    setSubjects([]);
  };

  const handleGradeChange = (value: keyof typeof classOptions) => {
    form.resetFields(['class', 'subject']);
    setClasses(classOptions[value] || []);
    setSubjects([]);
  };

  const handleClassChange = (value: keyof typeof subjectOptions) => {
    form.resetFields(['subject']);
    setSubjects(subjectOptions[value] || []);
  };

  const handleSubmit = (values: any) => {
    console.log('Selected Values:', values);
  };

  return (
    <>
      <PageTitle
        breadcrumbs={[
          { label: 'Teacher List', href: '/teacher/list' },
          { label: 'Subject Setup', href: '/setupsubject' },
        ]}
      >
        Setup Subject
      </PageTitle>
      <AppsContainer title={' '} fullView={true} type="bottom" cardStyle={{ padding: '20px' }}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="grid md:grid-cols-4 gap-4">
            <UIFormItemSelect
              name="batch"
              label="Select Year"
              rules={[{ required: true, message: 'Please select a batch!' }]}
            >
              <UISelect placeholder="Select Year" onChange={handleBatchChange}>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </UISelect>
            </UIFormItemSelect>

            <UIFormItemSelect
              name="grade"
              label="Select Grade"
              rules={[{ required: true, message: 'Please select a grade!' }]}
            >
              <UISelect placeholder="Select Grade" onChange={handleGradeChange} disabled={!grades.length}>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </UISelect>
            </UIFormItemSelect>

            <Form.Item
              name="class"
              label="Select Class"
              rules={[{ required: true, message: 'Please select a class!' }]}
            >
              <Select placeholder="Select Class" onChange={handleClassChange} disabled={!classes.length}>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="subject"
              label="Select Subject"
              rules={[{ required: true, message: 'Please select a subject!' }]}
            >
              <Select placeholder="Select Subject" disabled={!subjects.length}>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item>
            <div className="flex justify-end">
              <Button className="p-4" type="primary" htmlType="submit" size="small">
                Submit
              </Button>
            </div>
          </Form.Item>
        </Form>
      </AppsContainer>
    </>
  );
};

export default Setupsubject;
