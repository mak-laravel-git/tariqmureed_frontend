import type {
  RecordEntry,
  RecordGroup,
  RecordsPageData,
  StatsMetricTable,
  StatsPageData,
  StatsScope,
} from "@/lib/api/types";

function table(
  id: string,
  scope: string,
  format: string,
  title: string,
  subject: string,
  valueLabel: string,
  rows: [name: string, note: string, value: string][],
): StatsMetricTable & { format: string; scope: string } {
  return {
    id,
    scope,
    format,
    eyebrow: `${scope.toUpperCase()} · ${format.toUpperCase()}`,
    title,
    subject,
    valueLabel,
    rows: rows.map(([name, note, value], index) => ({ rank: index + 1, name, note, value })),
  };
}

const statTables = [
  table("player-most-runs-odi", "player", "ODI", "Most runs", "Player", "Most runs", [
    ["Rohit Sharma", "Career runs", "11168"],
    ["Suryakumar Yadav", "Most runs in the format", "2620"],
    ["Joe Root", "Career runs", "13100"],
  ]),
  table("player-most-wickets-odi", "player", "ODI", "Most wickets", "Player", "Most wickets", [
    ["Kuldeep Yadav", "Career wicket tally", "178"],
    ["Rashid Khan", "Career wicket tally", "160"],
    ["Pat Cummins", "Career wicket tally", "310"],
  ]),
  table("player-highest-strike-rate-t20i", "player", "T20I", "Highest strike rate", "Player", "Highest strike rate", [
    ["Travis Head", "Min. 500 runs", "172.10"],
  ]),
  table("player-best-economy-t20i", "player", "T20I", "Best economy", "Player", "Best economy", [
    ["Jasprit Bumrah", "Min. 40 innings", "6.31"],
  ]),
  table("team-most-wins-odi", "team", "ODI", "Most wins", "Team", "Wins", [
    ["Australia", "Matches won", "614"],
    ["India", "Matches won", "539"],
    ["Pakistan", "Matches won", "517"],
  ]),
  table("team-highest-total-t20i", "team", "T20I", "Highest innings total", "Team", "Total", [
    ["Zimbabwe", "vs Gambia, 2024", "344/4"],
    ["Nepal", "vs Mongolia, 2023", "314/3"],
    ["India", "vs Bangladesh, 2024", "297/6"],
  ]),
  table("tournament-most-titles-t20", "tournament", "T20", "Most titles", "Team", "Titles", [
    ["Mumbai Indians", "IPL titles", "5"],
    ["Chennai Super Kings", "IPL titles", "5"],
    ["Kolkata Knight Riders", "IPL titles", "3"],
  ]),
  table("tournament-most-titles-odi", "tournament", "ODI", "Most World Cup titles", "Team", "Titles", [
    ["Australia", "ICC Cricket World Cup", "6"],
    ["India", "ICC Cricket World Cup", "2"],
    ["West Indies", "ICC Cricket World Cup", "2"],
  ]),
];

/** Leaderboards for a scope, optionally narrowed to one format. */
export function buildMockStatsPage(scope: StatsScope, format: string | undefined): StatsPageData {
  const tables = statTables
    .filter((entry) => entry.scope === scope && (!format || entry.format === format))
    .map((entry) => ({
      id: entry.id,
      eyebrow: entry.eyebrow,
      title: entry.title,
      subject: entry.subject,
      valueLabel: entry.valueLabel,
      rows: entry.rows,
    }));

  return { scope, format: format ?? null, metricCount: tables.length, tables };
}

function record(
  id: string,
  group: RecordGroup,
  title: string,
  holder: string,
  format: string,
  detail: string,
  value: string,
): RecordEntry {
  return { id, group, title, holder, format, detail, value };
}

const records: RecordEntry[] = [
  record("lara-400", "batting", "Highest individual score", "Brian Lara", "Test", "vs England, St John's, 2004", "400*"),
  record("tendulkar-test", "batting", "Most career runs", "Sachin Tendulkar", "Test", "200 matches, 1989-2013", "15,921"),
  record("tendulkar-odi", "batting", "Most career runs", "Sachin Tendulkar", "ODI", "463 matches", "18,426"),
  record("guptill-237", "batting", "Highest individual score", "Martin Guptill", "ODI", "vs West Indies, 2015", "237*"),
  record("conway-fastest", "batting", "Fastest century", "Devon Conway", "T20I", "TMN Sport records database", "36 balls"),
  record("laker-10-53", "bowling", "Most wickets in an innings", "Jim Laker", "Test", "vs Australia, Old Trafford, 1956", "10/53"),
  record("murali-test", "bowling", "Most career wickets", "Muttiah Muralitharan", "Test", "133 matches", "800"),
  record("murali-odi", "bowling", "Most career wickets", "Muttiah Muralitharan", "ODI", "350 matches", "534"),
  record("rashid-5-3", "bowling", "Best figures", "Rashid Khan", "T20I", "TMN Sport records database", "5/3"),
  record("sri-lanka-952", "team", "Highest innings total", "Sri Lanka", "Test", "vs India, Colombo, 1997", "952/6"),
  record("england-498", "team", "Highest innings total", "England", "ODI", "vs Netherlands, 2022", "498/4"),
  record("afghanistan-310", "team", "Biggest win margin (runs)", "Afghanistan", "T20I", "TMN Sport records database", "310 runs"),
  record("australia-series", "tournament", "Most series wins", "Australia", "Test", "Ashes history", "34"),
  record("mumbai-titles", "tournament", "Most titles", "Mumbai Indians", "T20", "IPL titles", "5"),
];

const groups: RecordGroup[] = ["batting", "bowling", "team", "tournament"];

/** Landmark records, optionally narrowed to a group and a format. */
export function buildMockRecordsPage(group: RecordGroup | undefined, format: string | undefined): RecordsPageData {
  const inFormat = records.filter((entry) => !format || entry.format === format);

  return {
    group: group ?? null,
    format: format ?? null,
    total: inFormat.filter((entry) => !group || entry.group === group).length,
    groupCounts: Object.fromEntries(
      groups.map((name) => [name, inFormat.filter((entry) => entry.group === name).length]),
    ) as Record<RecordGroup, number>,
    records: inFormat.filter((entry) => !group || entry.group === group),
  };
}
