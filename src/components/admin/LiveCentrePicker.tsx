"use client";

import { useActionState, useMemo, useState } from "react";

import { saveLiveCentreAction } from "@/app/admin/actions";
import type { FormState, LiveCentreChoice, LiveCentreRow } from "@/lib/admin/types";

import { Card, CardHeader, FormMessage, secondaryButtonClass, TextInput } from "./AdminUi";

const initial: FormState = { status: "idle", message: "" };

/** The full list holds every competition SportMonks knows; searching narrows it, so only this many are drawn. */
const LISTED = 60;

const arrow = "flex size-8 items-center justify-center rounded-md border border-line bg-white text-sm text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line";

function CompetitionText({ row, windowDays }: { row: LiveCentreRow; windowDays: number }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[13px] leading-5 font-semibold text-ink">{row.name}</span>
      <span className="block truncate text-[11px] leading-4 text-muted">
        {row.detail ? `${row.detail} · ` : ""}
        {row.matches === 0 ? `No match within ${windowDays} days` : `${row.matches} ${row.matches === 1 ? "match" : "matches"} within ${windowDays} days`}
      </span>
    </span>
  );
}

/** Arranges which competitions the home page's Live Match Center shows first. */
export function LiveCentrePicker({ initialChoice }: { initialChoice: LiveCentreChoice }) {
  const [state, action, pending] = useActionState(saveLiveCentreAction, initial);
  const [selected, setSelected] = useState<LiveCentreRow[]>(initialChoice.selected);
  const [available, setAvailable] = useState<LiveCentreRow[]>(initialChoice.available);
  const [query, setQuery] = useState("");
  const { windowDays } = initialChoice;

  const matching = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return needle ? available.filter((row) => `${row.name} ${row.detail}`.toLowerCase().includes(needle)) : available;
  }, [available, query]);

  const move = (index: number, to: number) =>
    setSelected((current) => {
      const next = [...current];
      const [row] = next.splice(index, 1);
      next.splice(to, 0, row);

      return next;
    });

  const add = (row: LiveCentreRow) => {
    setAvailable((current) => current.filter((entry) => entry.id !== row.id));
    setSelected((current) => [...current, row]);
  };

  const remove = (row: LiveCentreRow) => {
    setSelected((current) => current.filter((entry) => entry.id !== row.id));
    // Back to its place: competitions with matches first, internationals before the rest, then A to Z.
    setAvailable((current) =>
      [...current, row].sort(
        (a, b) =>
          Number(b.matches > 0) - Number(a.matches > 0) ||
          Number(b.detail.startsWith("International")) - Number(a.detail.startsWith("International")) ||
          a.name.localeCompare(b.name),
      ),
    );
  };

  return (
    <form action={action} id="live-centre-form" aria-busy={pending} className="flex flex-col gap-5">
      <input type="hidden" name="leagues" value={JSON.stringify(selected.map((row) => Number(row.id)))} />
      <FormMessage status={state.status} message={state.message} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader
            title={`Shown first (${selected.length})`}
            description="In this order. After them come the other internationals, then the other league matches."
          />
          {selected.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs leading-5 text-muted">
              Nothing is arranged, so international matches are shown first, then league matches.
            </p>
          ) : (
            <ol className="divide-y divide-line">
              {selected.map((row, index) => (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 shrink-0 text-center text-xs font-bold text-muted tabular-nums">{index + 1}</span>
                  <CompetitionText row={row} windowDays={windowDays} />
                  <span className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => move(index, 0)} disabled={index === 0} aria-label={`Move ${row.name} to the top`} title="To the top" className={arrow}>
                      ⤒
                    </button>
                    <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Move ${row.name} up`} title="Up" className={arrow}>
                      ↑
                    </button>
                    <button type="button" onClick={() => move(index, index + 1)} disabled={index === selected.length - 1} aria-label={`Move ${row.name} down`} title="Down" className={arrow}>
                      ↓
                    </button>
                    <button type="button" onClick={() => remove(row)} aria-label={`Remove ${row.name}`} className={secondaryButtonClass("h-8 px-2.5 text-xs text-live hover:border-live")}>
                      Remove
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="self-start">
          <CardHeader title="Other competitions" description="Search by name, then add the competition to the first list." />
          <div className="border-b border-line px-4 py-3">
            <TextInput
              aria-label="Search competitions"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              // Enter would otherwise save the form.
              onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
              placeholder="Search competitions…"
            />
          </div>
          {matching.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-muted">No competitions match your search.</p>
          ) : (
            <ul className="max-h-[560px] divide-y divide-line overflow-y-auto">
              {matching.slice(0, LISTED).map((row) => (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                  <CompetitionText row={row} windowDays={windowDays} />
                  <button type="button" onClick={() => add(row)} aria-label={`Add ${row.name}`} className={secondaryButtonClass("h-8 shrink-0 px-2.5 text-xs")}>
                    Add
                  </button>
                </li>
              ))}
              {matching.length > LISTED && (
                <li className="px-5 py-3 text-center text-[11px] text-muted">
                  {matching.length - LISTED} more competitions. Search by name to find them.
                </li>
              )}
            </ul>
          )}
        </Card>
      </div>
    </form>
  );
}
