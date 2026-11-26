"use client";

import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState, useTransition } from "react";

import { cropImageAction } from "@/app/admin/actions";
import { type CropHandle, type CropRatio, type CropRect, type ImageSize, initialCrop, moveCrop, resizeCrop, toPixels } from "@/lib/admin/crop";
import type { MediaAsset } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

import { primaryButtonClass, secondaryButtonClass } from "./AdminUi";

interface CropDialogProps {
  /** The full library picture being cropped. */
  asset: MediaAsset & { url: string };
  /** Shape this picture place works best with; selected when the window opens. */
  preset?: CropRatio;
  /** Called with the address to use: the new cropped file, or the full picture. */
  onDone: (url: string) => void;
  onClose: () => void;
}

interface RatioChoice {
  key: string;
  label: string;
  /** Width divided by height; null = any shape. */
  value: number | null;
}

const corners: { handle: Exclude<CropHandle, "move">; className: string }[] = [
  { handle: "nw", className: "top-0 left-0 cursor-nwse-resize border-t-4 border-l-4" },
  { handle: "ne", className: "top-0 right-0 cursor-nesw-resize border-t-4 border-r-4" },
  { handle: "sw", className: "bottom-0 left-0 cursor-nesw-resize border-b-4 border-l-4" },
  { handle: "se", className: "right-0 bottom-0 cursor-nwse-resize border-r-4 border-b-4" },
];

function ratioChoices(preset?: CropRatio): RatioChoice[] {
  const standard: RatioChoice[] = [
    { key: "free", label: "Free", value: null },
    { key: "16:9", label: "16:9", value: 16 / 9 },
    { key: "4:3", label: "4:3", value: 4 / 3 },
    { key: "1:1", label: "1:1", value: 1 },
  ];

  if (!preset) {
    return standard;
  }

  const name = `${preset.width}:${preset.height}`;

  return [
    { key: "preset", label: `Recommended ${name}`, value: preset.width / preset.height },
    ...standard.filter((choice) => choice.key !== name),
  ];
}

/** Window for choosing which part of a picture to use. The cut is made by the API from the full-size file. */
export function CropDialog({ asset, preset, onDone, onClose }: CropDialogProps) {
  const choices = ratioChoices(preset);
  const [choice, setChoice] = useState(choices[0]);
  const [image, setImage] = useState<ImageSize | null>(null);
  const [rect, setRect] = useState<CropRect | null>(null);
  const [error, setError] = useState("");
  const [saving, startSaving] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ handle: CropHandle; x: number; y: number; rect: CropRect } | null>(null);

  useEffect(() => {
    const element = dialog.current;

    if (element && !element.open) {
      element.showModal();
    }
  }, []);

  const choose = (next: RatioChoice) => {
    setChoice(next);

    if (image) {
      setRect(initialCrop(image, next.value));
    }
  };

  const change = (start: CropRect, handle: CropHandle, dx: number, dy: number) => {
    if (image) {
      setRect(handle === "move" ? moveCrop(start, dx, dy, image) : resizeCrop(start, handle, dx, dy, image, choice.value));
    }
  };

  const startDrag = (handle: CropHandle, event: PointerEvent<HTMLElement>) => {
    if (!rect || saving) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { handle, x: event.clientX, y: event.clientY, rect };
  };

  const onDrag = (event: PointerEvent<HTMLElement>) => {
    const start = drag.current;
    const shown = frame.current?.clientWidth;

    if (start && shown && image) {
      const scale = image.width / shown;
      change(start.rect, start.handle, (event.clientX - start.x) * scale, (event.clientY - start.y) * scale);
    }
  };

  const endDrag = () => {
    drag.current = null;
  };

  // Arrow keys move the box; with Shift they change its size.
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];

    if (!direction || !rect || !image || saving) {
      return;
    }

    event.preventDefault();
    const step = Math.max(1, Math.round(image.width / 100));
    change(rect, event.shiftKey ? "se" : "move", direction[0] * step, direction[1] * step);
  };

  const apply = () => {
    if (!rect || !image) {
      return;
    }

    const area = toPixels(rect, image);

    // Choosing everything needs no new file.
    if (area.width === image.width && area.height === image.height) {
      onDone(asset.url);

      return;
    }

    setError("");
    startSaving(async () => {
      const result = await cropImageAction(asset.id, area);

      if (result.asset?.url) {
        onDone(result.asset.url);
      } else {
        setError(result.error ?? "The image could not be cropped.");
      }
    });
  };

  const area = rect && image ? toPixels(rect, image) : null;
  const percent = (value: number, total: number) => `${(value / total) * 100}%`;

  return (
    <dialog
      ref={dialog}
      aria-label={`Crop ${asset.title}`}
      onCancel={(event) => {
        event.preventDefault();

        if (!saving) {
          onClose();
        }
      }}
      className="m-auto max-h-[94vh] w-[min(94vw,880px)] overflow-y-auto rounded-lg bg-white p-0 text-ink shadow-xl backdrop:bg-black/70"
    >
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h2 className="text-[15px] leading-5 font-medium">Crop image</h2>
          <p className="mt-0.5 text-xs leading-[18px] text-muted">
            Drag the box to move it and its corners to resize it. The original picture stays in the Media Library.
          </p>
        </div>

        <div role="group" aria-label="Crop shape" className="flex flex-wrap gap-2">
          {choices.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => choose(option)}
              aria-pressed={option.key === choice.key}
              disabled={saving}
              className={secondaryButtonClass(cn("h-8 px-3 text-xs", option.key === choice.key && "border-gold bg-gold hover:border-gold"))}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center rounded-md bg-surface p-3">
          <div ref={frame} className="relative w-fit overflow-hidden select-none">
            {/* eslint-disable-next-line @next/next/no-img-element -- the crop box needs the picture's real pixel size */}
            <img
              src={asset.url}
              alt=""
              draggable={false}
              onLoad={(event) => {
                const size = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight };
                setImage(size);
                setRect(initialCrop(size, choice.value));
              }}
              onError={() => setError("The image could not be loaded.")}
              className="block h-auto max-h-[56vh] w-auto max-w-full"
            />
            {rect && image && (
              <div
                tabIndex={0}
                role="group"
                aria-label="Crop area. Use the arrow keys to move it, and Shift with the arrow keys to resize it."
                onPointerDown={(event) => startDrag("move", event)}
                onPointerMove={onDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={onKey}
                style={{
                  left: percent(rect.x, image.width),
                  top: percent(rect.y, image.height),
                  width: percent(rect.width, image.width),
                  height: percent(rect.height, image.height),
                }}
                className="absolute cursor-move touch-none border border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] focus-visible:border-2 focus-visible:border-gold focus-visible:outline-none"
              >
                {corners.map((corner) => (
                  <span key={corner.handle} aria-hidden="true" onPointerDown={(event) => startDrag(corner.handle, event)} className={cn("absolute size-5 border-gold", corner.className)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-live">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-xs text-muted">
            {area ? `Cropped size: ${area.width} × ${area.height} px` : "Loading image…"}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={onClose} disabled={saving} className={secondaryButtonClass()}>
              Cancel
            </button>
            <button type="button" onClick={() => onDone(asset.url)} disabled={saving} className={secondaryButtonClass()}>
              Use full image
            </button>
            <button type="button" onClick={apply} disabled={saving || !area} className={primaryButtonClass()}>
              {saving ? "Cropping…" : "Apply crop"}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
