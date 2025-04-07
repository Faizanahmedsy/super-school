const getItem = (key: string): any => {
  const data = typeof window !== 'undefined' ? localStorage.getItem(key) : '';

  try {
    return JSON.parse(data || '');
  } catch (err) {
    return data;
  }
};

const setItem = (key: string, value: any): void => {
  const stringify = typeof value !== 'string' ? JSON.stringify(value) : value;
  localStorage.setItem(key, stringify);
};

const removeItem = (key: string): void => {
  localStorage.removeItem(key);
};

export { getItem, setItem, removeItem };

// TODO: USE SECURE LOCAL STORAGE LATER

// ------------------------------------------------------------------------------------
// import secureLocalStorage from 'react-secure-storage';

// interface StorageItem {
//   [key: string]: any;
// }

// const getItem = (key: string): StorageItem | string | null => {
//   const data = typeof window !== 'undefined' ? secureLocalStorage.getItem(key) : '';

//   try {
//     return JSON.parse(data as string);
//   } catch (err) {
//     if (typeof data === 'string' || data === null) {
//       return data;
//     }
//     return JSON.stringify(data);
//   }
// };

// interface SetItem {
//   (key: string, value: any): void;
// }

// const setItem: SetItem = (key, value) => {
//   const stringify = typeof value !== 'string' ? JSON.stringify(value) : value;
//   return secureLocalStorage.setItem(key, stringify);
// };

// interface RemoveItem {
//   (key: string): void;
// }

// const removeItem: RemoveItem = (key) => {
//   secureLocalStorage.removeItem(key);
// };

// export { getItem, setItem, removeItem };
