import type { RoundId } from "../data/knockoutBracket.js";

export type PlayMode = "play" | "edit";

export type KnockoutDraft = {
  type: "knockout";
  mode: PlayMode;
  roundId: RoundId;
  matchIndex: number;
};

const sessions = new Map<string, KnockoutDraft>();

export function getSessionKey(guildId: string, userId: string) {
  return `${guildId}:${userId}`;
}

export function getSession(guildId: string, userId: string) {
  return sessions.get(getSessionKey(guildId, userId));
}

export function setSession(
  guildId: string,
  userId: string,
  draft: KnockoutDraft
) {
  sessions.set(getSessionKey(guildId, userId), draft);
}

export function clearSession(guildId: string, userId: string) {
  sessions.delete(getSessionKey(guildId, userId));
}