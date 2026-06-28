import type { GroupKey } from "./worldCupGroups.js";

export type ScheduleStage =
  | "group"
  | "r32"
  | "r16"
  | "qf"
  | "sf"
  | "third"
  | "final";

export type ScheduleMatch = {
  group?: GroupKey;
  stage?: ScheduleStage;
  stageLabel?: string;
  matchNumber?: number;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  kickoffUtc: string;
};

export const WORLD_CUP_GROUP_STAGE_SCHEDULE: ScheduleMatch[] = [
  {
    group: "A",
    homeTeam: "Mexico",
    awayTeam: "South Africa",
    venue: "Mexico City",
    kickoffUtc: "2026-06-11T19:00:00Z"
  },
  {
    group: "A",
    homeTeam: "South Korea",
    awayTeam: "Czechia",
    venue: "Zapopan, Mexico",
    kickoffUtc: "2026-06-12T02:00:00Z"
  },
  {
    group: "B",
    homeTeam: "Canada",
    awayTeam: "Bosnia and Herzegovina",
    venue: "Toronto",
    kickoffUtc: "2026-06-12T19:00:00Z"
  },
  {
    group: "D",
    homeTeam: "United States",
    awayTeam: "Paraguay",
    venue: "Inglewood, California",
    kickoffUtc: "2026-06-13T01:00:00Z"
  },
  {
    group: "B",
    homeTeam: "Qatar",
    awayTeam: "Switzerland",
    venue: "Santa Clara, California",
    kickoffUtc: "2026-06-13T19:00:00Z"
  },
  {
    group: "C",
    homeTeam: "Brazil",
    awayTeam: "Morocco",
    venue: "East Rutherford, New Jersey",
    kickoffUtc: "2026-06-13T22:00:00Z"
  },
  {
    group: "C",
    homeTeam: "Haiti",
    awayTeam: "Scotland",
    venue: "Foxborough, Massachusetts",
    kickoffUtc: "2026-06-14T01:00:00Z"
  },
  {
    group: "D",
    homeTeam: "Australia",
    awayTeam: "Türkiye",
    venue: "Vancouver",
    kickoffUtc: "2026-06-14T04:00:00Z"
  },
  {
    group: "E",
    homeTeam: "Germany",
    awayTeam: "Curacao",
    venue: "Houston",
    kickoffUtc: "2026-06-14T17:00:00Z"
  },
  {
    group: "F",
    homeTeam: "Netherlands",
    awayTeam: "Japan",
    venue: "Arlington, Texas",
    kickoffUtc: "2026-06-14T20:00:00Z"
  },
  {
    group: "E",
    homeTeam: "Ivory Coast",
    awayTeam: "Ecuador",
    venue: "Philadelphia",
    kickoffUtc: "2026-06-14T23:00:00Z"
  },
  {
    group: "F",
    homeTeam: "Sweden",
    awayTeam: "Tunisia",
    venue: "Guadalupe, Mexico",
    kickoffUtc: "2026-06-15T02:00:00Z"
  },
  {
    group: "H",
    homeTeam: "Spain",
    awayTeam: "Cape Verde",
    venue: "Atlanta",
    kickoffUtc: "2026-06-15T17:00:00Z"
  },
  {
    group: "G",
    homeTeam: "Belgium",
    awayTeam: "Egypt",
    venue: "Seattle",
    kickoffUtc: "2026-06-15T22:00:00Z"
  },
  {
    group: "H",
    homeTeam: "Saudi Arabia",
    awayTeam: "Uruguay",
    venue: "Miami Gardens, Florida",
    kickoffUtc: "2026-06-15T22:00:00Z"
  },
  {
    group: "G",
    homeTeam: "Iran",
    awayTeam: "New Zealand",
    venue: "Inglewood, California",
    kickoffUtc: "2026-06-16T04:00:00Z"
  },
  {
    group: "I",
    homeTeam: "France",
    awayTeam: "Senegal",
    venue: "East Rutherford, New Jersey",
    kickoffUtc: "2026-06-16T19:00:00Z"
  },
  {
    group: "I",
    homeTeam: "Iraq",
    awayTeam: "Norway",
    venue: "Foxborough, Massachusetts",
    kickoffUtc: "2026-06-16T22:00:00Z"
  },
  {
    group: "J",
    homeTeam: "Argentina",
    awayTeam: "Algeria",
    venue: "Kansas City, Missouri",
    kickoffUtc: "2026-06-17T01:00:00Z"
  },
  {
    group: "J",
    homeTeam: "Austria",
    awayTeam: "Jordan",
    venue: "Santa Clara, California",
    kickoffUtc: "2026-06-17T04:00:00Z"
  },
  {
    group: "K",
    homeTeam: "Portugal",
    awayTeam: "Congo DR",
    venue: "Houston",
    kickoffUtc: "2026-06-17T17:00:00Z"
  },
  {
    group: "L",
    homeTeam: "England",
    awayTeam: "Croatia",
    venue: "Arlington, Texas",
    kickoffUtc: "2026-06-17T20:00:00Z"
  },
  {
    group: "L",
    homeTeam: "Ghana",
    awayTeam: "Panama",
    venue: "Toronto",
    kickoffUtc: "2026-06-17T23:00:00Z"
  },
  {
    group: "K",
    homeTeam: "Uzbekistan",
    awayTeam: "Colombia",
    venue: "Mexico City",
    kickoffUtc: "2026-06-18T02:00:00Z"
  },
  {
    group: "A",
    homeTeam: "Czechia",
    awayTeam: "South Africa",
    venue: "Atlanta",
    kickoffUtc: "2026-06-18T16:00:00Z"
  },
  {
    group: "B",
    homeTeam: "Switzerland",
    awayTeam: "Bosnia and Herzegovina",
    venue: "Inglewood, California",
    kickoffUtc: "2026-06-18T19:00:00Z"
  },
  {
    group: "B",
    homeTeam: "Canada",
    awayTeam: "Qatar",
    venue: "Vancouver",
    kickoffUtc: "2026-06-18T22:00:00Z"
  },
  {
    group: "A",
    homeTeam: "Mexico",
    awayTeam: "South Korea",
    venue: "Zapopan, Mexico",
    kickoffUtc: "2026-06-19T03:00:00Z"
  },
  {
    group: "D",
    homeTeam: "United States",
    awayTeam: "Australia",
    venue: "Seattle",
    kickoffUtc: "2026-06-19T19:00:00Z"
  },
  {
    group: "C",
    homeTeam: "Scotland",
    awayTeam: "Morocco",
    venue: "Foxborough, Massachusetts",
    kickoffUtc: "2026-06-19T22:00:00Z"
  },
  {
    group: "C",
    homeTeam: "Brazil",
    awayTeam: "Haiti",
    venue: "Philadelphia",
    kickoffUtc: "2026-06-20T01:00:00Z"
  },
  {
    group: "D",
    homeTeam: "Türkiye",
    awayTeam: "Paraguay",
    venue: "Santa Clara, California",
    kickoffUtc: "2026-06-20T04:00:00Z"
  },
  {
    group: "F",
    homeTeam: "Netherlands",
    awayTeam: "Sweden",
    venue: "Houston",
    kickoffUtc: "2026-06-20T17:00:00Z"
  },
  {
    group: "E",
    homeTeam: "Germany",
    awayTeam: "Ivory Coast",
    venue: "Toronto",
    kickoffUtc: "2026-06-20T20:00:00Z"
  },
  {
    group: "E",
    homeTeam: "Ecuador",
    awayTeam: "Curacao",
    venue: "Kansas City, Missouri",
    kickoffUtc: "2026-06-21T00:00:00Z"
  },
  {
    group: "F",
    homeTeam: "Tunisia",
    awayTeam: "Japan",
    venue: "Guadalupe, Mexico",
    kickoffUtc: "2026-06-21T04:00:00Z"
  },
  {
    group: "H",
    homeTeam: "Spain",
    awayTeam: "Saudi Arabia",
    venue: "Atlanta",
    kickoffUtc: "2026-06-21T16:00:00Z"
  },
  {
    group: "G",
    homeTeam: "Belgium",
    awayTeam: "Iran",
    venue: "Inglewood, California",
    kickoffUtc: "2026-06-21T19:00:00Z"
  },
  {
    group: "H",
    homeTeam: "Uruguay",
    awayTeam: "Cape Verde",
    venue: "Miami Gardens, Florida",
    kickoffUtc: "2026-06-21T22:00:00Z"
  },
  {
    group: "G",
    homeTeam: "New Zealand",
    awayTeam: "Egypt",
    venue: "Vancouver",
    kickoffUtc: "2026-06-22T01:00:00Z"
  },
  {
    group: "J",
    homeTeam: "Argentina",
    awayTeam: "Austria",
    venue: "Arlington, Texas",
    kickoffUtc: "2026-06-22T17:00:00Z"
  },
  {
    group: "I",
    homeTeam: "France",
    awayTeam: "Iraq",
    venue: "Philadelphia",
    kickoffUtc: "2026-06-22T21:00:00Z"
  },
  {
    group: "I",
    homeTeam: "Norway",
    awayTeam: "Senegal",
    venue: "East Rutherford, New Jersey",
    kickoffUtc: "2026-06-23T00:00:00Z"
  },
  {
    group: "J",
    homeTeam: "Jordan",
    awayTeam: "Algeria",
    venue: "Santa Clara, California",
    kickoffUtc: "2026-06-23T03:00:00Z"
  },
  {
    group: "K",
    homeTeam: "Portugal",
    awayTeam: "Uzbekistan",
    venue: "Houston",
    kickoffUtc: "2026-06-23T17:00:00Z"
  },
  {
    group: "L",
    homeTeam: "England",
    awayTeam: "Ghana",
    venue: "Foxborough, Massachusetts",
    kickoffUtc: "2026-06-23T20:00:00Z"
  },
  {
    group: "L",
    homeTeam: "Panama",
    awayTeam: "Croatia",
    venue: "Toronto",
    kickoffUtc: "2026-06-23T23:00:00Z"
  },
  {
    group: "K",
    homeTeam: "Colombia",
    awayTeam: "Congo DR",
    venue: "Zapopan, Mexico",
    kickoffUtc: "2026-06-24T02:00:00Z"
  },
  {
    group: "B",
    homeTeam: "Switzerland",
    awayTeam: "Canada",
    venue: "Vancouver",
    kickoffUtc: "2026-06-24T19:00:00Z"
  },
  {
    group: "B",
    homeTeam: "Bosnia and Herzegovina",
    awayTeam: "Qatar",
    venue: "Seattle",
    kickoffUtc: "2026-06-24T19:00:00Z"
  },
  {
    group: "C",
    homeTeam: "Scotland",
    awayTeam: "Brazil",
    venue: "Miami Gardens, Florida",
    kickoffUtc: "2026-06-24T22:00:00Z"
  },
  {
    group: "C",
    homeTeam: "Morocco",
    awayTeam: "Haiti",
    venue: "Atlanta",
    kickoffUtc: "2026-06-24T22:00:00Z"
  },
  {
    group: "A",
    homeTeam: "Czechia",
    awayTeam: "Mexico",
    venue: "Mexico City",
    kickoffUtc: "2026-06-25T01:00:00Z"
  },
  {
    group: "A",
    homeTeam: "South Africa",
    awayTeam: "South Korea",
    venue: "Guadalupe, Mexico",
    kickoffUtc: "2026-06-25T01:00:00Z"
  },
  {
    group: "E",
    homeTeam: "Ecuador",
    awayTeam: "Germany",
    venue: "East Rutherford, New Jersey",
    kickoffUtc: "2026-06-25T20:00:00Z"
  },
  {
    group: "E",
    homeTeam: "Curacao",
    awayTeam: "Ivory Coast",
    venue: "Philadelphia",
    kickoffUtc: "2026-06-25T20:00:00Z"
  },
  {
    group: "F",
    homeTeam: "Japan",
    awayTeam: "Sweden",
    venue: "Arlington, Texas",
    kickoffUtc: "2026-06-25T23:00:00Z"
  },
  {
    group: "F",
    homeTeam: "Tunisia",
    awayTeam: "Netherlands",
    venue: "Kansas City, Missouri",
    kickoffUtc: "2026-06-25T23:00:00Z"
  },
  {
    group: "D",
    homeTeam: "Türkiye",
    awayTeam: "United States",
    venue: "Inglewood, California",
    kickoffUtc: "2026-06-26T02:00:00Z"
  },
  {
    group: "D",
    homeTeam: "Paraguay",
    awayTeam: "Australia",
    venue: "Santa Clara, California",
    kickoffUtc: "2026-06-26T02:00:00Z"
  },
  {
    group: "I",
    homeTeam: "Norway",
    awayTeam: "France",
    venue: "Foxborough, Massachusetts",
    kickoffUtc: "2026-06-26T19:00:00Z"
  },
  {
    group: "I",
    homeTeam: "Senegal",
    awayTeam: "Iraq",
    venue: "Toronto",
    kickoffUtc: "2026-06-26T19:00:00Z"
  },
  {
    group: "H",
    homeTeam: "Cape Verde",
    awayTeam: "Saudi Arabia",
    venue: "Houston",
    kickoffUtc: "2026-06-27T00:00:00Z"
  },
  {
    group: "H",
    homeTeam: "Uruguay",
    awayTeam: "Spain",
    venue: "Zapopan, Mexico",
    kickoffUtc: "2026-06-27T00:00:00Z"
  },
  {
    group: "G",
    homeTeam: "Egypt",
    awayTeam: "Iran",
    venue: "Seattle",
    kickoffUtc: "2026-06-27T03:00:00Z"
  },
  {
    group: "G",
    homeTeam: "New Zealand",
    awayTeam: "Belgium",
    venue: "Vancouver",
    kickoffUtc: "2026-06-27T03:00:00Z"
  },
  {
    group: "L",
    homeTeam: "Panama",
    awayTeam: "England",
    venue: "East Rutherford, New Jersey",
    kickoffUtc: "2026-06-27T21:00:00Z"
  },
  {
    group: "L",
    homeTeam: "Croatia",
    awayTeam: "Ghana",
    venue: "Philadelphia",
    kickoffUtc: "2026-06-27T21:00:00Z"
  },
  {
    group: "K",
    homeTeam: "Colombia",
    awayTeam: "Portugal",
    venue: "Miami Gardens, Florida",
    kickoffUtc: "2026-06-27T23:30:00Z"
  },
  {
    group: "K",
    homeTeam: "Congo DR",
    awayTeam: "Uzbekistan",
    venue: "Atlanta",
    kickoffUtc: "2026-06-27T23:30:00Z"
  },
  {
    group: "J",
    homeTeam: "Algeria",
    awayTeam: "Austria",
    venue: "Kansas City, Missouri",
    kickoffUtc: "2026-06-28T02:00:00Z"
  },
  {
    group: "J",
    homeTeam: "Jordan",
    awayTeam: "Argentina",
    venue: "Arlington, Texas",
    kickoffUtc: "2026-06-28T02:00:00Z"
  }
];

