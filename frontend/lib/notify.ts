import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const FRIENDLY_403 = "You don't have permission to do that.";

type FeedbackOptions = {
  description?: string;
};

export const notify = {
  success(title: string, options?: FeedbackOptions) {
    toast.success(title, {
      description: options?.description,
      duration: 3500,
    });
  },
  error(error: unknown, fallback = "Something went wrong. Please try again.") {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const message = status === 403 ? FRIENDLY_403 : getErrorMessage(error, fallback);
    toast.error(message, {
      description: status === 403 ? "Ask the board owner if you need access." : undefined,
      duration: 4500,
    });
  },
  message(title: string, options?: FeedbackOptions) {
    toast.message(title, {
      description: options?.description,
      duration: 3000,
    });
  },
};
