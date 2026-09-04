import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const FRIENDLY_403 = "You don't have permission to perform this action.";

export const notify = {
  success(message: string) {
    toast.success(message);
  },
  error(error: unknown, fallback = "Something went wrong") {
    const message = getErrorMessage(error, fallback);
    const status = (error as { response?: { status?: number } })?.response?.status;
    toast.error(status === 403 ? FRIENDLY_403 : message);
  },
  message(message: string) {
    toast.message(message);
  },
};
