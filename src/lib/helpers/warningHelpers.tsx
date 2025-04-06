import { toast } from 'sonner';

export function displayWarning(success: any) {
  if (typeof success === 'string') {
    return toast.warning(success);
  } else if (Array.isArray(success)) {
    return success.map((err) => toast.warning(err));
  } else if (typeof success === 'object') {
    toast.warning(success);

    return Object.values(success).map((err) => toast.warning(err as string));
  } else {
    return toast.warning('Something went wrong, please try again later');
  }
}
