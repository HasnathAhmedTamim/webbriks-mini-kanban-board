import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

type FeedbackOptions = {
  description?: string;
};

/** User-facing feedback for the app. */
export const notify = {
  success(title: string, options?: FeedbackOptions) {
    toast.success(title, {
      description: options?.description,
      duration: 3500,
    });
  },

  /** Prefers the API message so reviewers can see what the server returned. */
  error(error: unknown, fallback = "That didn’t work. Please try again.") {
    toast.error(getErrorMessage(error, fallback), { duration: 4500 });
  },

  message(title: string, options?: FeedbackOptions) {
    toast.message(title, {
      description: options?.description,
      duration: 3000,
    });
  },
};
