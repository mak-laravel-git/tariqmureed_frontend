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

interface GalleryFieldProps {
  name: string;
  label: string;
  initial?: string[];
  media: MediaAsset[];
  hint?: string;
}

/**
 * Several pictures for one story: upload files (many at once), tick images in the Media Library or paste an address.
 * The order shown here is the order of the gallery on the story page. The field sends the list as JSON.
 */
export function GalleryField({ name, label, initial = [], media, hint }: GalleryFieldProps) {
  const [images, setImages] = useState<string[]>(initial);
  const [library, setLibrary] = useState(media);
  const [browsing, setBrowsing] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [uploading, startUpload] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const add = (urls: string[]) => setImages((current) => [...new Set([...current, ...urls.filter(Boolean)])]);
  const remove = (url: string) => setImages((current) => current.filter((entry) => entry !== url));
  const move = (index: number, step: -1 | 1) =>
    setImages((current) => {
      const next = [...current];
      const target = index + step;

      if (target < 0 || target >= next.length) {
        return current;
      }

      [next[index], next[target]] = [next[target], next[index]];

      return next;
    });

  const addAddress = () => {
    add([address.trim()]);
    setAddress("");
  };

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setError("");

    startUpload(async () => {
      const uploaded: string[] = [];
      const added: MediaAsset[] = [];

      for (const file of files) {
        const form = new FormData();
        form.set("file", file);
        const result = await uploadImageAction(form);

        if (result.asset?.url) {
          uploaded.push(result.asset.url);
          added.push(result.asset);
        } else {
          setError(`${file.name}: ${result.error ?? "The image could not be uploaded."}`);
        }
      }

      setLibrary((current) => [...added, ...current]);
      add(uploaded);
    });
  };

  const usable = library.filter((asset) => asset.url);

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-3">
      <span className="block text-xs leading-4 font-semibold text-ink">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} className={secondaryButtonClass("h-9 px-3 text-xs")}>
          {uploading ? "Uploading…" : "Upload images"}
        </button>
        <button type="button" onClick={() => setBrowsing((open) => !open)} aria-expanded={browsing} className={secondaryButtonClass("h-9 px-3 text-xs")}>
          Choose from Media Library
        </button>
        <input ref={fileInput} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" onChange={upload} className="sr-only" tabIndex={-1} aria-label="Upload image files" />
      </div>

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <li key={url} className="overflow-hidden rounded-md border border-line bg-white">
              <div className="relative aspect-[1.5] bg-surface">
                <Image src={url} alt={`Gallery image ${index + 1}`} fill unoptimized sizes="200px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => remove(url)}
                  aria-label={`Remove gallery image ${index + 1}`}
                  className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-white/95 text-sm leading-none text-ink shadow-sm hover:bg-[#b42318] hover:text-white"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 text-[11px] text-muted">
                <span>{index + 1}</span>
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move earlier" className="rounded px-1.5 py-0.5 hover:bg-surface disabled:opacity-30">
                    ←
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === images.length - 1} aria-label="Move later" className="rounded px-1.5 py-0.5 hover:bg-surface disabled:opacity-30">
                    →
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-xs text-muted">No gallery images yet.</p>
      )}

      <div className="flex gap-2">
        <TextInput
          aria-label="Gallery image address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addAddress();
            }
          }}
          placeholder="…or paste an image address and press Enter"
        />
        <button type="button" onClick={addAddress} className={secondaryButtonClass("h-10 px-3 text-xs")}>
          Add
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-live">
          {error}
        </p>
      )}

      {browsing && (
        <div className="rounded-md border border-line bg-surface p-3">
          {usable.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">The Media Library is empty. Upload images first.</p>
          ) : (
            <ul className="grid max-h-72 grid-cols-2 gap-2.5 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
              {usable.map((asset) => {
                const url = asset.url as string;
                const chosen = images.includes(url);

                return (
                  <li key={asset.id}>
                    <button
                      type="button"
                      onClick={() => (chosen ? remove(url) : add([url]))}
                      aria-pressed={chosen}
                      aria-label={`${chosen ? "Remove" : "Add"} ${asset.title}`}
                      className={cn(
                        "block w-full overflow-hidden rounded-md border bg-white text-left transition-colors hover:border-ink",
                        chosen ? "border-gold ring-2 ring-gold" : "border-line",
                      )}
                    >
                      <span className="relative block aspect-[1.65] bg-surface">
                        <Image src={url} alt="" fill unoptimized sizes="160px" className="object-cover" />
                      </span>
                      <span className="block truncate px-2 py-1.5 text-[11px] leading-4 font-medium text-ink">
                        {chosen ? "✓ " : ""}
                        {asset.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {hint && <p className="text-[11px] leading-4 text-muted">{hint}</p>}
    </div>
  );
}
