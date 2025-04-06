import React from 'react';

/**
 * A component that renders a nullable string or a list of strings.
 * Handles cases for null, undefined, empty strings, single strings,
 * and arrays of strings. It displays `-` if the value is not provided
 * or is empty. If the value is a list of strings, it displays them
 * as a comma-separated list.
 *
 * @param {Object} props - The props for the component.
 * @param {string | string[] | null | undefined} props.value - The value to display.
 *
 * @returns {JSX.Element} A div displaying the value or a fallback.
 */
interface StringValueProps {
  value?: string | string[] | null | any; // Value can be a string, array of strings, undefined, or null
}

const RenderNullableValue: React.FC<StringValueProps> = ({ value }) => {
  // Handle null, undefined, and empty string but allow 0
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return <div>-</div>;
  }

  // Handle array of strings or numbers
  if (Array.isArray(value)) {
    return <div>{value.join(', ')}</div>;
  }

  // Display the value directly for numbers (including 0) and strings
  return <div>{value}</div>;
};

export const ShowData = ({ children }: { children: React.ReactNode }) => {
  // Handle cases where value is null, undefined, or an empty string
  if (children === undefined || children === null || (typeof children === 'string' && children.trim() === '')) {
    return <div>-</div>;
  }

  // Handle case where value is an array of strings (e.g., a list of names)
  if (Array.isArray(children)) {
    // Join the array into a single string, separated by commas
    return <div>{children.join(', ')}</div>;
  }

  // Handle all other cases
  return <div>{children}</div>;
};

export default RenderNullableValue;
