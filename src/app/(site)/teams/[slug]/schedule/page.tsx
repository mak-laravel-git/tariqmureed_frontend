import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { TimezoneSync } from "@/components/matches/TimezoneSync";
import { Container } from "@/components/ui/Container";
import { FixtureCard } from "@/components/ui/FixtureCard";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { PageIntro } from "@/components/ui/PageIntro";
import { getTeamSchedule } from "@/lib/api/endpoints";
import type { Match } from "@/lib/api/types";
import { formatCalendarDate } from "@/lib/format";
import { calendarDay } from "@/lib/moment";
import { profileMetadata } from "@/lib/seo";
import { visitorTimezone } from "@/lib/visitor-timezone";

export async function generateMetadata(props: PageProps<"/teams/[slug]/schedule">): Promise<Metadata> {
  const { slug } = await props.params;
  const team = (await getTeamSchedule(slug))?.team;

  if (!team) {
    return {};
  }

  return profileMetadata({
    path: `/teams/${team.slug}/schedule`,
    title: `${team.name}: match schedule`,
    description: `Every match of ${team.name} from today onwards, by date, with start times in your time zone.`,
  });
}

function Message({ children }: { children: string }) {
  return <p className="mt-8 rounded-[4px] border border-[#e4e4e7] bg-white px-5 py-14 text-center text-sm text-muted">{children}</p>;
}

/**
 * The matches by day, the nearest day first. One that started on an earlier day and is still being played
 * belongs to today.
 */
function byDay(matches: Match[], today: string, timeZone: string): [string, Match[]][] {
  const days = new Map<string, Match[]>();

  for (const match of [...matches].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const started = calendarDay(match.startsAt, timeZone);
    const day = started < today ? today : started;
    days.set(day, [...(days.get(day) ?? []), match]);
  }

  return [...days];
}

async function ScheduleView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // "Today" is the visitor's, not the server's.
  const timezone = await visitorTimezone();
  const schedule = await getTeamSchedule(slug);

  if (!schedule) {
    notFound();
  }

  const { team, upcoming, results } = schedule;

  if (!team) {
    return (
      <Container className="py-16">
        <Message>The schedule is not available right now.</Message>
      </Container>
    );
  }

  // The clock is read for each request, never while the page is built.
  await connection();
  const today = calendarDay(new Date().toISOString(), timezone);
  // Everything still to come, and what has already finished today.
  const matches = [...upcoming, ...results.filter((match) => calendarDay(match.startsAt, timezone) === today)];
  const anyLive = upcoming.some((match) => match.state === "live" || match.state === "break");

  return (
    <>
      <PageIntro title={`${team.name} schedule`} description={`Every match of ${team.name} from today onwards.`}>
        <Link href={`/teams/${team.slug}`} className="mt-4 inline-block text-sm leading-5 font-bold text-ink hover:underline">
          <span aria-hidden="true">←</span> Back to {team.name}
        </Link>
      </PageIntro>

      <Container className="pb-16">
        <TimezoneSync used={timezone} />
        {anyLive && <LiveRefresh seconds={10} />}

        {matches.length > 0 ? (
          byDay(matches, today, timezone).map(([day, onDay]) => (
            <section key={day} aria-labelledby={`day-${day}`} className="pt-8">
              <h2
                id={`day-${day}`}
                className="flex flex-wrap items-center gap-3 border-b border-[#e4e4e7] pb-4 text-xl leading-7 font-bold text-[#09090b]"
              >
                {formatCalendarDate(day)}
                {day === today && (
                  <span className="rounded-[4px] bg-brand px-2 py-0.5 text-[10px] leading-[15px] font-black tracking-[1.5px] uppercase">Today</span>
                )}
              </h2>
              <div className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2 lg:grid-cols-3">
                {onDay.map((match) => (
                  <FixtureCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <Message>{`No matches are scheduled for ${team.name} from today.`}</Message>
        )}
      </Container>
    </>
  );
}

export default function TeamSchedulePage(props: PageProps<"/teams/[slug]/schedule">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading schedule" className="min-h-[800px]" />}>
      <ScheduleView params={props.params} />
    </Suspense>
  );
}
