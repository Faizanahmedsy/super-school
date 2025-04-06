import { Form, Select } from 'antd';
import UIText from '../../Text/UIText';
import React, { cloneElement, ReactElement } from 'react';
import { useIntl } from 'react-intl';
import UISelect from './UISelect';
import UIMultiSelect from './UIMultiSelect';

export default function UIFormItemSelect({ children, rules, label, ...props }: any) {
  const intl = useIntl();
  const modifiedRules = rules?.map((rule: any) => ({
    ...rule,
    message: rule.message ? <UIText>{rule.message}</UIText> : undefined,
  }));

  const modifiedChildren = React.Children.map(children, (child) => {
    if (
      React.isValidElement(child) &&
      (child.type == UISelect || child.type == Select || child.type == UIMultiSelect)
    ) {
      const placeholderText = (child as ReactElement<any>).props.placeholder;

      // Use formatMessage to get the translated string
      const translatedPlaceholder = placeholderText ? intl.formatMessage({ id: placeholderText }) : '';

      return cloneElement(child as ReactElement, {
        placeholder: translatedPlaceholder, // Now a string
      });
    }
    return child;
  });

  return (
    <Form.Item label={<UIText>{label}</UIText>} className="custom-select" rules={modifiedRules} {...props}>
      {modifiedChildren}
    </Form.Item>
  );
}
