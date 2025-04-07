import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { useListOption } from '@/hooks/use-select-option';
import { requireMessage } from '@/lib/form_validations/formmessage';
import { useStateList } from '@/services/state/state.hook';
import UIFormItemSelect from './v4/UIFormItem';
import UISelect from './v4/UISelect';

export function SelectState({ onChange, ...props }: { onChange: (value: number) => void }) {
  const schoolId = useRoleBasedSchoolId();

  const { data, isLoading, error } = useStateList({
    school_id: Number(schoolId),
  });
  const { options } = useListOption({
    listData: data,
    labelKey: 'province_name',
    valueKey: 'id',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label="Select Province" name="province_id" {...props}>
        <UISelect placeholder="Loading provinces..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label="Select Province" name="province_id" {...props}>
        <UISelect placeholder="Error loading provinces" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <UIFormItemSelect
      label="Select Province"
      name="province_id"
      {...props}
      rules={[{ required: true, message: requireMessage('province', 'select') }]}
    >
      <UISelect placeholder="Select a Province" options={options} onChange={(value: any) => onChange(value)} />
    </UIFormItemSelect>
  );
}