export const WORLD_CUP_KNOCKOUT_STAGE_SCHEDULE: ScheduleMatch[] = [
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 73,
    homeTeam: "South Africa",
    awayTeam: "Canada",
    venue: "Inglewood, California",
    kickoffUtc: "2026-06-28T19:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 76,
    homeTeam: "Brazil",
    awayTeam: "Japan",
    venue: "Houston",
    kickoffUtc: "2026-06-29T17:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 74,
    homeTeam: "Germany",
    awayTeam: "Paraguay",
    venue: "Foxborough, Massachusetts",
    kickoffUtc: "2026-06-29T20:30:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 75,
    homeTeam: "Netherlands",
    awayTeam: "Morocco",
    venue: "Guadalupe, Mexico",
    kickoffUtc: "2026-06-30T01:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 78,
    homeTeam: "Ivory Coast",
    awayTeam: "Norway",
    venue: "Arlington, Texas",
    kickoffUtc: "2026-06-30T17:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 77,
    homeTeam: "France",
    awayTeam: "Sweden",
    venue: "East Rutherford, New Jersey",
    kickoffUtc: "2026-06-30T21:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 79,
    homeTeam: "Mexico",
    awayTeam: "Ecuador",
    venue: "Mexico City",
    kickoffUtc: "2026-07-01T01:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 80,
    homeTeam: "England",
    awayTeam: "DR Congo",
    venue: "Atlanta",
    kickoffUtc: "2026-07-01T16:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 82,
    homeTeam: "Belgium",
    awayTeam: "Senegal",
    venue: "Seattle",
    kickoffUtc: "2026-07-01T20:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 81,
    homeTeam: "United States",
    awayTeam: "Bosnia and Herzegovina",
    venue: "Santa Clara, California",
    kickoffUtc: "2026-07-02T00:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 84,
    homeTeam: "Spain",
    awayTeam: "Austria",
    venue: "Inglewood, California",
    kickoffUtc: "2026-07-02T19:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 83,
    homeTeam: "Portugal",
    awayTeam: "Croatia",
    venue: "Toronto",
    kickoffUtc: "2026-07-02T23:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 85,
    homeTeam: "Switzerland",
    awayTeam: "Algeria",
    venue: "Vancouver",
    kickoffUtc: "2026-07-03T03:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 88,
    homeTeam: "Australia",
    awayTeam: "Egypt",
    venue: "Arlington, Texas",
    kickoffUtc: "2026-07-03T18:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 86,
    homeTeam: "Argentina",
    awayTeam: "Cape Verde",
    venue: "Miami Gardens, Florida",
    kickoffUtc: "2026-07-03T22:00:00Z"
  },
  {
    stage: "r32",
    stageLabel: "Round of 32",
    matchNumber: 87,
    homeTeam: "Colombia",
    awayTeam: "Ghana",
    venue: "Kansas City, Missouri",
    kickoffUtc: "2026-07-04T01:30:00Z"
  },

  {
    stage: "r16",
    stageLabel: "Round of 16",
    matchNumber: 89,
    homeTeam: "Winner Match 73",
    awayTeam: "Winner Match 75",
    venue: "Houston",
    kickoffUtc: "2026-07-04T17:00:00Z"
  },
  {
    stage: "r16",
    stageLabel: "Round of 16",
    matchNumber: 90,
    homeTeam: "Winner Match 74",
    awayTeam: "Winner Match 77",
    venue: "Philadelphia",
    kickoffUtc: "2026-07-04T21:00:00Z"
  },
  {
    stage: "r16",
    stageLabel: "Round of 16",
    matchNumber: 91,
    homeTeam: "Winner Match 76",
    awayTeam: "Winner Match 78",
    venue: "East Rutherford, New Jersey",
    kickoffUtc: "2026-07-05T20:00:00Z"
  },
  {
    stage: "r16",
    stageLabel: "Round of 16",
    matchNumber: 92,
    homeTeam: "Winner Match 79",
    awayTeam: "Winner Match 80",
    venue: "Mexico City",
    kickoffUtc: "2026-07-06T00:00:00Z"
  },
  {
    stage: "r16",
    stageLabel: "Round of 16",
    matchNumber: 93,
    homeTeam: "Winner Match 83",
    awayTeam: "Winner Match 84",
    venue: "Arlington, Texas",
    kickoffUtc: "2026-07-06T19:00:00Z"
  },
  {
    stage: "r16",
    stageLabel: "Round of 16",
    matchNumber: 94,
    homeTeam: "Winner Match 81",
    awayTeam: "Winner Match 82",
    venue: "Seattle",
    kickoffUtc: "2026-07-07T00:00:00Z"
  },
  {
    stage: "r16",
    stageLabel: "Round of 16",
    matchNumber: 95,
    homeTeam: "Winner Match 86",
    awayTeam: "Winner Match 88",
    venue: "Atlanta",
    kickoffUtc: "2026-07-07T16:00:00Z"
  },
  {
    stage: "r16",
    stageLabel: "Round of 16",
    matchNumber: 96,
    homeTeam: "Winner Match 85",
    awayTeam: "Winner Match 87",
    venue: "Vancouver",
    kickoffUtc: "2026-07-07T20:00:00Z"
  },

  {
    stage: "qf",
    stageLabel: "Quarter-final",
    matchNumber: 97,
    homeTeam: "Winner Match 89",
    awayTeam: "Winner Match 90",
    venue: "Foxborough, Massachusetts",
    kickoffUtc: "2026-07-09T20:00:00Z"
  },
  {
    stage: "qf",
    stageLabel: "Quarter-final",
    matchNumber: 98,
    homeTeam: "Winner Match 93",
    awayTeam: "Winner Match 94",
    venue: "Inglewood, California",
    kickoffUtc: "2026-07-10T19:00:00Z"
  },
  {
    stage: "qf",
    stageLabel: "Quarter-final",
    matchNumber: 99,
    homeTeam: "Winner Match 91",
    awayTeam: "Winner Match 92",
    venue: "Miami Gardens, Florida",
    kickoffUtc: "2026-07-11T21:00:00Z"
  },
  {
    stage: "qf",
    stageLabel: "Quarter-final",
    matchNumber: 100,
    homeTeam: "Winner Match 95",
    awayTeam: "Winner Match 96",
    venue: "Kansas City, Missouri",
    kickoffUtc: "2026-07-12T01:00:00Z"
  },

  {
    stage: "sf",
    stageLabel: "Semi-final",
    matchNumber: 101,
    homeTeam: "Winner Match 97",
    awayTeam: "Winner Match 98",
    venue: "Arlington, Texas",
    kickoffUtc: "2026-07-14T19:00:00Z"
  },
  {
    stage: "sf",
    stageLabel: "Semi-final",
    matchNumber: 102,
    homeTeam: "Winner Match 99",
    awayTeam: "Winner Match 100",
    venue: "Atlanta",
    kickoffUtc: "2026-07-15T19:00:00Z"
  },

  {
    stage: "third",
    stageLabel: "Third-place playoff",
    matchNumber: 103,
    homeTeam: "Loser Match 101",
    awayTeam: "Loser Match 102",
    venue: "Miami Gardens, Florida",
    kickoffUtc: "2026-07-18T21:00:00Z"
  },
  {
    stage: "final",
    stageLabel: "Final",
    matchNumber: 104,
    homeTeam: "Winner Match 101",
    awayTeam: "Winner Match 102",
    venue: "East Rutherford, New Jersey",
    kickoffUtc: "2026-07-19T19:00:00Z"
  }
];

