import { useListOption } from '@/hooks/use-select-option';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { cn } from '@/lib/utils';
import { useBatchList } from '@/services/assessments/assessments.hook';
import useGlobalState from '@/store';
import { Select } from 'antd';
import React from 'react';
import UIFormItemSelect from './v4/UIFormItem';
import { requireMessage } from '@/lib/form_validations/formmessage';
import UIText from '../Text/UIText';

interface BatchSelectProps {
  name: string;
  [key: string]: any;
}

const BatchSelect: React.FC<BatchSelectProps> = ({ name, ...props }) => {
  const setBatchId = useGlobalState((state) => state.setBatchId);

  const school_id = useRoleBasedSchoolId();

  const { data, isLoading, error } = useBatchList({ school_id: Number(school_id) });

  const { options } = useListOption({
    listData: data?.list,
    labelKey: 'start_year',
    valueKey: 'id',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label={<UIText>{props.disabled ? 'Select a Year (Auto Selected)' : 'Select an year'}</UIText>}>
        <Select placeholder="Loading batches..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label={<UIText>{props.disabled ? 'Select a Year (Auto Selected)' : 'Select an year'}</UIText>}>
        <Select placeholder="Error loading batches" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <>
      <UIFormItemSelect
        label={<UIText>{props.disabled ? 'Select a Year (Auto Selected)' : 'Select an year'}</UIText>}
        name={name}
        rules={[{ required: true, message: requireMessage('year', 'select') }]}
      >
        <Select
          {...props}
          className={cn(props.disabled && '')}
          placeholder={'Select an year'}
          options={options}
          onChange={(value) => {
            setBatchId(value);
          }}
        />
      </UIFormItemSelect>
    </>
  );
};

export default BatchSelect;
