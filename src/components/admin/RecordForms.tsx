"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import { saveRecordAction } from "@/app/admin/actions";
import { statusOptions } from "@/lib/admin/resources";
import type { AdminRecord, AdOptions, ArticleOptions, FormState, MediaAsset } from "@/lib/admin/types";

import {
  Card,
  Field,
  FormMessage,
  primaryButtonClass,
  secondaryButtonClass,
  SelectInput,
  TextArea,
  TextInput,
} from "./AdminUi";
import { GalleryField, ImageField } from "./ImageField";

const initialState: FormState = { status: "idle", message: "" };

interface FormProps {
  resource: string;
  record?: AdminRecord;
  /** Where "Cancel" returns to. */
  cancelHref: string;
}

/** Shared name / category / owner / status / notes form used by every non-article module. */
export function GenericRecordForm({ resource, record, cancelHref, imageLabel, media = [] }: FormProps & { imageLabel?: string; media?: MediaAsset[] }) {
  const [state, action, pending] = useActionState(saveRecordAction.bind(null, resource, record?.id ?? null), initialState);

  return (
    <Card className="p-5">
      <form action={action} className="flex max-w-[722px] flex-col gap-5">
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
        {imageLabel && <ImageField name="image" label={imageLabel} initial={record?.image} media={media} hint="Upload a picture, choose one from the Media Library, or paste an image address." />}
        <Field label="Internal notes">
          <TextArea name="notes" defaultValue={record?.notes ?? ""} placeholder="Add optional notes for administrators." className="min-h-[120px]" />
        </Field>

        <FormMessage status={state.status} message={state.message} />

        <div className="flex gap-2.5">
          <button type="submit" disabled={pending} className={primaryButtonClass()}>
            {pending ? "Saving…" : "Save record"}
          </button>
          <Link href={cancelHref} className={secondaryButtonClass()}>
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}

/** The saved value first, so editing a story never drops a category or author that was later renamed. */
function withCurrent(values: string[], current?: string | null): string[] {
  return current && !values.includes(current) ? [current, ...values] : values;
}

/** One button of the editor toolbar: what it writes around the selection (or a placeholder) in the story text. */
type ToolbarAction =
  | { label: string; glyph: string; kind: "wrap"; before: string; after: string; placeholder: string }
  | { label: string; glyph: string; kind: "line"; prefix: string; numbered?: boolean; placeholder: string }
  | { label: string; glyph: string; kind: "block"; text: string };

const toolbar: ToolbarAction[] = [
  { label: "H1", glyph: "H₁", kind: "line", prefix: "# ", placeholder: "Heading" },
  { label: "H2", glyph: "H₂", kind: "line", prefix: "## ", placeholder: "Subheading" },
  { label: "Bold", glyph: "B", kind: "wrap", before: "**", after: "**", placeholder: "bold text" },
  { label: "Italic", glyph: "I", kind: "wrap", before: "*", after: "*", placeholder: "italic text" },
  { label: "U", glyph: "U", kind: "wrap", before: "__", after: "__", placeholder: "underlined text" },
  { label: "List", glyph: "•", kind: "line", prefix: "- ", placeholder: "List item" },
  { label: "Ordered", glyph: "1.", kind: "line", prefix: "1. ", numbered: true, placeholder: "List item" },
  { label: "Link", glyph: "↗", kind: "wrap", before: "[", after: "](https://)", placeholder: "link text" },
  { label: "Quote", glyph: "“", kind: "line", prefix: "> ", placeholder: "Quote" },
  { label: "Image", glyph: "▣", kind: "block", text: "![Describe the image](https://)" },
  { label: "Video", glyph: "▶", kind: "block", text: "[video](https://www.youtube.com/watch?v=)" },
  { label: "Table", glyph: "▦", kind: "block", text: "| Column 1 | Column 2 |\n| --- | --- |\n| Cell | Cell |" },
];

/** Applies a toolbar action to the textarea, keeping the user's selection inside the new text. */
function applyToolbar(area: HTMLTextAreaElement, action: ToolbarAction): void {
  const { selectionStart: start, selectionEnd: end, value } = area;
  const selected = value.slice(start, end);
  let replacement: string;
  let selectFrom: number;
  let selectTo: number;

  if (action.kind === "wrap") {
    const inner = selected || action.placeholder;

    replacement = `${action.before}${inner}${action.after}`;
    selectFrom = start + action.before.length;
    selectTo = selectFrom + inner.length;
  } else if (action.kind === "line") {
    const lines = (selected || action.placeholder).split("\n");

    replacement = lines.map((line, index) => `${action.numbered ? `${index + 1}. ` : action.prefix}${line}`).join("\n");
    selectFrom = start;
    selectTo = start + replacement.length;
  } else {
    replacement = action.text;
    selectFrom = start;
    selectTo = start + replacement.length;
  }

  // Block formats need an empty line around them so the story is split into paragraphs correctly.
  const before = value.slice(0, start);
  const needsBreakBefore = action.kind !== "wrap" && start > 0 && !before.endsWith("\n\n");
  const needsBreakAfter = action.kind !== "wrap" && end < value.length && !value.slice(end).startsWith("\n\n");
  const prefix = needsBreakBefore ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
  const suffix = needsBreakAfter ? "\n\n" : "";

  area.value = `${before}${prefix}${replacement}${suffix}${value.slice(end)}`;
  area.focus();
  area.setSelectionRange(selectFrom + prefix.length, selectTo + prefix.length);
}

const publishingStatuses = ["Draft", "Pending", "Scheduled", "Published", "Archived"];

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[13px] text-charade">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-[22px] w-[40px] rounded-full bg-[#e4e4e7] transition-colors peer-checked:bg-[#f59e0b] peer-focus-visible:ring-2 peer-focus-visible:ring-ink after:absolute after:top-[2px] after:left-[2px] after:size-[18px] after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-[18px]" />
      {label}
    </label>
  );
}

