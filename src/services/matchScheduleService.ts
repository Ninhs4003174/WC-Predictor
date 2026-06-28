import {
  WORLD_CUP_SCHEDULE,
  getScheduleStageLabel,
  type ScheduleMatch
} from "../data/worldCupSchedule.js";

export type ScheduleMatchWithId = ScheduleMatch & {
  matchId: string;
};

const MATCHES_WITH_IDS: ScheduleMatchWithId[] =
  WORLD_CUP_SCHEDULE.map((match, index) => ({
    ...match,
    matchId: match.matchNumber
      ? String(match.matchNumber)
      : String(index + 1)
  }));

export function getAllScheduleMatchesWithIds() {
  return MATCHES_WITH_IDS;
}

export function getMatchById(matchId: string) {
  return MATCHES_WITH_IDS.find(match => {
    return match.matchId === matchId;
  });
}

export function hasMatchStarted(match: ScheduleMatchWithId) {
  return Date.now() >= new Date(match.kickoffUtc).getTime();
}

export function getMatchDisplayName(match: ScheduleMatchWithId) {
  return `${match.homeTeam} vs ${match.awayTeam}`;
}

export function getMatchStageDisplayName(match: ScheduleMatchWithId) {
  return getScheduleStageLabel(match);
}

export function getMatchNumberDisplayName(match: ScheduleMatchWithId) {
  if (match.matchNumber) {
    return `Match ${match.matchNumber}`;
  }

  return `Match ${match.matchId}`;
}