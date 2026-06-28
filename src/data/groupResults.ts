import type { GroupKey } from "./worldCupGroups.js";

export const EXACT_POSITION_POINTS = 5;
export const ONE_POSITION_AWAY_POINTS = 2;

export const ACTUAL_GROUP_STANDINGS: Record<GroupKey, string[]> = {
  A: [
    "Mexico",
    "South Africa",
    "South Korea",
    "Czechia"
  ],

  B: [
    "Switzerland",
    "Canada",
    "Bosnia and Herzegovina",
    "Qatar"
  ],

  C: [
    "Brazil",
    "Morocco",
    "Scotland",
    "Haiti"
  ],

  D: [
    "United States",
    "Australia",
    "Paraguay",
    "Türkiye"
  ],

  E: [
    "Germany",
    "Ivory Coast",
    "Ecuador",
    "Curacao"
  ],

  F: [
    "Netherlands",
    "Japan",
    "Sweden",
    "Tunisia"
  ],

  G: [
    "Belgium",
    "Egypt",
    "Iran",
    "New Zealand"
  ],

  H: [
    "Spain",
    "Cape Verde",
    "Uruguay",
    "Saudi Arabia"
  ],

  I: [
    "France",
    "Norway",
    "Senegal",
    "Iraq"
  ],

  J: [
    "Argentina",
    "Austria",
    "Algeria",
    "Jordan"
  ],

  K: [
    "Colombia",
    "Portugal",
    "Congo DR",
    "Uzbekistan"
  ],

  L: [
    "England",
    "Croatia",
    "Ghana",
    "Panama"
  ]
};

export const MAX_GROUP_STAGE_SCORE =
  Object.keys(ACTUAL_GROUP_STANDINGS).length * 4 * EXACT_POSITION_POINTS;