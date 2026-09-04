import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const notify = {
  success(message: string) {
    toast.success(message);
  },
  error(error: unknown, fallback = "Something went wrong. Please try again.") {
    toast.error(getErrorMessage(error, fallback));
  },
  info(message: string) {
    toast.message(message);
  },
};
