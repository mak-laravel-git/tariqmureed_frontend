"use client";

import { useActionState, useState } from "react";

import { createRoleAction, deleteRoleAction } from "@/app/admin/actions";
import type { FormState } from "@/lib/admin/types";

import { Card, Field, FormMessage, primaryButtonClass, secondaryButtonClass, TextInput } from "./AdminUi";

const initialState: FormState = { status: "idle", message: "" };

/** Makes a new role, such as Editor or Reporter; its permissions are ticked afterwards. */
export function CreateRoleForm() {
  const [state, action, pending] = useActionState(createRoleAction, initialState);
  // Controlled, so the name stays when the server refuses it.
  const [name, setName] = useState("");

  return (
    <Card className="p-5">
      <form action={action} className="flex flex-col gap-3">
        <Field label="New role name" hint="For example Editor or Reporter, in English letters. Tick its permissions after creating it.">
          <TextInput name="name" required maxLength={40} autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <FormMessage status={state.status} message={state.message} />
        <div>
          <button type="submit" disabled={pending} className={primaryButtonClass("h-8 text-xs")}>
            {pending ? "Creating…" : "Create role"}
          </button>
        </div>
      </form>
    </Card>
  );
}

/** Deletes a role made in the dashboard, saying why when staff still use it. */
export function DeleteRoleButton({ role, name }: { role: string; name: string }) {
  const [state, action, pending] = useActionState(deleteRoleAction.bind(null, role), initialState);

  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-3">
      <FormMessage status={state.status} message={state.message} />
      <button type="submit" disabled={pending} className={secondaryButtonClass("h-8 text-xs text-live hover:border-live")}>
        {pending ? "Deleting…" : `Delete ${name} role`}
      </button>
    </form>
  );
}
