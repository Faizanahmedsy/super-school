import { useListOption } from '@/hooks/use-select-option';
import { useCityList } from '@/services/city/city.hook';
import { Select } from 'antd';
import UIFormItemSelect from './v4/UIFormItem';
import { requireMessage } from '@/lib/form_validations/formmessage';
import UIText from '../Text/UIText';
import CustomFormItem from '@/components/custom/form/CustomFormItem';
import UISelect from './v4/UISelect';

export function SelectCity({ state_id, ...props }: { state_id?: number }) {
  const { data, isLoading, error } = useCityList({ state_id });

  const { options } = useListOption({
    listData: data,
    labelKey: 'district_name',
    valueKey: 'id',
  });

  if (isLoading) {
    return (
      <UIFormItemSelect label="Select District" name="district_id" {...props}>
        <UISelect placeholder="Loading cities..." disabled />
      </UIFormItemSelect>
    );
  }

  if (error) {
    return (
      <UIFormItemSelect label="Select District" name="district_id" {...props}>
        {' '}
        <UISelect placeholder="Error loading cities" disabled />
      </UIFormItemSelect>
    );
  }

  return (
    <UIFormItemSelect
      label="Select District"
      name="district_id"
      {...props}
      rules={[{ required: true, message: requireMessage('district', 'select') }]}
    >
      <UISelect placeholder="Select a District" options={options} {...props} />
    </UIFormItemSelect>
  );
}
