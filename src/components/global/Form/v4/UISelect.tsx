import { Select } from 'antd';

export default function UISelect({ children, ...props }: any) {
  return (
    <Select className="ui-custom-select" {...props}>
      {children}
    </Select>
  );
}
