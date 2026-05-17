import { toast } from "react-toastify";

export const notify = {
  success: (msg: string) =>
    toast.success(msg, {
      position: "top-right",
      autoClose: 2500,
    }),

  error: (msg: string) =>
    toast.error(msg, {
      position: "top-right",
      autoClose: 3000,
    }),

  info: (msg: string) =>
    toast.info(msg, {
      position: "top-right",
    }),
};
