"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveRecordAction } from "@/app/admin/actions";
import { statusOptions } from "@/lib/admin/resources";
import type { AdminRecord, ArticleOptions, FormState } from "@/lib/admin/types";

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

const initialState: FormState = { status: "idle", message: "" };

interface FormProps {
  resource: string;
  record?: AdminRecord;
  /** Where "Cancel" returns to. */
  cancelHref: string;
}

/** Shared name / category / owner / status / notes form used by every non-article module. */
export function GenericRecordForm({ resource, record, cancelHref }: FormProps) {
  const [state, action, pending] = useActionState(saveRecordAction.bind(null, resource, record?.id ?? null), initialState);

  return (
    <Card className="p-5">
      <form action={action} className="flex max-w-[600px] flex-col gap-5">
        <Field label="Name or title">
          <TextInput name="title" required defaultValue={record?.title} />
        </Field>
        <Field label="Category or type">
          <TextInput name="subtitle" defaultValue={record?.subtitle} />
        </Field>
        <Field label="Owner or scope">
          <TextInput name="owner" defaultValue={record?.owner} />
        </Field>
        <Field label="Status">
          <SelectInput name="status" defaultValue={record?.status ?? "Active"}>
            {[...new Set([record?.status, ...statusOptions].filter(Boolean) as string[])].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Internal notes">
          <TextArea name="notes" defaultValue={record?.notes ?? ""} placeholder="Add optional notes for administrators." className="min-h-[120px]" />
        </Field>

        <FormMessage status={state.status} message={state.message} />

        <div className="flex gap-2.5">
          <Link href={cancelHref} className={secondaryButtonClass()}>
            Cancel
          </Link>
          <button type="submit" disabled={pending} className={primaryButtonClass()}>
            {pending ? "Saving…" : "Save record"}
          </button>
        </div>
      </form>
    </Card>
  );
}

/** The saved value first, so editing a story never drops a category or author that was later renamed. */
function withCurrent(values: string[], current?: string | null): string[] {
  return current && !values.includes(current) ? [current, ...values] : values;
}

export function ArticleForm({ resource, record, cancelHref, options }: FormProps & { options: ArticleOptions }) {
  const [state, action, pending] = useActionState(saveRecordAction.bind(null, resource, record?.id ?? null), initialState);
  const [title, setTitle] = useState(record?.title ?? "");

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">

      <Card className="p-5">
        <div className="flex flex-col gap-5">
          <Field label="Article title" hint={`${title.length}/120 characters`}>
            <TextInput
              name="title"
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter a clear, engaging headline"
            />
          </Field>

          <Field label="Summary">
            <TextArea name="summary" defaultValue={record?.summary ?? ""} placeholder="Write a short summary for cards and search results" className="min-h-[88px]" />
          </Field>

          <div>
            <span className="mb-2 block text-xs leading-4 font-semibold text-ink">Article body</span>
            <div className="overflow-hidden rounded-md border border-line focus-within:border-ink">
              <div className="flex gap-4 border-b border-line px-3 py-2 text-xs text-charade" aria-hidden="true">
                <span>Plain text · blank line = new paragraph</span>
                <span>## Heading</span>
                <span>&gt; Quote</span>
              </div>
              <label>
                <span className="sr-only">Article body</span>
                <textarea
                  name="body"
                  defaultValue={record?.body ?? ""}
                  placeholder="Start writing your story..."
                  className="block min-h-[320px] w-full resize-y px-3 py-3 text-[13px] leading-6 text-ink outline-none placeholder:text-muted"
                />
              </label>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader title="Publishing" description="Status and visibility" />
          <div className="flex flex-col gap-4 p-5">
            <Field label="Status">
              <SelectInput name="status" defaultValue={record?.status ?? "Draft"}>
                {["Draft", "Pending", "Scheduled", "Published", "Archived"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Publish date">
              <TextInput name="publishAt" type="datetime-local" defaultValue={record?.publishAt ?? ""} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Classification" description="Help readers discover this story" />
          <div className="flex flex-col gap-4 p-5">
            <Field label="Category">
              <SelectInput name="subtitle" defaultValue={record?.subtitle ?? ""}>
                <option value="">No category</option>
                {withCurrent(options.categories, record?.subtitle).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Author">
              <SelectInput name="owner" defaultValue={record?.owner ?? ""}>
                <option value="">TMN Sport Desk</option>
                {withCurrent(options.authors, record?.owner).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Cover image" hint="Upload pictures in the Media Library first.">
              <SelectInput name="image" defaultValue={record?.image ?? ""}>
                <option value="">No image</option>
                {record?.image && !options.media.some((asset) => asset.url === record.image) && (
                  <option value={record.image}>Current image</option>
                )}
                {options.media.flatMap((asset) => (asset.url ? [<option key={asset.id} value={asset.url}>{asset.title}</option>] : []))}
              </SelectInput>
            </Field>
            <Field label="Tags">
              <TextInput name="tags" defaultValue={record?.tags ?? ""} placeholder="Add tags..." />
            </Field>
          </div>
        </Card>

        <FormMessage status={state.status} message={state.message} />

        <div className="flex justify-end gap-2.5">
          <Link href={cancelHref} className={secondaryButtonClass()}>
            Cancel
          </Link>
          <button type="submit" disabled={pending} className={primaryButtonClass()}>
            {pending ? "Saving…" : "Save article"}
          </button>
        </div>
      </div>
    </form>
  );
}
