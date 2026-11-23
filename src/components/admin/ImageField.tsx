"use client";

import Image from "next/image";
import { type ChangeEvent, useRef, useState, useTransition } from "react";

import { uploadImageAction } from "@/app/admin/actions";
import type { MediaAsset } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

import { secondaryButtonClass, TextInput } from "./AdminUi";

interface ImageFieldProps {
  /** Form field that carries the chosen image address. */
  name: string;
  label: string;
  initial?: string | null;
  /** Images already in the media library. */
  media: MediaAsset[];
  /** Text under the field, e.g. the size an ad banner should have. */
  hint?: string;
  required?: boolean;
}

/**
 * Picture chooser used by every editor: shows a preview, uploads a new file straight into the media library,
 * lets the editor pick an existing image from the library with thumbnails, or paste an image address.
 */
export function ImageField({ name, label, initial, media, hint, required }: ImageFieldProps) {
  const [value, setValue] = useState(initial ?? "");
  const [library, setLibrary] = useState(media);
  const [browsing, setBrowsing] = useState(false);
  const [error, setError] = useState("");
  const [uploading, startUpload] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const pick = (url: string) => {
    setValue(url);
    setBrowsing(false);
    setError("");
  };

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const form = new FormData();
    form.set("file", file);
    setError("");

    startUpload(async () => {
      const result = await uploadImageAction(form);

      if (result.asset?.url) {
        setLibrary((current) => [result.asset as MediaAsset, ...current]);
        setValue(result.asset.url);
      } else {
        setError(result.error ?? "The image could not be uploaded.");
      }
    });
  };

  const usable = library.filter((asset) => asset.url);

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-3">
      <span className="block text-xs leading-4 font-semibold text-ink">{label}</span>
      <input type="hidden" name={name} value={value} />

      <div className="flex items-start gap-4">
        <div className="relative flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-surface text-[11px] text-muted">
          {value ? <Image src={value} alt="Preview of the chosen image" fill unoptimized sizes="144px" className="object-cover" /> : "No image"}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} className={secondaryButtonClass("h-9 px-3 text-xs")}>
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            <button
              type="button"
              onClick={() => setBrowsing((open) => !open)}
              aria-expanded={browsing}
              className={secondaryButtonClass("h-9 px-3 text-xs")}
            >
              Choose from Media Library
            </button>
            {value && (
              <button type="button" onClick={() => setValue("")} className={secondaryButtonClass("h-9 px-3 text-xs text-live hover:border-live")}>
                Remove
              </button>
            )}
          </div>
          <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={upload} className="sr-only" tabIndex={-1} aria-label="Upload an image file" />

          <TextInput
            aria-label="Image address"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="…or paste an image address (https://…)"
            required={required && !value}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-live">
          {error}
        </p>
      )}

      {browsing && (
        <div className="rounded-md border border-line bg-surface p-3">
          {usable.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">The Media Library is empty. Upload an image first.</p>
          ) : (
            <ul className="grid max-h-72 grid-cols-2 gap-2.5 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
              {usable.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => pick(asset.url as string)}
                    aria-label={`Use ${asset.title}`}
                    aria-pressed={asset.url === value}
                    className={cn(
                      "block w-full overflow-hidden rounded-md border bg-white text-left transition-colors hover:border-ink",
                      asset.url === value ? "border-gold ring-2 ring-gold" : "border-line",
                    )}
                  >
                    <span className="relative block aspect-[1.65] bg-surface">
                      <Image src={asset.url as string} alt="" fill unoptimized sizes="160px" className="object-cover" />
                    </span>
                    <span className="block truncate px-2 py-1.5 text-[11px] leading-4 font-medium text-ink">{asset.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {hint && <p className="text-[11px] leading-4 text-muted">{hint}</p>}
    </div>
  );
}
