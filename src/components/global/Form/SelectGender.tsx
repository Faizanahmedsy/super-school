// import { cn } from "@/lib/utils";
// import { Form, Radio } from "antd";
// import { RadioChangeEvent } from "antd/lib";
// import { useState } from "react";

// export default function SelectGender({ ...props }: any) {
//   const [selectedValue, setSelectedValue] = useState<string>();

//   const handleChange = (e: RadioChangeEvent) => {
//     setSelectedValue(e.target.value);
//   };

//   const options: {
//     label: string;
//     value: string;
//   }[] = [
//     { label: "Male", value: "male" },
//     { label: "Female", value: "female" },
//   ];

//   return (
//     <Form.Item label="Select Gender" name="gender" {...props}>
//       <Radio.Group onChange={handleChange} value={selectedValue}>
//         {options.map((option) => (
//           <Radio.Button
//             key={option.value}
//             value={option.value}
//             className={cn(
//               "bg-slate-50 text-gray-700 hover:bg-secondary hover:text-primary",
//               selectedValue === option.value && "bg-primary text-white"
//             )}
//           >
//             {option.label}
//           </Radio.Button>
//         ))}
//       </Radio.Group>
//     </Form.Item>
//   );
// }

import { Select } from 'antd';
import { useState } from 'react';
import UIFormItemSelect from './v4/UIFormItem';
import UISelect from './v4/UISelect';
import UIText from '../Text/UIText';

export default function SelectGender({ ...props }: any) {
  const [selectedValue, setSelectedValue] = useState<string>();

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };

  return (
    <UIFormItemSelect label={<UIText>Gender</UIText>} name="gender" {...props}>
      <UISelect value={selectedValue} onChange={handleChange} placeholder="Select gender" allowClear>
        <Select.Option value="male">
          <UIText>Male</UIText>
        </Select.Option>
        <Select.Option value="female">
          <UIText>Female</UIText>
        </Select.Option>
        <Select.Option value="other">
          <UIText>Other</UIText>
        </Select.Option>
      </UISelect>
    </UIFormItemSelect>
  );
}
