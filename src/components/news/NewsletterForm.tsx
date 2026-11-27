"use client";

import { useActionState } from "react";

import { subscribeToNewsletter, type NewsletterState } from "@/app/actions/newsletter";

const initialState: NewsletterState = { status: "idle", message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-[11px]" noValidate>
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Email address"
        aria-invalid={state.status === "error"}
        aria-describedby="newsletter-status"
        className="h-[43px] rounded-[4px] border border-[#d4d4d8] bg-white px-4 text-sm text-[#09090b] outline-none placeholder:text-[#09090b]/50 focus-visible:border-ink"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-[4px] bg-brand text-base text-[#09090b] transition-colors hover:bg-brand disabled:opacity-60"
      >
        {pending ? "Subscribing…" : "Subscribe"}
      </button>
      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className={
          state.status === "error" ? "text-xs leading-[18px] text-live" : "text-xs leading-[18px] text-win"
        }
      >
        {state.message}
      </p>
    </form>
  );
}
