import type { CompetitionRef, Match, TickerItem } from "@/lib/api/types";
import { mockNations, mockTeams } from "./teams";

const ipl: CompetitionRef = { slug: "ipl-2026", name: "IPL 2026", format: "T20" };
const psl: CompetitionRef = { slug: "psl-2026", name: "PSL 2026", format: "T20" };
const bpl: CompetitionRef = { slug: "bpl-2026", name: "BPL 2026", format: "T20" };
const odiSeries: CompetitionRef = { slug: "india-nz-odi", name: "ODI Series", format: "ODI" };
const t20iSeries: CompetitionRef = { slug: "pak-sa-t20i", name: "T20I Series", format: "T20I" };

export const mockLiveMatches: Match[] = [
  {
    id: 1001,
    slug: "mi-vs-csk-ipl-2026",
    competition: ipl,
    state: "live",
    home: { team: mockTeams.mi, score: "148/3", overs: "15.2", isBatting: true },
    away: { team: mockTeams.csk, score: "191/6", overs: "20.0" },
    summary: "MI need 44 runs in 28 balls",
    summaryTone: "live",
    startsAt: "2026-11-12T13:30:00+06:00",
  },
  {
    id: 1002,
    slug: "lq-vs-iu-psl-2026",
    competition: psl,
    state: "live",
    home: { team: mockTeams.lq, score: "126/5", overs: "14.4", isBatting: true },
    away: { team: mockTeams.iu, note: "Yet to bat", startTime: "13:00" },
    summary: "Live",
    summaryTone: "live",
    startsAt: "2026-11-12T13:00:00+06:00",
  },
  {
    id: 1003,
    slug: "rr-vs-fb-bpl-2026",
    competition: bpl,
    state: "break",
    home: { team: mockTeams.rr, score: "0/0", overs: "0.0" },
    away: { team: mockTeams.fb, score: "168/8", overs: "20.0" },
    summary: "Innings break — Rangpur Riders require 169 to win.",
    summaryTone: "default",
    startsAt: "2026-11-12T12:30:00+06:00",
  },
];

const indiaVsNewZealand: Match = {
  id: 2001,
  slug: "india-vs-new-zealand-1st-odi",
  competition: odiSeries,
  state: "upcoming",
  home: { team: mockNations.india, startTime: "07:30" },
  away: { team: mockNations.newZealand, startTime: "07:30" },
  venue: "M. Chinnaswamy Stadium, Bengaluru",
  startsAt: "2026-11-13T07:30:00+06:00",
};

const pakistanVsSouthAfrica: Match = {
  id: 2002,
  slug: "pakistan-vs-south-africa-1st-t20i",
  competition: t20iSeries,
  state: "upcoming",
  home: { team: mockNations.pakistan, startTime: "13:00" },
  away: { team: mockNations.southAfrica, startTime: "13:00" },
  venue: "National Stadium, Karachi",
  startsAt: "2026-11-14T13:00:00+06:00",
};

const karachiVsPeshawar: Match = {
  id: 2003,
  slug: "karachi-kings-vs-peshawar-zalmi-psl-2026",
  competition: psl,
  state: "upcoming",
  home: { team: mockTeams.kk, startTime: "13:30" },
  away: { team: mockTeams.pz, startTime: "13:30" },
  venue: "National Stadium, Karachi",
  startsAt: "2026-11-13T13:30:00+06:00",
};

export const mockUpcomingMatches: Match[] = [indiaVsNewZealand, pakistanVsSouthAfrica, karachiVsPeshawar];

const indiaBeatSriLanka = (id: number): Match => ({
  id,
  slug: `india-vs-sri-lanka-odi-${id}`,
  competition: odiSeries,
  state: "result",
  home: { team: mockNations.india, score: "278/4" },
  away: { team: mockNations.sriLanka, score: "274/9" },
  summary: "India won by 6 wickets",
  summaryTone: "default",
  startsAt: "2026-11-11T07:30:00+06:00",
});

export const mockResultMatches: Match[] = [indiaBeatSriLanka(3001), indiaBeatSriLanka(3002)];

/** Pool used by the mock API to answer team fixture lookups. */
export const mockAllMatches: Match[] = [
  ...mockLiveMatches,
  ...mockUpcomingMatches,
  ...mockResultMatches,
];

export const mockIndiaFixtures: Match[] = [
  indiaVsNewZealand,
  mockResultMatches[0],
  mockResultMatches[1],
  pakistanVsSouthAfrica,
];

export const mockTicker: TickerItem[] = [
  { id: 1, text: "LIVE · MI 148/3 (15.2) chasing 192 — Suryakumar Yadav 42*" },
  { id: 2, text: "LIVE · Qalandars 126/5 (14.4) against Islamabad United" },
  { id: 3, text: "Innings break: Rangpur Riders need 169 to win the BPL derby" },
  { id: 4, text: "Ashes: Smith unbeaten on 96 as Australia trail by 113 in Adelaide" },
  { id: 5, text: "India name 15-member squad for New Zealand ODI series" },
];

export const mockSeriesChips: CompetitionRef[] = [
  { slug: "bangladesh-premier-league", name: "BPL", format: "T20" },
  { slug: "the-ashes", name: "Ashes", format: "Test" },
  { slug: "icc-world-cup", name: "World Cups", format: "ODI" },
  { slug: "t20-world-cup", name: "T20 WC", format: "T20" },
];
