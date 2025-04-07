import { QueryParams } from '@/services/types/params';
import useRoleBasedAccess from '@/store/useRoleBasedAccess';
import { ROLE_NAME } from './helpers/authHelpers';

// export const buildQueryString = (params: QueryParams): string => {
//   console.log("params", params);
//   const filteredParams = Object.keys(params).filter(
//     (key) => params[key] !== undefined && params[key] !== null && params[key] !== ''
//   );

//   if (filteredParams.length === 0) {
//     return '';
//   }

//   return '?' + filteredParams.map((key) => `${key}=${encodeURIComponent(params[key]!.toString())}`).join('&');
// };

export const buildQueryString = (params: QueryParams): string => {
  const filteredParams = Object.keys(params).filter(
    (key) => params[key] !== undefined && params[key] !== null && params[key] !== ''
  );

  if (filteredParams.length === 0) {
    return '';
  }

  const queryParts: string[] = [];
  filteredParams.forEach((key) => {
    const value = params[key];
    if (Array.isArray(value)) {
      // Handle array values by creating multiple key=value pairs
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          queryParts.push(`${key}=${encodeURIComponent(item.toString())}`);
        }
      });
    } else {
      // Handle single values
      queryParts.push(`${key}=${encodeURIComponent(value!.toString())}`);
    }
  });

  return '?' + queryParts.join('&');
};

type Action = 'add' | 'edit' | 'view' | 'delete';

const canPerformAction = (moduleName: string, action: Action): boolean => {
  const { permissions } = useRoleBasedAccess.getState();

  const modulePermission = permissions.find((perm) => {
    const permModuleName = toLowercaseNoSpaces(perm.module.module_name_show);
    return permModuleName === toLowercaseNoSpaces(moduleName);
  });
  return modulePermission ? modulePermission.allow[action] : false;
};

export function capitalizeFirstLetter(input: string | undefined): string {
  if (!input) return ''; // Handle empty or undefined input
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export function capitalizeFirstLetterForBothWords(input: string | undefined): string {
  if (!input) return '';
  return input.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

export default canPerformAction;

export function convertToCamelCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word: string, index: number) => {
      if (index === 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
}

export function formatString(input: string): string {
  return input
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function removeEmptyQuotes(str: string): string {
  return str.replace(/""/g, '');
}

export function formatRole(role: string | undefined | null): string {
  if (role === ROLE_NAME.DEPARTMENT_OF_EDUCATION) {
    return 'Department Admin';
  }
  if (!role) {
    return '';
  }
  return role
    .split('_') // Split by underscores
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(' '); // Join with spaces
}

export const formatRoleName = (roleName: any): string => {
  return roleName
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function toLowercaseNoSpaces(input: any) {
  return input.toLowerCase().replace(/[\s-]+/g, '');
}

/**
 * Formats a given term string into a readable format.
 * Examples:
 * - `TERM1` -> `Term 1`
 * - `TERM_1` -> `Term 1`
 * - `Term1` -> `Term 1`
 *
 * @param {string} input - The input term string.
 * @returns {string} - The formatted term string.
 */
export function formatTerm(input: string): string {
  // Handle empty input
  if (!input || input.trim().length === 0) return '';

  // Normalize the input: replace underscores, split camelCase, add spaces before numbers
  const normalizedInput = input
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(\d+)/g, ' $1')
    .trim();

  // Capitalize each word
  return normalizedInput
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatDate(date: any) {
  const day = String(date?.getDate()).padStart(2, '0');
  const month = String(date?.getMonth() + 1).padStart(2, '0');
  const year = date?.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatTime(date: any) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 12 AM/PM case
  return `${hours}:${minutes} ${ampm}`;
}
export function convertToCommaSeparatedString(numbers: string[]): string {
  if (numbers.length === 0) return numbers[0];
  return numbers.join(',');
}

export function formatTimeOnly(date: any) {
  // Ensure the input is a valid Date object
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date provided');
  }

  // Extract hours and minutes
  const hours = parsedDate.getUTCHours(); // Use getUTCHours for UTC time
  const minutes = parsedDate.getUTCMinutes();

  // Format hours and minutes as two digits
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
}

export const calculateExamDuration = (startTimeStr: string, endTimeStr: string): string => {
  // Parse the input strings as UTC dates
  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  // Calculate the difference in milliseconds
  const durationInMs = endTime.getTime() - startTime.getTime();

  if (durationInMs === 0) {
    return '0 Hours 0 Minutes'; // Same start and end time
  }

  if (durationInMs < 0) {
    return 'Invalid time range'; // End time is earlier than start time
  }

  // Convert milliseconds to hours and minutes
  const hours = Math.floor(durationInMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));

  // Build the output string
  if (minutes === 0) {
    return `${hours} Hours`;
  } else if (hours === 0) {
    return `${minutes} Minutes`;
  } else {
    return `${hours} Hours ${minutes} Minutes`;
  }
};

/**
 * Checks if the given data is a non-empty array.
 *
 * @template T - The type of elements in the array.
 * @param {T[] | undefined | null} data - The input to check.
 * @returns {data is T[]} - `true` if the input is a valid, non-empty array; otherwise, `false`.
 *
 * @example
 * isNonEmptyArray([1, 2, 3]); // true
 * isNonEmptyArray([]); // false
 * isNonEmptyArray(null); // false
 */

// Here T is a typescript generic type. It is a placeholder for the type of elements in the array.
export function isNonEmptyArray<T>(data: T[] | undefined | null): data is T[] {
  return Array.isArray(data) && data.length > 0;
}

export const formatDuration = (duration: any) => {
  if (!duration) return 'N/A'; // Handle cases where duration is undefined or null
  const [hours, minutes] = duration.split(':').map(Number); // Split the duration into hours and minutes
  if (hours > 0 && minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};

type Duration = {
  years: number;
  months: number;
  days: number;
};

export function calculateDurationFromDate(dateString: string): Duration {
  const today = new Date(); // Current date
  const inputDate = new Date(dateString); // Parse the provided date string

  if (isNaN(inputDate.getTime())) {
    throw new Error('Invalid date format');
  }

  let years = today.getFullYear() - inputDate.getFullYear();
  let months = today.getMonth() - inputDate.getMonth();
  let days = today.getDate() - inputDate.getDate();

  // Adjust for negative days
  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of the previous month
    days += previousMonth.getDate();
  }

  // Adjust for negative months
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export const getTimeFromISO = (isoDate: any) => {
  const date = new Date(isoDate);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const renderData = (data: any) => {
  if (data === undefined || data === null || data === '') {
    return '-';
  }
  return data;
};
