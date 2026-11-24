"use client";

import { useActionState, useMemo, useState } from "react";

import { saveSeriesArrangementAction } from "@/app/admin/actions";
import type { FormState, SeriesArrangement, SeriesRow } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

import { Card, CardHeader, FormMessage, secondaryButtonClass, TextInput } from "./AdminUi";

const initial: FormState = { status: "idle", message: "" };

const statusTone: Record<string, string> = {
  "In progress": "bg-[#fdecec] text-[#b42318]",
  Upcoming: "bg-[#fff2c2] text-[#7a5b00]",
  Completed: "bg-surface text-charade",
  "No matches yet": "bg-surface text-muted",
};

function StatusPill({ status }: { status: string }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap", statusTone[status] ?? "bg-surface text-charade")}>{status}</span>;
}

const arrow = "flex size-8 items-center justify-center rounded-md border border-line bg-white text-sm text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line";

/**
 * Chooses which competitions the website's SERIES strip shows and in what order. Competitions arrive from
 * SportMonks on their own; this screen decides what the visitors see, and a new one appears after the arranged
 * ones until it is placed here.
 */
export function SeriesArranger({ initialArrangement }: { initialArrangement: SeriesArrangement }) {
  const [state, action, pending] = useActionState(saveSeriesArrangementAction, initial);
  const [visible, setVisible] = useState<SeriesRow[]>(initialArrangement.visible);
  const [hidden, setHidden] = useState<SeriesRow[]>(initialArrangement.hidden);
  const [query, setQuery] = useState("");

  const shownHidden = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return needle ? hidden.filter((row) => `${row.name} ${row.detail}`.toLowerCase().includes(needle)) : hidden;
  }, [hidden, query]);

  const move = (index: number, to: number) =>
    setVisible((current) => {
      const next = [...current];
      const [row] = next.splice(index, 1);
      next.splice(Math.max(0, Math.min(next.length, to)), 0, row);

      return next;
    });

  const hide = (row: SeriesRow) => {
    setVisible((current) => current.filter((entry) => entry.id !== row.id));
    setHidden((current) => [...current, row].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const show = (row: SeriesRow) => {
    setHidden((current) => current.filter((entry) => entry.id !== row.id));
    setVisible((current) => [...current, row]);
  };

  return (
    <form action={action} id="series-form" aria-busy={pending} className="flex flex-col gap-5">
      <input type="hidden" name="visible" value={JSON.stringify(visible.map((row) => Number(row.id)))} />
      <FormMessage status={state.status} message={state.message} />

      <Card>
        <CardHeader title="How the website strip looks" description="The SERIES bar under the menu, in the order you set. The first ones are seen first." />
        <div className="overflow-x-auto px-5 py-4">
          {visible.length === 0 ? (
            <p className="text-xs text-muted">No series is shown. Add some from the hidden list.</p>
          ) : (
            <ul className="flex min-w-max items-center gap-2" aria-label="Preview of the series strip">
              <li className="pr-1 text-[10.5px] font-bold tracking-[0.08em] text-charade uppercase">Series</li>
              {visible.map((row) => (
                <li key={row.id} className="rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap text-ink">
                  {row.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader title={`Shown on the website (${visible.length})`} description="Use the arrows to put the important ones first." />
          {visible.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-muted">Nothing is shown. Choose from the hidden list.</p>
          ) : (
            <ol className="divide-y divide-line">
              {visible.map((row, index) => (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 shrink-0 text-center text-xs font-bold text-muted tabular-nums">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] leading-5 font-semibold text-ink">{row.name}</span>
                    <span className="flex items-center gap-2 text-[11px] leading-4 text-muted">
                      <StatusPill status={row.status} />
                      <span className="truncate">{row.detail}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => move(index, 0)} disabled={index === 0} aria-label={`Move ${row.name} to the top`} title="To the top" className={arrow}>
                      ⤒
                    </button>
                    <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Move ${row.name} up`} title="Up" className={arrow}>
                      ↑
                    </button>
                    <button type="button" onClick={() => move(index, index + 1)} disabled={index === visible.length - 1} aria-label={`Move ${row.name} down`} title="Down" className={arrow}>
                      ↓
                    </button>
                    <button type="button" onClick={() => hide(row)} aria-label={`Hide ${row.name}`} className={secondaryButtonClass("h-8 px-2.5 text-xs text-live hover:border-live")}>
                      Hide
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="self-start">
          <CardHeader title={`Hidden (${hidden.length})`} description="Not shown to visitors. Matches of hidden series are still listed on the live scores pages." />
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <TextInput aria-label="Search hidden series" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search hidden series…" />
            {hidden.length > 0 && (
              <button type="button" onClick={() => hidden.forEach(show)} className={secondaryButtonClass("h-10 shrink-0 px-3 text-xs")}>
                Show all
              </button>
            )}
          </div>
          {shownHidden.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-muted">{hidden.length === 0 ? "Every series is shown." : "No hidden series match your search."}</p>
          ) : (
            <ul className="max-h-[560px] divide-y divide-line overflow-y-auto">
              {shownHidden.map((row) => (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] leading-5 font-semibold text-ink">{row.name}</span>
                    <span className="flex items-center gap-2 text-[11px] leading-4 text-muted">
                      <StatusPill status={row.status} />
                      <span className="truncate">{row.detail}</span>
                    </span>
                  </span>
                  <button type="button" onClick={() => show(row)} aria-label={`Show ${row.name}`} className={secondaryButtonClass("h-8 shrink-0 px-2.5 text-xs")}>
                    Show
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </form>
  );
}
