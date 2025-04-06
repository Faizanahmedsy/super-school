export const isRequestSuccessful = (code: number) => {
  return code >= 200 && code <= 204;
};

export const isEmptyObject = (obj = {}) => {
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj?.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};
