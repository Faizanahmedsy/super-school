export const validationRules = {
  phoneNumber: [
    { required: true, message: 'Please enter a valid phone number' },
    { pattern: /^[0-9]{10,15}$/, message: 'Phone number must be 10 to 15 digits with no special characters.' },
  ],

  email: [
    { required: true, message: 'Please enter your email!' },
    { type: 'email', message: 'Please enter a valid email address!' },
  ],

  password: [
    { required: true, message: 'Please enter your password!' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      message: 'Password must be at least 8 characters with at least one letter and one number.',
    },
  ],

  username: [
    { required: true, message: 'Please enter a username!' },
    { pattern: /^[a-zA-Z0-9_]{5,20}$/, message: 'Username must be alphanumeric and 5 to 20 characters long.' },
  ],

  url: [{ type: 'url', message: 'Please enter a valid URL!' }],

  age: [
    { required: true, message: 'Please enter your age!' },
    { type: 'number', min: 18, max: 100, message: 'Age must be between 18 and 100.' },
  ],

  creditCard: [
    { required: true, message: 'Please enter your credit card number!' },
    { pattern: /^[0-9]{16}$/, message: 'Credit card number must be 16 digits.' },
  ],

  date: [
    { required: true, message: 'Please enter a date!' },
    { pattern: /^\d{4}-\d{2}-\d{2}$/, message: 'Date must be in YYYY-MM-DD format.' },
  ],

  zipCode: [
    { required: true, message: 'Please enter your ZIP code!' },
    { pattern: /^[0-9]{5,10}$/, message: 'ZIP code must be 5 to 10 digits.' },
  ],

  confirmPassword: (getFieldValue: any) => [
    { required: true, message: 'Please confirm your password!' },
    {
      validator: (_: any, value: any) =>
        value === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match!')),
    },
  ],

  decimalNumber: [{ pattern: /^\d+(\.\d{1,2})?$/, message: 'Value must be a number with up to 2 decimal places.' }],

  alphabetsOnly: [{ pattern: /^[A-Za-z]+$/, message: 'Only alphabets are allowed.' }],

  noSpecialCharacters: [{ pattern: /^[A-Za-z0-9 ]+$/, message: 'No special characters are allowed.' }],

  ipAddress: [
    {
      pattern:
        /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/,
      message: 'Please enter a valid IP address.',
    },
  ],

  hexColorCode: [{ pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message: 'Please enter a valid hex color code.' }],

  strongPassword: [
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.',
    },
  ],

  currency: [
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: 'Please enter a valid amount (up to 2 decimal places).',
    },
  ],
};
