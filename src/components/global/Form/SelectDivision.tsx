import { useListOption } from '@/hooks/use-select-option';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { useDivisionList } from '@/services/master/division/division.hook';
import useGlobalState from '@/store';
import { Form, Select } from 'antd';
import React from 'react';
import UIMultiSelect from './v4/UIMultiSelect';
import UIFormItemSelect from './v4/UIFormItem';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UIText from '../Text/UIText';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

interface BatchSelectProps {
  name: number | string | unknown | undefined;
  initialValue?: any;
  disabled?: boolean;
  // filterSubjectId?: number;
  params?: any;
  typeSelect?: string;
  EditMode?: boolean;
}

const DivisionSelect: React.FC<BatchSelectProps> = ({
  name,
  initialValue,
  disabled,
  // filterSubjectId,
  typeSelect,
  EditMode,
  params = {},
}) => {
  const grade_id: any = useGlobalState((state) => state.grade_id);
  const user = useGlobalState((state) => state.user);

  const queryParams = {
    grade_id:
      user?.role_name === ROLE_NAME.PARENT || user?.role_name === ROLE_NAME.STUDENT
        ? user?.details.grade?.id
        : grade_id,
    // subject_id: filterSubjectId,
    sort: 'asc',
    ...params,
  };

  const { data, isLoading, error } = useDivisionList(queryParams, Boolean(true));
  const { options } = useListOption({
    listData: data?.list,
    labelKey: 'name',
    valueKey: 'id',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label={<UIText>Select Class</UIText>}>
        <Select placeholder="Loading Class..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label={<UIText>Select Class</UIText>}>
        <Select placeholder="Error loading Class" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <>
      {typeSelect == 'single' ? (
        <UIFormItemSelect
          label={<UIText>Select Class</UIText>}
          name={name}
          initialValue={initialValue ? initialValue : undefined}
        >
          <Select
            disabled={disabled || user?.role_name == ROLE_NAME.STUDENT || user?.role_name == ROLE_NAME.PARENT}
            options={options}
            placeholder="Select Class"
          />
        </UIFormItemSelect>
      ) : (
        <UIFormItemSelect
          label={<UIText>Select Class</UIText>}
          name={name}
          rules={[{ required: true, message: requireMessage('class', 'select') }]}
          initialValue={initialValue ? initialValue : undefined}
        >
          <UIMultiSelect disabled={disabled || EditMode} mode="multiple" options={options} placeholder="Select Class" />
        </UIFormItemSelect>
      )}
    </>
  );
};

export default DivisionSelect;
