import { toast } from "sonner";

type FeedbackOptions = {
  description?: string;
};

/** Plain-language feedback for people using the app — not developers. */
export const notify = {
  success(title: string, options?: FeedbackOptions) {
    toast.success(title, {
      description: options?.description,
      duration: 3500,
    });
  },

  /** Always shows a friendly message. Never dumps raw API text. */
  error(_error: unknown, message = "That didn’t work. Please try again.") {
    const status = (_error as { response?: { status?: number } })?.response?.status;
    if (status === 403) {
      toast.error("You don’t have access to do that", {
        description: "Ask the board owner if you need help.",
        duration: 4500,
      });
      return;
    }
    if (status === 401) {
      toast.error("Please sign in again", {
        description: "Your session ended.",
        duration: 4500,
      });
      return;
    }
    toast.error(message, { duration: 4500 });
  },

  message(title: string, options?: FeedbackOptions) {
    toast.message(title, {
      description: options?.description,
      duration: 3000,
    });
  },
};
