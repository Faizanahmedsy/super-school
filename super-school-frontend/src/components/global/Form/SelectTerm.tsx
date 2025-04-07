import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { formatTerm } from '@/lib/common-functions';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { useTermList } from '@/services/master/term/term.action';
import useGlobalState from '@/store';
import { Select } from 'antd';
import React from 'react';
import UIText from '../Text/UIText';
import UIFormItemSelect from './v4/UIFormItem';

interface GradeSelectProps {
  name: string | (string | number)[];
  [key: string]: any;
}

const SelectTerm: React.FC<GradeSelectProps> = ({ name, ...props }) => {
  const cur_batch_id = useRoleBasedCurrentBatch();
  const setTermId = useGlobalState((state) => state.setTermId);
  // const batch_id: any = useGlobalState((state) => state.batch_id);
  const batch_id: any = useRoleBasedCurrentBatch();
  const { data: termListQuery, isLoading, error } = useTermList({ batch_id: batch_id ? batch_id : cur_batch_id });

  if (isLoading) {
    return (
      <UIFormItemSelect label="Select Term" name={name}>
        <Select placeholder="Loading Term..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label="Select Term" name={name}>
        <Select placeholder="Error loading term" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <UIFormItemSelect
      label={<UIText>Select Term</UIText>}
      name={name}
      rules={[{ required: true, message: requireMessage('term', 'select') }]}
      initialValue={props.initialValue ? props.initialValue : undefined}
    >
      <Select
        placeholder="Select Term"
        allowClear
        options={
          termListQuery?.list?.map((term: { term_name: string; id: string }) => ({
            label: formatTerm(term.term_name),
            value: term.id,
          })) ?? []
        }
        onChange={(value) => {
          setTermId(value);
        }}
        // filterOption={(input, option) =>
        //   (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        // }
      />
    </UIFormItemSelect>
  );
};

export default SelectTerm;
