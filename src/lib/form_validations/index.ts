export const validatePasswordHelper = (_: any, value: string) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&`])[A-Za-z\d@$!%*?&`]{6,}$/;

  if (!value) {
    return Promise.reject(new Error('Please enter your password'));
  } else if (!passwordRegex.test(value)) {
    return Promise.reject(
      new Error(
        'Password must be at least 6 characters long, include at least 1 number, 1 special character, 1 uppercase letter, and 1 lowercase letter.'
      )
    );
  }
  return Promise.resolve();
};
