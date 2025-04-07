import UIFormItemSelect from '@/components/global/Form/v4/UIFormItem';
import UIText from '@/components/global/Text/UIText';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useListOption } from '@/hooks/use-select-option';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { cn } from '@/lib/utils';
import { useDivisionSubjectList } from '@/modules/Master/subject/subject.action';
import useGlobalState from '@/store';
import { Form, Select } from 'antd';
import React from 'react';
import styled from 'styled-components';

// Styled Form.Item with error styles
export const StyledFormItem = styled(Form.Item)`
  &.ant-form-item-has-error {
    .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input) {
      .ant-select-selector {
        border-color: #ff4d4f !important;
        background-color: #fff1f0;
      }
      &.ant-select-focused .ant-select-selector {
        border-color: #ff7875 !important;
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
        outline: 0;
      }
      &:hover .ant-select-selector {
        border-color: #ff7875 !important;
      }
    }
  }

  .ant-form-item-explain-error {
    color: #ff4d4fd6;
    font-size: 12px;
    margin-top: 10px;
  }
`;

interface SubjectSelectProps {
  subjectName: string | (string | number)[];
  disabled: boolean;
  onSubjectChange?: (value: { subjectName: string; subjectId: string | number }) => void;
}

const AssessmentSelectSubject: React.FC<SubjectSelectProps> = ({ subjectName, disabled, onSubjectChange }) => {
  const user = useGlobalState((state) => state.user);
  const cur_batch_id = useRoleBasedCurrentBatch();
  const form = Form.useFormInstance();
  const filterData = useGlobalState((state) => state.filterData);
  const term_id: any = useGlobalState((state) => state.term_id);
  const grade_id: any = useGlobalState((state) => state.grade_id);
  const batch_id: any = useGlobalState((state) => state.batch_id);

  const { data, isLoading, error } = useDivisionSubjectList({
    ...(user?.role_name == ROLE_NAME.SUPER_ADMIN && {
      batch_id: cur_batch_id ? cur_batch_id : undefined,
    }),
    ...(user?.role_name != ROLE_NAME.SUPER_ADMIN && {
      batch_id: filterData?.batch?.id && filterData?.batch?.id != 'null' ? filterData?.batch?.id : batch_id,
    }),
    grade_id: filterData?.grade?.id && filterData?.grade?.id != 'null' ? filterData?.grade?.id : grade_id,
    term_id: filterData?.term?.id && filterData?.term?.id != 'null' ? filterData?.term?.id : term_id,
    checkStudent: true,
  });

  const subjectList =
    data?.list.map((subject: any) => ({
      label: subject?.master_subject?.subject_name,
      value: subject?.subject_id,
    })) || [];

  const { options } = useListOption({
    listData: subjectList,
    labelKey: 'label',
    valueKey: 'value',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label="Select Subject" name={subjectName}>
        <Select placeholder="Loading Subject..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label="Select Subject" name={subjectName}>
        <Select placeholder="Error loading subject" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <UIFormItemSelect
      label={
        <>
          <UIText>Select Subject</UIText>
        </>
      }
      name={subjectName}
      rules={[
        {
          required: true,
          message: requireMessage('subject', 'select'),
          validateTrigger: ['onChange', 'onBlur'],
        },
      ]}
    >
      <Select
        placeholder="Search and select a subject"
        options={options}
        disabled={disabled}
        showSearch
        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        allowClear
        onChange={(value, option: any) => {
          const selectedSubject = {
            subjectName: option?.label,
            subjectId: value,
          };
          onSubjectChange?.(selectedSubject);
        }}
        status={form.getFieldError(subjectName)?.length > 0 ? 'error' : ''}
      />
    </UIFormItemSelect>
  );
};

export default AssessmentSelectSubject;
