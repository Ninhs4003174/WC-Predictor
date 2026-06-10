import {
  WORLD_CUP_GROUP_STAGE_SCHEDULE,
  type ScheduleMatch
} from "../data/worldCupSchedule.js";

export type ScheduleMatchWithId = ScheduleMatch & {
  matchId: string;
};

const MATCHES_WITH_IDS: ScheduleMatchWithId[] =
  WORLD_CUP_GROUP_STAGE_SCHEDULE.map((match, index) => ({
    ...match,
    matchId: String(index + 1)
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