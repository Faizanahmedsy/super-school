import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useListOption } from '@/hooks/use-select-option';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { useGradeList } from '@/services/master/grade/grade.hook';
import useGlobalState from '@/store';
import { Select } from 'antd';
import React from 'react';
import UIFormItemSelect from './v4/UIFormItem';
import UIText from '../Text/UIText';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

interface GradeSelectProps {
  name: string | (string | number)[];
  [key: string]: any;
  gradeName?: string;
  EditMode?: boolean;
  config?: {
    required?: boolean;
  };
}

const SelectGrade: React.FC<GradeSelectProps> = ({
  name,
  gradeName,
  disabled = false,
  EditMode,
  params = {},
  config = {},
  ...props
}) => {
  const cur_batch_id = useRoleBasedCurrentBatch();
  const batch_id: any = useGlobalState((state) => state.batch_id);
  const user = useGlobalState((state) => state.user);

  // Merge default params with optional params
  const queryParams = {
    ...(user?.role_name == ROLE_NAME.SUPER_ADMIN && {
      batch_id: cur_batch_id ? cur_batch_id : undefined,
    }),
    ...(user?.role_name != ROLE_NAME.SUPER_ADMIN && {
      batch_id: batch_id ? batch_id : cur_batch_id,
    }),
    checkStudent: false,
    ...params,
  };

  const { data: gradeListQuery, isLoading, error } = useGradeList(queryParams, Boolean(cur_batch_id));
  const setGradeId = useGlobalState((state) => state.setGradeId);

  const { options } = useListOption({
    listData: gradeListQuery?.list,
    labelKey: 'grade_number',
    valueKey: 'id',
  });

  const isDisabled = disabled;
  const isRequired = config.required !== false; // Defaults to true unless explicitly set to false

  return (
    <UIFormItemSelect
      label={<UIText>Select Grade</UIText>}
      name={name}
      rules={isRequired ? [{ required: true, message: requireMessage('grade', 'select') }] : []}
      initialValue={props.initialValue ? props.initialValue : undefined}
    >
      {isLoading ? (
        <Select placeholder="Loading Grade..." disabled />
      ) : (
        <Select
          placeholder="Select Grade"
          options={options}
          disabled={EditMode || user?.role_name == ROLE_NAME.STUDENT || user?.role_name == ROLE_NAME.PARENT}
          mode={gradeName == 'calendar' ? 'multiple' : undefined}
          onChange={(value: any) => {
            setGradeId(value);
          }}
        />
      )}
      {error && <Select placeholder="Error loading Grade" disabled />}
    </UIFormItemSelect>
  );
};

export default SelectGrade;
