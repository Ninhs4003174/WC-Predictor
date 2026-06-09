import type { GroupKey } from "./worldCupGroups.js";

export type ScheduleMatch = {
  group: GroupKey;
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

export function getScheduleByGroup(group: GroupKey) {
  return WORLD_CUP_GROUP_STAGE_SCHEDULE
    .filter(match => match.group === group)
    .sort((a, b) => {
      return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
    });
}

export function getNextMatches(limit = 10) {
  const now = Date.now();

  const upcoming = WORLD_CUP_GROUP_STAGE_SCHEDULE
    .filter(match => new Date(match.kickoffUtc).getTime() >= now)
    .sort((a, b) => {
      return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
    });

  if (upcoming.length > 0) {
    return upcoming.slice(0, limit);
  }

  return WORLD_CUP_GROUP_STAGE_SCHEDULE
    .slice()
    .sort((a, b) => {
      return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
    })
    .slice(-limit);
}