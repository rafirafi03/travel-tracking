import { toast, Id } from "react-toastify";

export const successToast = (message: string) => {
  toast.success(message);
};

export const errorToast = (message: string) => {
  toast.error(message);
};

export const loadingToast = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: Id) => {
  toast.dismiss(toastId);
};

export const warningToast = (message: string) => {
  return toast.warning(message)
}
