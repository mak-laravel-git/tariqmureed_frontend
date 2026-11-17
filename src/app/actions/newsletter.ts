"use server";

import { ApiError, apiPost } from "@/lib/api/client";

export interface NewsletterState {
  status: "idle" | "success" | "error";
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Subscribes an email address to the daily briefing.
 * POST /newsletter/subscribers { email } -> { message }
 */
export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  try {
    const result = await apiPost<{ message?: string }>(
      "newsletter/subscribers",
      { email },
      { fallback: () => ({ message: "Thanks for subscribing." }) },
    );

    return { status: "success", message: result.message ?? "Thanks for subscribing." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof ApiError && error.status && error.status < 500
          ? error.message
          : "We could not subscribe you right now. Please try again.",
    };
  }
}
