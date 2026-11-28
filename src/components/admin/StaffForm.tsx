"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";

import { saveStaffAction } from "@/app/admin/actions";
import type { AdminRecord, FormState, StaffRole } from "@/lib/admin/types";

import { Card, Field, FormMessage, primaryButtonClass, secondaryButtonClass, SelectInput, TextInput } from "./AdminUi";

const initialState: FormState = { status: "idle", message: "" };

/** What the built-in roles can do. Roles made in the dashboard share one description. */
const about: Record<string, string> = {
  "super-admin": "Can do everything, including managing other super admins.",
  admin: "Can use the dashboard as allowed under Roles & Permissions.",
  user: "Sees nothing in the dashboard until Roles & Permissions gives this role access.",
};

interface StaffFormProps {
  /** The account being edited; none while creating one. */
  record?: AdminRecord;
  cancelHref: string;
  /** The signed-in account is the one being edited. */
  isSelf?: boolean;
  /** The roles the signed-in account may give. */
  roles: StaffRole[];
}

/** Creates a staff account or edits one: name, email, role and password. */
export function StaffForm({ record, cancelHref, isSelf = false, roles }: StaffFormProps) {
  const [state, action, pending] = useActionState(saveStaffAction.bind(null, record?.id ?? null), initialState);
  const [name, setName] = useState(record?.title ?? "");
  const [email, setEmail] = useState(record?.subtitle ?? "");
  const [role, setRole] = useState(() => {
    if (record) {
      return record.role ?? record.owner.toLowerCase().replace(/\s+/g, "-");
    }

    return (roles.find((entry) => entry.value === "admin") ?? roles[0])?.value ?? "";
  });
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  // The account's current role stays in the list even when the signed-in account could not give it.
  const offered = !record || roles.some((entry) => entry.value === role) ? roles : [...roles, { value: role, label: record.owner }];

  // Sent by hand: a form's `action` clears the fields afterwards, which would lose the typing after an error.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    startTransition(() => action(data));
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="flex max-w-full flex-col gap-5">
        <Field label="Full name">
          <TextInput name="title" required maxLength={120} autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Email address (used to sign in)">
          <TextInput name="subtitle" type="email" required maxLength={190} autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>

        <Field label="Role" hint={isSelf ? "You cannot change your own role. Ask another administrator." : (about[role] ?? "Can use the dashboard as allowed for this role under Roles & Permissions.")}>
          <SelectInput name="owner" value={role} disabled={isSelf} onChange={(event) => setRole(event.target.value)}>
            {offered.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        {/* A disabled field is not sent with the form. */}
        {isSelf && <input type="hidden" name="owner" value={role} />}

        {isSelf ? (
          <p className="text-xs leading-5 text-muted">
            Change your own password in{" "}
            <Link href="/admin/password" className="font-semibold text-ink underline">
              Password Management
            </Link>
            .
          </p>
        ) : (
          <>
            <Field label={record ? "New password (leave empty to keep the current one)" : "Password"} hint="At least 8 characters. The live site may ask for a stronger one.">
              <TextInput name="password" type="password" autoComplete="new-password" required={!record} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
            </Field>
            <Field label={record ? "Confirm new password" : "Confirm password"}>
              <TextInput name="password_confirmation" type="password" autoComplete="new-password" required={!record || password !== ""} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </Field>
          </>
        )}

        <FormMessage status={state.status} message={state.message} />

        <div className="flex gap-2.5">
          <button type="submit" disabled={pending} className={primaryButtonClass()}>
            {pending ? "Saving…" : record ? "Save changes" : "Create account"}
          </button>
          <Link href={cancelHref} className={secondaryButtonClass()}>
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
