"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  loginAction,
  savePermissionsAction,
  saveSettingsAction,
  updatePasswordAction,
  updateProfileAction,
  uploadMediaAction,
} from "@/app/admin/actions";
import type { AdminUser, FormState, PermissionMatrix, SiteSettings } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

import {
  Card,
  CardHeader,
  Field,
  FormMessage,
  primaryButtonClass,
  secondaryButtonClass,
  SelectInput,
  TextArea,
  TextInput,
} from "./AdminUi";
import { AdminIcon } from "./icons";

const initial: FormState = { status: "idle", message: "" };

export function LoginForm({ next, mock }: { next: string; mock: boolean }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <Field label="Email address">
        <TextInput name="email" type="email" autoComplete="username" required placeholder="you@tmnsports.com" />
      </Field>
      <Field label="Password">
        <TextInput name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormMessage status={state.status} message={state.message} />
      <button type="submit" disabled={pending} className={primaryButtonClass("h-10 w-full")}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {mock && (
        <p className="rounded-md bg-surface px-3 py-2.5 text-[11.5px] leading-[17px] text-charade">
          Demo mode (no API configured): sign in with <strong>superadmin@dev.com</strong> and the same value as the password.
        </p>
      )}
    </form>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, initial);

  return (
    <form action={action} id="settings-form" aria-busy={pending}>
      <div className="mb-4 min-h-5">
        <FormMessage status={state.status} message={state.message} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="General settings" description="Public website identity" />
          <div className="flex flex-col gap-5 p-5">
            <Field label="Website name">
              <TextInput name="websiteName" defaultValue={settings.websiteName} />
            </Field>
            <Field label="Contact email" hint="Shown on the Privacy Policy, Cookie and Terms pages so visitors can reach you.">
              <TextInput name="contactEmail" type="email" defaultValue={settings.contactEmail} />
            </Field>
            <Field label="Contact address" hint="Shown with the contact email on the Privacy Policy page. Optional.">
              <TextInput name="contactAddress" defaultValue={settings.contactAddress} autoComplete="off" />
            </Field>
            <Field label="Website description">
              <TextArea name="description" defaultValue={settings.description} />
            </Field>
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title="Editorial defaults" description="New article behaviour" />
          <div className="flex flex-col gap-5 p-5">
            <Field label="Default article status">
              <SelectInput name="defaultStatus" defaultValue={settings.defaultStatus}>
                {["Draft", "Pending", "Published"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Timezone">
              <SelectInput name="timezone" defaultValue={settings.timezone}>
                {["Asia/Karachi (UTC+5)", "Asia/Dhaka (UTC+6)", "Asia/Kolkata (UTC+5:30)", "Europe/London (UTC+0)", "UTC"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </SelectInput>
            </Field>
            <label className="flex items-center gap-2.5 text-xs text-ink">
              <input type="checkbox" name="requireApproval" defaultChecked={settings.requireApproval} className="size-4 accent-[#f5c400]" />
              Require approval before publishing
            </label>
            <label className="flex items-center gap-2.5 text-xs text-ink">
              <input type="checkbox" name="notifyEditors" defaultChecked={settings.notifyEditors} className="size-4 accent-[#f5c400]" />
              Notify editors about new drafts
            </label>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Privacy and advertising"
            description="Google Analytics, AdSense and the cookie consent banner. Changes go live on the website within seconds."
          />
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <Field label="Google Analytics Measurement ID" hint="Looks like G-XXXXXXXXXX. Leave empty to switch analytics off.">
              <TextInput name="gaMeasurementId" defaultValue={settings.gaMeasurementId} placeholder="G-XXXXXXXXXX" autoComplete="off" spellCheck={false} />
            </Field>
            <Field label="AdSense publisher ID" hint="Looks like ca-pub-1234567890123456. Leave empty to show no ads. Also publishes /ads.txt.">
              <TextInput name="adsenseClientId" defaultValue={settings.adsenseClientId} placeholder="ca-pub-1234567890123456" autoComplete="off" spellCheck={false} />
            </Field>
            <Field
              className="md:col-span-2"
              label="Cookie consent"
              hint="Our own banner needs no setup and loads nothing from Google until a visitor agrees. Choose Google’s message once Privacy & messaging is published in your AdSense account (required for Google-certified consent in the EEA and UK)."
            >
              <SelectInput name="consentMode" defaultValue={settings.consentMode}>
                <option value="builtin">Our own banner (Accept, Decline, Manage)</option>
                <option value="google">Google’s certified message (AdSense Privacy &amp; messaging)</option>
              </SelectInput>
            </Field>
          </div>
        </Card>
      </div>
    </form>
  );
}

function ProfileHeader({ user }: { user: AdminUser }) {
  return (
    <div className="flex items-center gap-4 border-b border-line px-5 py-4">
      <span className="flex size-[42px] items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{user.initials}</span>
      <div>
        <p className="text-sm leading-5 font-semibold text-ink">{user.name}</p>
        <p className="text-xs leading-[18px] text-muted">
          {[user.jobTitle, user.role].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}

export function ProfileForm({ user }: { user: AdminUser }) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <Card>
      <ProfileHeader user={user} />
      <form action={action} className="flex max-w-[620px] flex-col gap-5 p-5">
        <Field label="Full name">
          <TextInput name="name" required defaultValue={user.name} />
        </Field>
        <Field label="Email address">
          <TextInput name="email" type="email" required defaultValue={user.email} />
        </Field>
        <FormMessage status={state.status} message={state.message} />
        <div>
          <button type="submit" disabled={pending} className={primaryButtonClass()}>
            {pending ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </Card>
  );
}

export function PasswordForm({ user }: { user: AdminUser }) {
  const [state, action, pending] = useActionState(updatePasswordAction, initial);

  return (
    <Card>
      <ProfileHeader user={user} />
      <form action={action} key={state.status === "success" ? "done" : "form"} className="flex max-w-[620px] flex-col gap-5 p-5">
        <Field label="Current password">
          <TextInput name="current" type="password" autoComplete="current-password" required />
        </Field>
        <Field label="New password">
          <TextInput name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirm new password">
          <TextInput name="confirmation" type="password" autoComplete="new-password" required />
        </Field>
        <FormMessage status={state.status} message={state.message} />
        <div>
          <button type="submit" disabled={pending} className={primaryButtonClass()}>
            {pending ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </Card>
  );
}

export function UploadForm() {
  const [state, action, pending] = useActionState(uploadMediaAction, initial);

  return (
    <Card>
      <form action={action}>
        <div className="flex flex-col items-center gap-2 border-b border-line px-5 py-14 text-center">
          <AdminIcon name="upload" width={22} height={22} className="text-charade" />
          <p className="mt-2 text-sm leading-5 text-ink">Drop an image here</p>
          <p className="text-[11px] leading-4 text-muted">PNG, JPG, WebP or SVG up to 10 MB</p>
          <label className={primaryButtonClass("mt-3 cursor-pointer")}>
            Choose file
            <input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" />
          </label>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <Field label="Asset title">
            <TextInput name="title" placeholder="Enter a descriptive title" />
          </Field>
          <Field label="Alternative text">
            <TextArea name="alt" placeholder="Describe the image for accessibility" />
          </Field>
          <FormMessage status={state.status} message={state.message} />
          <div className="flex justify-end gap-2.5">
            <Link href="/admin/media" className={secondaryButtonClass()}>
              Cancel
            </Link>
            <button type="submit" disabled={pending} className={primaryButtonClass()}>
              {pending ? "Uploading…" : "Upload asset"}
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}

export function PermissionsForm({ matrix }: { matrix: PermissionMatrix }) {
  const role = matrix.roles.find((entry) => entry.slug === matrix.selected);
  const locked = role?.system ?? false;
  const [state, action, pending] = useActionState(savePermissionsAction.bind(null, matrix.selected), initial);

  return (
    <Card key={matrix.selected} className="p-5">
      <form action={action}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-[15px] leading-5 font-medium text-ink">{role?.name} permissions</h2>
            <p className="mt-0.5 text-xs text-muted">Changes apply to staff using the default role. Individual overrides remain unchanged.</p>
          </div>
          <span className="rounded-full bg-surface px-2.5 py-1 text-[10.5px] text-charade">{matrix.updatedAt}</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="text-xs font-semibold text-ink">
                <th scope="col" className="py-2 pr-4">Module</th>
                {matrix.actions.map((name) => (
                  <th key={name} scope="col" className="px-3 py-2 text-center capitalize">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.modules.map((entry) => (
                <tr key={entry.key} className="border-t border-line">
                  <th scope="row" className="py-2 pr-4 font-semibold text-ink">
                    {entry.label}
                    {entry.restricted && <span className="pl-2 text-xs font-normal text-charade">Restricted module</span>}
                  </th>
                  {matrix.actions.map((name) => {
                    const disabled = locked || (entry.restricted && name !== "view");

                    return (
                      <td key={name} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          name="permission"
                          value={`${entry.key}:${name}`}
                          defaultChecked={entry.granted[name]}
                          disabled={disabled}
                          aria-label={`${entry.label} ${name}`}
                          className={cn("size-4 accent-[#f5c400]", disabled && "opacity-50")}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/admin/roles?role=${matrix.selected}`} className="text-[11px] text-[#8a6500] underline">
            Reset permissions
          </Link>
          <div className="flex items-center gap-3">
            <FormMessage status={state.status} message={state.message} />
            {!locked && (
              <>
                <Link href={`/admin/roles?role=${matrix.selected}`} className={secondaryButtonClass("h-8 text-xs")}>
                  Cancel changes
                </Link>
                <button type="submit" disabled={pending} className={primaryButtonClass("h-8 text-xs")}>
                  {pending ? "Saving…" : "Save permissions"}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
