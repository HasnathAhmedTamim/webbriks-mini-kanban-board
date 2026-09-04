export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (typeof error === "object" && error !== null) {
    const maybe = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return maybe.response?.data?.message || maybe.message || fallback;
  }
  return fallback;
}
