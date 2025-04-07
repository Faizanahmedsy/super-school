import { Select } from 'antd';

export default function UIMultiSelect({ children, ...props }: any) {
  return (
    <Select
      showSearch
      filterOption={(input, option) =>
        typeof option?.label === 'string' ? option.label.toLowerCase().includes(input.toLowerCase()) : false
      }
      mode="multiple"
      className="ui-custom-multi-select"
      {...props}
      allowClear
    ></Select>
  );
}
