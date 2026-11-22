"use client";

import { useActionState } from "react";

import { resetPageAction, savePageAction } from "@/app/admin/actions";
import type { FormState } from "@/lib/admin/types";

import { Card, Field, FormMessage, primaryButtonClass, secondaryButtonClass, TextArea, TextInput } from "./AdminUi";

const initial: FormState = { status: "idle", message: "" };

interface PageEditorProps {
  slug: string;
  title: string;
  description: string;
  content: string;
  /** True once the page has been saved here; false while the website's built-in text is shown. */
  customised: boolean;
}

export function PageEditor({ slug, title, description, content, customised }: PageEditorProps) {
  const [state, action, pending] = useActionState(savePageAction.bind(null, slug), initial);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-5">
        <form action={action} className="flex flex-col gap-5" aria-busy={pending}>
          <Field label="Page title">
            <TextInput name="title" required defaultValue={title} maxLength={150} />
          </Field>
          <Field label="Short description" hint="Shown under the title and in search results.">
            <TextInput name="description" defaultValue={description} maxLength={500} />
          </Field>
          <Field label="Page text">
            <TextArea
              name="content"
              required
              defaultValue={content}
              spellCheck
              className="min-h-[520px] font-mono text-[12.5px] leading-[20px]"
            />
          </Field>

          <FormMessage status={state.status} message={state.message} />

          <div className="flex flex-wrap gap-2.5">
            <button type="submit" disabled={pending} className={primaryButtonClass()}>
              {pending ? "Saving…" : "Save and publish"}
            </button>
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass()}>
              View live page
            </a>
          </div>
        </form>

        {customised && (
          <form action={resetPageAction.bind(null, slug)} className="mt-5 border-t border-line pt-5">
            <p className="text-xs leading-[18px] text-muted">
              Reset deletes your saved text and brings back the version built into the website.
            </p>
            <button type="submit" className={secondaryButtonClass("mt-3")}>
              Reset to built-in text
            </button>
          </form>
        )}
      </Card>

      <Card className="self-start p-5">
        <h2 className="text-sm font-semibold text-ink">How to write the text</h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-4 text-xs leading-[18px] text-charade">
          <li>
            Start every section with a heading line: <code className="rounded bg-surface px-1">## Who we are</code>
          </li>
          <li>Write paragraphs below it. A blank line starts a new paragraph.</li>
          <li>
            Start a line with <code className="rounded bg-surface px-1">- </code> for a bullet point.
          </li>
          <li>
            Add a link like <code className="rounded bg-surface px-1">[link text](https://example.com)</code>. Links to other
            pages of this site can be written <code className="rounded bg-surface px-1">[Cookies](/cookie-preferences)</code>.
          </li>
          <li>The contact email and address on the right of the page come from Website Settings.</li>
        </ul>
        <p className="mt-4 rounded-md bg-surface px-3 py-2.5 text-[11.5px] leading-[17px] text-charade">
          {customised
            ? "This page uses the text saved here."
            : "This page still shows the text built into the website. Saving creates your own version."}
        </p>
      </Card>
    </div>
  );
}
