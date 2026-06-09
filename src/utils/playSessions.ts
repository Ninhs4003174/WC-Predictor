import type { GroupKey } from "../data/worldCupGroups.js";

export type PositionKey = "first" | "second" | "third" | "fourth";

export type PlayMode = "play" | "edit";

export type GroupDraft = {
  group: GroupKey;
  mode: PlayMode;
  picks: Partial<Record<PositionKey, string>>;
};

const sessions = new Map<string, GroupDraft>();

export function getSessionKey(guildId: string, userId: string) {
  return `${guildId}:${userId}`;
}

export function getSession(guildId: string, userId: string) {
  return sessions.get(getSessionKey(guildId, userId));
}

export function setSession(guildId: string, userId: string, draft: GroupDraft) {
  sessions.set(getSessionKey(guildId, userId), draft);
}

export function clearSession(guildId: string, userId: string) {
  sessions.delete(getSessionKey(guildId, userId));
}