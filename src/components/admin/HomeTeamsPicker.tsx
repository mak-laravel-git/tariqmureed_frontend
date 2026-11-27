"use client";

import { useActionState, useMemo, useState } from "react";

import { saveHomeTeamsAction } from "@/app/admin/actions";
import type { FormState, HomeTeamChoice, HomeTeamRow } from "@/lib/admin/types";

import { Card, CardHeader, FormMessage, secondaryButtonClass, TextInput } from "./AdminUi";

const initial: FormState = { status: "idle", message: "" };

/** The full list holds every team SportMonks knows; searching narrows it, so only this many are drawn. */
const LISTED = 60;

const arrow = "flex size-8 items-center justify-center rounded-md border border-line bg-white text-sm text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line";

function TeamText({ team }: { team: HomeTeamRow }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[13px] leading-5 font-semibold text-ink">{team.name}</span>
      <span className="block truncate text-[11px] leading-4 text-muted">
        {team.detail} · {team.matches === 0 ? "No matches yet" : `${team.matches} ${team.matches === 1 ? "match" : "matches"}`}
      </span>
    </span>
  );
}

/** Chooses which teams the home page's Team Fixtures section shows and in what order. */
export function HomeTeamsPicker({ initialChoice }: { initialChoice: HomeTeamChoice }) {
  const [state, action, pending] = useActionState(saveHomeTeamsAction, initial);
  const [selected, setSelected] = useState<HomeTeamRow[]>(initialChoice.selected);
  const [available, setAvailable] = useState<HomeTeamRow[]>(initialChoice.available);
  const [query, setQuery] = useState("");
  const full = selected.length >= initialChoice.limit;

  const matching = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return needle ? available.filter((team) => team.name.toLowerCase().includes(needle)) : available;
  }, [available, query]);

  const move = (index: number, to: number) =>
    setSelected((current) => {
      const next = [...current];
      const [team] = next.splice(index, 1);
      next.splice(to, 0, team);

      return next;
    });

  const add = (team: HomeTeamRow) => {
    setAvailable((current) => current.filter((entry) => entry.id !== team.id));
    setSelected((current) => [...current, team]);
  };

  const remove = (team: HomeTeamRow) => {
    setSelected((current) => current.filter((entry) => entry.id !== team.id));
    // Back to its place: teams with matches first, then A to Z.
    setAvailable((current) =>
      [...current, team].sort((a, b) => Number(b.matches > 0) - Number(a.matches > 0) || a.name.localeCompare(b.name)),
    );
  };

  return (
    <form action={action} id="home-teams-form" aria-busy={pending} className="flex flex-col gap-5">
      <input type="hidden" name="teams" value={JSON.stringify(selected.map((team) => Number(team.id)))} />
      <FormMessage status={state.status} message={state.message} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader
            title={`Shown on the home page (${selected.length} of ${initialChoice.limit})`}
            description="The first team is the one opened when the page loads."
          />
          {selected.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs leading-5 text-muted">
              No team is chosen, so the website picks them by itself
              {initialChoice.automatic.length > 0 ? `: ${initialChoice.automatic.join(", ")}.` : "."}
            </p>
          ) : (
            <ol className="divide-y divide-line">
              {selected.map((team, index) => (
                <li key={team.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 shrink-0 text-center text-xs font-bold text-muted tabular-nums">{index + 1}</span>
                  <TeamText team={team} />
                  <span className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Move ${team.name} up`} title="Up" className={arrow}>
                      ↑
                    </button>
                    <button type="button" onClick={() => move(index, index + 1)} disabled={index === selected.length - 1} aria-label={`Move ${team.name} down`} title="Down" className={arrow}>
                      ↓
                    </button>
                    <button type="button" onClick={() => remove(team)} aria-label={`Remove ${team.name}`} className={secondaryButtonClass("h-8 px-2.5 text-xs text-live hover:border-live")}>
                      Remove
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="self-start">
          <CardHeader
            title="All teams"
            description={full ? `${initialChoice.limit} teams are chosen. Remove one to add another.` : "Search by name, then add the team."}
          />
          <div className="border-b border-line px-4 py-3">
            <TextInput
              aria-label="Search teams"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              // Enter would otherwise save the form.
              onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
              placeholder="Search teams…"
            />
          </div>
          {matching.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-muted">No teams match your search.</p>
          ) : (
            <ul className="max-h-[560px] divide-y divide-line overflow-y-auto">
              {matching.slice(0, LISTED).map((team) => (
                <li key={team.id} className="flex items-center gap-3 px-4 py-3">
                  <TeamText team={team} />
                  <button type="button" onClick={() => add(team)} disabled={full} aria-label={`Add ${team.name}`} className={secondaryButtonClass("h-8 shrink-0 px-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-40")}>
                    Add
                  </button>
                </li>
              ))}
              {matching.length > LISTED && (
                <li className="px-5 py-3 text-center text-[11px] text-muted">
                  {matching.length - LISTED} more teams. Search by name to find them.
                </li>
              )}
            </ul>
          )}
        </Card>
      </div>
    </form>
  );
}