/** Tag chips: pick from the tags already in use or type a new one; the chosen tags travel as one comma list. */
function TagPicker({ suggestions, initial: chosenAtStart }: { suggestions: string[]; initial: string[] }) {
  const [chosen, setChosen] = useState<string[]>(chosenAtStart);
  const [draft, setDraft] = useState("");
  const all = [...new Set([...suggestions, ...chosenAtStart, ...chosen])];

  function toggle(tag: string) {
    setChosen((current) => (current.includes(tag) ? current.filter((entry) => entry !== tag) : [...current, tag]));
  }

  function addDraft() {
    const tag = draft.trim().replace(/,/g, " ");

    if (tag && !chosen.includes(tag)) {
      setChosen((current) => [...current, tag]);
    }

    setDraft("");
  }

  return (
    <div>
      <input type="hidden" name="tags" value={chosen.join(", ")} />
      <div className="flex flex-wrap gap-2">
        {all.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={chosen.includes(tag)}
            onClick={() => toggle(tag)}
            className={`rounded-full border px-3 py-1 text-xs leading-5 transition-colors ${
              chosen.includes(tag) ? "border-ink bg-ink text-white" : "border-line bg-white text-charade hover:border-ink"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <TextInput
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addDraft();
          }
        }}
        onBlur={addDraft}
        placeholder="Type a new tag and press Enter"
        className="mt-3"
      />
    </div>
  );
}

export function ArticleForm({ resource, record, options }: FormProps & { options: ArticleOptions }) {
  const [state, action, pending] = useActionState(saveRecordAction.bind(null, resource, record?.id ?? null), initialState);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const savedTags = (record?.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_513px] lg:items-start">
      <div className="flex flex-col gap-6">
        <Card className="p-7">
          <h2 className="text-xl leading-7 font-medium text-ink">Content</h2>
          <div className="mt-6 flex flex-col gap-5">
            <Field label="Article Title *">
              <TextInput name="title" required maxLength={190} defaultValue={record?.title} placeholder="Enter article title..." />
            </Field>
            <Field label="URL Slug">
              <TextInput name="slug" maxLength={190} defaultValue={record?.slug ?? ""} placeholder="auto-generated-from-title" />
            </Field>
            <Field label="Short Description / Excerpt">
              <TextArea name="summary" defaultValue={record?.summary ?? ""} maxLength={600} placeholder="Brief summary shown in listings..." className="min-h-[82px]" />
            </Field>
            <div>
              <span className="mb-2 block text-xs leading-4 font-semibold text-ink">Article Content *</span>
              <div className="overflow-hidden rounded-md border border-line focus-within:border-ink">
                <div className="flex flex-wrap gap-x-1 gap-y-1 border-b border-line bg-surface px-3 py-2">
                  {toolbar.map((entry) => (
                    <button
                      key={entry.label}
                      type="button"
                      onClick={() => bodyRef.current && applyToolbar(bodyRef.current, entry)}
                      className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs leading-4 font-semibold text-ink hover:bg-white"
                    >
                      <span aria-hidden="true" className="w-3.5 text-center text-[11px] text-charade">
                        {entry.glyph}
                      </span>
                      {entry.label}
                    </button>
                  ))}
                </div>
                <label>
                  <span className="sr-only">Article Content</span>
                  <textarea
                    ref={bodyRef}
                    name="body"
                    required
                    defaultValue={record?.body ?? ""}
                    placeholder="Write your story here. Use the toolbar to format headings, lists, links, quotes, images and tables..."
                    className="block min-h-[330px] w-full resize-y px-4 py-4 text-[13px] leading-6 text-ink outline-none placeholder:text-muted"
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-7">
          <h2 className="text-xl leading-7 font-medium text-ink">Featured Image</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ImageField name="image" label="Featured Image" initial={record?.image} media={options.media} hint="Upload a picture, choose one from the Media Library, or paste an image address." />
            </div>            <Field label="Image Caption">
              <TextInput name="imageCaption" defaultValue={record?.imageCaption ?? ""} placeholder="Caption..." />
            </Field>
            <Field label="Image Credit">
              <TextInput name="imageCredit" defaultValue={record?.imageCredit ?? ""} placeholder="Photo: ..." />
            </Field>
            <div className="sm:col-span-2">
              <GalleryField
                name="gallery"
                label="Image Gallery"
                initial={record?.gallery}
                media={options.media}
                hint="More pictures for this story. They appear as a gallery under the article, in the order shown here."
              />
            </div>
            <div className="sm:col-span-2">
              <ImageField name="socialImage" label="Social Sharing Image" initial={record?.socialImage} media={options.media} hint="Shown when the story is shared on social networks. Leave empty to use the featured image." />
            </div>          </div>
        </Card>

        <Card className="p-7">
          <h2 className="text-xl leading-7 font-medium text-ink">SEO</h2>
          <div className="mt-6 flex flex-col gap-5">
            <Field label="SEO Meta Title">
              <TextInput name="seoTitle" maxLength={120} defaultValue={record?.seoTitle ?? ""} placeholder="Meta title (60 chars)" />
            </Field>
            <Field label="SEO Meta Description">
              <TextArea name="seoDescription" maxLength={300} defaultValue={record?.seoDescription ?? ""} placeholder="Meta description (160 chars)" className="min-h-[82px]" />
            </Field>
          </div>
        </Card>
      </div>

      <Card className="p-7">
        <h2 className="text-xl leading-7 font-medium text-ink">Publishing</h2>
        <div className="mt-6 flex flex-col gap-5">
          <Field label="Status">
            <SelectInput name="status" defaultValue={record?.status ?? "Published"}>
              {publishingStatuses.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Category">
            <SelectInput name="subtitle" defaultValue={record?.subtitle ?? ""}>
              <option value="">Select category</option>
              {withCurrent(options.categories, record?.subtitle).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Author">
            <SelectInput name="owner" defaultValue={record?.owner ?? ""}>
              <option value="">Select author</option>
              {withCurrent(options.authors, record?.owner).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Publication Date" hint="Leave empty to publish right away. Times are in Bangladesh time (Asia/Dhaka).">
            <TextInput name="publishAt" type="datetime-local" defaultValue={record?.publishAt ?? ""} />
          </Field>
          <div>
            <span className="mb-2 block text-xs leading-4 font-semibold text-ink">Tags</span>
            <TagPicker suggestions={options.tags} initial={savedTags} />
          </div>

          <div className="flex flex-col gap-4 border-t border-line pt-5">
            <Toggle name="isFeatured" label="Featured Article" defaultChecked={record?.isFeatured ?? false} />
            <Toggle name="isBreaking" label="Breaking News" defaultChecked={record?.isBreaking ?? false} />
          </div>

          <FormMessage status={state.status} message={state.message} />

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              name="intent"
              value="draft"
              disabled={pending}
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#e6b100] text-sm font-semibold text-ink transition-colors hover:brightness-95 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save Draft"}
            </button>
            <button
              type="submit"
              name="intent"
              value="approval"
              disabled={pending}
              className="flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-60"
            >
              Submit for Approval
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending}
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-ink text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
            >
              Publish Now
            </button>
          </div>
          <p className="text-center text-[11px] leading-4 text-muted">Workflow: Draft → Approval → Publish</p>
        </div>
      </Card>
    </form>
  );
}

/**
 * Advertisement form. It keeps the look of the shared record form (name, category/advertiser, scope/place, status,
 * notes) and adds what an ad needs: its type, banner or AdSense unit, link and run dates.
 */
export function AdvertisementForm({ resource, record, cancelHref, options }: FormProps & { options: AdOptions }) {
  const [state, action, pending] = useActionState(saveRecordAction.bind(null, resource, record?.id ?? null), initialState);
  const [adType, setAdType] = useState(record?.adType ?? "image");

  return (
    <Card className="p-5">
      <form action={action} className="flex max-w-[722px] flex-col gap-5">
        <Field label="Name or title">
          <TextInput name="title" required maxLength={150} defaultValue={record?.title} />
        </Field>
        <Field label="Category or type" hint="The advertiser or company the campaign is for.">
          <TextInput name="subtitle" defaultValue={record?.subtitle} />
        </Field>
        <Field label="Owner or scope" hint="Where on the website the ad appears. Each place shows one ad; the newest running campaign wins.">
          <SelectInput name="owner" defaultValue={record?.placement ?? ""} required>
            <option value="" disabled>
              Choose a place on the website
            </option>
            {options.placements.map((placement) => (
              <option key={placement.key} value={placement.key}>
                {placement.label} ({placement.size})
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Status" hint="Only Active campaigns are shown on the website.">
          <SelectInput name="status" defaultValue={record?.status ?? "Active"}>
            {["Active", "Draft", "Archived"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Ad type">
          <SelectInput name="adType" value={adType} onChange={(event) => setAdType(event.target.value)}>
            <option value="image">Image banner</option>
            <option value="adsense">Google AdSense ad unit</option>
          </SelectInput>
        </Field>

        {adType === "image" ? (
          <>
            <ImageField
              name="image"
              label="Banner image"
              initial={record?.image}
              media={options.media}
              required
              hint="Upload the banner here, at the size shown next to the place above, or choose one from the Media Library."
            />            <Field label="Link" hint="Where a click on the banner goes (optional).">
              <TextInput name="linkUrl" type="url" defaultValue={record?.linkUrl ?? ""} placeholder="https://advertiser.example/offer" />
            </Field>
          </>
        ) : (
          <Field
            label="AdSense ad unit ID"
            hint="The number from AdSense (Ads, then By ad unit, then data-ad-slot). The publisher ID is set in Website Settings."
          >
            <TextInput name="adsenseSlot" inputMode="numeric" defaultValue={record?.adsenseSlot ?? ""} placeholder="1234567890" />
          </Field>
        )}

        <Field label="Start date" hint="Leave empty to start right away. Times are in Bangladesh time (Asia/Dhaka).">
          <TextInput name="startsAt" type="datetime-local" defaultValue={record?.startsAt ?? ""} />
        </Field>
        <Field label="End date" hint="Leave empty to run until you stop it.">
          <TextInput name="endsAt" type="datetime-local" defaultValue={record?.endsAt ?? ""} />
        </Field>
        <Field label="Internal notes">
          <TextArea name="notes" defaultValue={record?.notes ?? ""} placeholder="Add optional notes for administrators." className="min-h-[120px]" />
        </Field>

        <FormMessage status={state.status} message={state.message} />

        <div className="flex gap-2.5">
          <button type="submit" disabled={pending} className={primaryButtonClass()}>
            {pending ? "Saving…" : "Save record"}
          </button>
          <Link href={cancelHref} className={secondaryButtonClass()}>
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
