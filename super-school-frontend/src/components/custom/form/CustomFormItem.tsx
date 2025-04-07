// import UIText from '@/components/global/Text/UIText';
// import { Form } from 'antd';
// import React from 'react';

// export default function CustomFormItem({
//   label,
//   children,
//   rules,
//   ...props
// }: {
//   label: string;
//   children: React.ReactNode;
//   rules?: Array<{ required?: boolean; message?: string; validator?: any; pattern?: any; type?: any }>;
//   [key: string]: any;
// }) {
//   // Modify the rules to wrap the message in UIText
//   const modifiedRules = rules?.map((rule) => {
//     if (rule.message) {
//       return {
//         ...rule,
//         message: <UIText>{rule.message}</UIText>,
//       };
//     }
//     return rule;
//   });

//   return (
//     <Form.Item label={<UIText>{label}</UIText>} rules={modifiedRules} {...props}>
//       {children}
//     </Form.Item>
//   );
// }

// import UIText from '@/components/global/Text/UIText';
// import { Form, Input } from 'antd';
// import React, { cloneElement, ReactElement } from 'react';

// export default function CustomFormItem({
//   label,
//   children,
//   rules,
//   ...props
// }: {
//   label: string;
//   children: React.ReactNode;
//   rules?: Array<{ required?: boolean; message?: string; validator?: any; pattern?: any; type?: any }>;
//   [key: string]: any;
// }) {
//   const modifiedRules = rules?.map((rule) => ({
//     ...rule,
//     message: rule.message ? <UIText>{rule.message}</UIText> : undefined,
//   }));

//   const modifiedChildren = React.Children.map(children, (child) => {
//     if (React.isValidElement(child) && child.type === Input) {
//       const translatedPlaceholder = <UIText>{child.props.placeholder}</UIText>;

//       return cloneElement(child as ReactElement, {
//         placeholder: child.props.placeholder,
//       });
//     }
//     return child;
//   });

//   return (
//     <Form.Item label={<UIText>{label}</UIText>} rules={modifiedRules} {...props}>
//       {modifiedChildren}
//     </Form.Item>
//   );
// }

import UIMultiSelect from '@/components/global/Form/v4/UIMultiSelect';
import UISelect from '@/components/global/Form/v4/UISelect';
import UIText from '@/components/global/Text/UIText';
import { DatePicker, Form, Input, Select, TimePicker } from 'antd';
import React, { cloneElement, ReactElement } from 'react';
import { useIntl } from 'react-intl'; // Import useIntl

export default function CustomFormItem({
  label,
  children,
  rules,
  ...props
}: {
  label: string;
  children: React.ReactNode;
  rules?: Array<{ required?: boolean; message?: string; validator?: any; pattern?: any; type?: any }>;
  [key: string]: any;
}) {
  const intl = useIntl(); // Get the intl instance

  const modifiedRules = rules?.map((rule) => ({
    ...rule,
    message: rule.message ? <UIText>{rule.message}</UIText> : undefined,
  }));

  const modifiedChildren = React.Children.map(children, (child) => {
    if (
      React.isValidElement(child) &&
      (child.type == Input.TextArea ||
        child.type == Input ||
        child.type == DatePicker ||
        child.type == Select ||
        child.type == TimePicker ||
        child.type == UISelect ||
        child.type == UIMultiSelect)
    ) {
      const placeholderText = child.props.placeholder;

      // Use formatMessage to get the translated string
      const translatedPlaceholder = placeholderText ? intl.formatMessage({ id: placeholderText }) : '';

      return cloneElement(child as ReactElement, {
        placeholder: translatedPlaceholder,
      });
    }
    return child;
  });

  return (
    <Form.Item label={<UIText>{label}</UIText>} rules={modifiedRules} {...props}>
      {modifiedChildren}
    </Form.Item>
  );
}
