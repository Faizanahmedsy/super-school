import { useListOption } from '@/hooks/use-select-option';
import { useSubjectList } from '@/modules/Master/subject/subject.action';
import useGlobalState from '@/store';
import { Form, Select } from 'antd';
import React from 'react';
import UISelect from './v4/UISelect';

interface SubjectSelectProps {
  subjectName: string | (string | number)[]; // Used for Form.Item name
  useMasterId?: boolean;
}

const SelectSubject: React.FC<SubjectSelectProps> = ({ subjectName, useMasterId = true }) => {
  const batch_id: any = useGlobalState((state) => state.batch_id);
  const grade_id: any = useGlobalState((state) => state.grade_id);
  const term_id: any = useGlobalState((state) => state.term_id);

  const { data, isLoading, error } = useSubjectList({ batch_id: batch_id, grade_id: grade_id, term_id: term_id });

  // Create a properly formatted subject list
  const subjectList =
    data?.subjects.map((subject: any) => ({
      label: subject?.master_subject?.subject_name,
      value: useMasterId ? subject?.master_subject?.id : subject?.id,
    })) || [];

  // Pass the list to useListOption
  const { options } = useListOption({
    listData: subjectList,
    labelKey: 'label',
    valueKey: 'value',
  });

  if (isLoading) {
    return (
      <Form.Item
        label="Select Subject"
        name={subjectName} // Connects the form state to the component
      >
        <Select placeholder="Loading Subject..." disabled />
      </Form.Item>
    );
  }

  if (error) {
    return (
      <Form.Item
        label="Select Subject"
        name={subjectName} // Connects the form state to the component
      >
        <Select placeholder="Error loading subject" disabled />
      </Form.Item>
    );
  }

  return (
    <Form.Item
      label="Select Subject"
      name={subjectName} // Connects the form state to the component
      rules={[{ required: true, message: 'Subject Name is required' }]}
    >
      <UISelect
        placeholder="Search and select a subject"
        options={options}
        showSearch
        filterOption={
          (input: any, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) // Matches input with subject name
        }
        allowClear // Allows clearing the selection
      />
    </Form.Item>
  );
};

export default SelectSubject;