export const WORLD_CUP_SCHEDULE: ScheduleMatch[] = [
  ...WORLD_CUP_GROUP_STAGE_SCHEDULE,
  ...WORLD_CUP_KNOCKOUT_STAGE_SCHEDULE
];

export function getScheduleStageLabel(match: ScheduleMatch) {
  if (match.stageLabel) {
    return match.stageLabel;
  }

  if (match.group) {
    return `Group ${match.group}`;
  }

  return "World Cup";
}

export function getScheduleByGroup(group: GroupKey) {
  return WORLD_CUP_GROUP_STAGE_SCHEDULE
    .filter(match => match.group === group)
    .sort((a, b) => {
      return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
    });
}

export function getScheduleByStage(stage: ScheduleStage) {
  return WORLD_CUP_SCHEDULE
    .filter(match => match.stage === stage)
    .sort((a, b) => {
      return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
    });
}

export function getNextMatches(limit = 10) {
  const now = Date.now();

  const upcoming = WORLD_CUP_SCHEDULE
    .filter(match => new Date(match.kickoffUtc).getTime() >= now)
    .sort((a, b) => {
      return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
    });

  if (upcoming.length > 0) {
    return upcoming.slice(0, limit);
  }

  return WORLD_CUP_SCHEDULE
    .slice()
    .sort((a, b) => {
      return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
    })
    .slice(-limit);
}