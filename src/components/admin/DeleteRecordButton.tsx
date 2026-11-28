"use client";

import { useActionState } from "react";

import { deleteRecordAction } from "@/app/admin/actions";
import type { FormState } from "@/lib/admin/types";

import { FormMessage, secondaryButtonClass } from "./AdminUi";

const initialState: FormState = { status: "idle", message: "" };

/** Deletes a record, saying why when the server refuses. */
export function DeleteRecordButton({ resource, id }: { resource: string; id: string }) {
  const [state, action, pending] = useActionState(deleteRecordAction.bind(null, resource, id), initialState);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <FormMessage status={state.status} message={state.message} />
      <button type="submit" disabled={pending} className={secondaryButtonClass("text-live hover:border-live")}>
        {pending ? "Deleting…" : "Delete"}
      </button>
    </form>
  );
}
