import { toast } from 'sonner';

export function displaySuccess(success: any) {
  if (typeof success === 'string') {
    return toast.success(success);
  } else if (Array.isArray(success)) {
    return success.map((err) => toast.success(err));
  } else if (typeof success === 'object') {
    toast.success(success);

    return Object.values(success).map((err) => toast.success(err as string));
  } else {
    return toast.success('Something went wrong, please try again later');
  }
}
