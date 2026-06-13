import { GuildSettings } from "../models/GuildSettings.js";
import { MatchLock } from "../models/MatchLock.js";

import {
  getMatchDisplayName,
  hasMatchStarted,
  type ScheduleMatchWithId
} from "./matchScheduleService.js";

export async function getMatchPredictionLockStatus(
  guildId: string,
  match: ScheduleMatchWithId
) {
  const settings = await GuildSettings.findOne({
    guildId
  });

  if (settings?.matchPicksLocked) {
    return {
      locked: true,
      reason: "🔒 Match predictions are currently locked."
    };
  }

  const manualLock = await MatchLock.findOne({
    guildId,
    matchId: match.matchId,
    locked: true
  });

  if (manualLock) {
    return {
      locked: true,
      reason: `🔒 Predictions are manually locked for **${getMatchDisplayName(match)}**.`
    };
  }

  if (hasMatchStarted(match)) {
    return {
      locked: true,
      reason: `🔒 **${getMatchDisplayName(match)}** has already started, so predictions are closed.`
    };
  }

  return {
    locked: false,
    reason: null
  };
}