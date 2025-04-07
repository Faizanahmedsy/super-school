import { toast } from 'sonner';

export function displayError(error: any) {
  if (typeof error === 'string') {
    return toast.error(error);
  } else if (Array.isArray(error)) {
    error.forEach((err) => {
      if (err?.errors) {
        toast.error(err.errors);
      } else {
        toast.error(err);
      }
    });
  } else if (typeof error === 'object' && error !== null) {
    // Iterate over the error object and include the field name in the toast message
    Object.entries(error).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((msg) => toast.error(`${field}: ${msg}`)); // Display each message with its field name
      } else {
        toast.error(`${field}: ${messages}`);
      }
    });
  } else {
    return toast.error('Something went wrong, please try again later');
  }
}
