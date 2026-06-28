import {
  Client,
  EmbedBuilder
} from "discord.js";

import {
  fetchEspnScoreboard,
  type ParsedEspnCard,
  type ParsedEspnGoal,
  type ParsedEspnMatch
} from "./espnSoccerService.js";

import {
  WORLD_CUP_SCHEDULE,
  getScheduleStageLabel,
  type ScheduleMatch
} from "../data/worldCupSchedule.js";

import { EspnLiveState } from "../models/EspnLiveState.js";

const CHECK_INTERVAL_MS = 1 * 60 * 1000;

const ONE_HOUR_MS = 60 * 60 * 1000;
const NEXT_MATCH_BUFFER_MS = 5 * 60 * 1000;

let watcherStarted = false;

type SendableDiscordChannel = {
  send: (options: { embeds: EmbedBuilder[] }) => Promise<unknown>;
};

function canSendToChannel(channel: unknown): channel is SendableDiscordChannel {
  return (
    typeof channel === "object" &&
    channel !== null &&
    "send" in channel &&
    typeof (channel as { send?: unknown }).send === "function"
  );
}

function normaliseText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normaliseStatus(status: string) {
  return normaliseText(status);
}

function isLive(match: ParsedEspnMatch) {
  return match.statusState === "in" && !match.completed;
}

function isHalfTime(status: string) {
  const normalised = normaliseStatus(status);

  return (
    normalised === "ht" ||
    normalised === "halftime" ||
    normalised.includes("half")
  );
}

function isOneHourBeforeKickoff(kickoffUtc: string) {
  const kickoffTime = new Date(kickoffUtc).getTime();
  const now = Date.now();

  const minutesUntilKickoff = (kickoffTime - now) / 1000 / 60;

  return minutesUntilKickoff <= 65 && minutesUntilKickoff >= 55;
}

function formatEspnDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function addUtcDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);

  return copy;
}

function getScoreboardDatesToCheck() {
  const dates = new Set<string>();
  const now = new Date();
  const nowMs = Date.now();

  dates.add(formatEspnDate(addUtcDays(now, -1)));
  dates.add(formatEspnDate(now));
  dates.add(formatEspnDate(addUtcDays(now, 1)));

  for (const scheduledMatch of WORLD_CUP_SCHEDULE) {
    const kickoffMs = new Date(scheduledMatch.kickoffUtc).getTime();

    const isNearby =
      kickoffMs >= nowMs - 6 * ONE_HOUR_MS &&
      kickoffMs <= nowMs + 36 * ONE_HOUR_MS;

    if (isNearby) {
      dates.add(formatEspnDate(new Date(scheduledMatch.kickoffUtc)));
    }
  }

  return Array.from(dates);
}

async function fetchMatchesForWatcher() {
  const dates = getScoreboardDatesToCheck();

  const results = await Promise.allSettled(
    dates.map(async date => {
      const matches = await fetchEspnScoreboard({
        league: "fifa.world",
        date
      });

      return {
        date,
        matches
      };
    })
  );

  const matchMap = new Map<string, ParsedEspnMatch>();

  for (const result of results) {
    if (result.status === "rejected") {
      console.warn("⚠️ ESPN date check failed:", result.reason);
      continue;
    }

    for (const match of result.value.matches) {
      matchMap.set(match.espnId, match);
    }
  }

  return {
    dates,
    matches: Array.from(matchMap.values())
  };
}

function getTeamFlag(teamName: string) {
  const normalised = normaliseText(teamName);

  const ENGLAND_FLAG = "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}";
  const SCOTLAND_FLAG = "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}";

  const flags: Record<string, string> = {
    mexico: "🇲🇽",
    southafrica: "🇿🇦",
    southkorea: "🇰🇷",
    korea: "🇰🇷",
    czechia: "🇨🇿",
    czechrepublic: "🇨🇿",
    canada: "🇨🇦",
    bosniaandherzegovina: "🇧🇦",
    bosniaherzegovina: "🇧🇦",
    bosniaherz: "🇧🇦",
    qatar: "🇶🇦",
    switzerland: "🇨🇭",
    unitedstates: "🇺🇸",
    usa: "🇺🇸",
    us: "🇺🇸",
    paraguay: "🇵🇾",
    brazil: "🇧🇷",
    morocco: "🇲🇦",
    haiti: "🇭🇹",
    scotland: SCOTLAND_FLAG,
    australia: "🇦🇺",
    turkiye: "🇹🇷",
    turkey: "🇹🇷",
    germany: "🇩🇪",
    curacao: "🇨🇼",
    ivorycoast: "🇨🇮",
    cotedivoire: "🇨🇮",
    ecuador: "🇪🇨",
    netherlands: "🇳🇱",
    japan: "🇯🇵",
    sweden: "🇸🇪",
    tunisia: "🇹🇳",
    spain: "🇪🇸",
    capeverde: "🇨🇻",
    belgium: "🇧🇪",
    egypt: "🇪🇬",
    saudiarabia: "🇸🇦",
    uruguay: "🇺🇾",
    iran: "🇮🇷",
    newzealand: "🇳🇿",
    france: "🇫🇷",
    senegal: "🇸🇳",
    iraq: "🇮🇶",
    norway: "🇳🇴",
    argentina: "🇦🇷",
    algeria: "🇩🇿",
    austria: "🇦🇹",
    jordan: "🇯🇴",
    portugal: "🇵🇹",
    congodr: "🇨🇩",
    drcongo: "🇨🇩",
    democraticrepublicofcongo: "🇨🇩",
    england: ENGLAND_FLAG,
    croatia: "🇭🇷",
    ghana: "🇬🇭",
    panama: "🇵🇦",
    uzbekistan: "🇺🇿",
    colombia: "🇨🇴"
  };

  return flags[normalised] ?? "";
}

function teamWithFlag(teamName: string) {
  const flag = getTeamFlag(teamName);

  return flag
    ? `${flag} ${teamName}`
    : teamName;
}

function scoreLine(match: ParsedEspnMatch) {
  return `${teamWithFlag(match.homeTeam)} ${match.homeScore} - ${match.awayScore} ${teamWithFlag(match.awayTeam)}`;
}

function versusLine(homeTeam: string, awayTeam: string) {
  return `${teamWithFlag(homeTeam)} vs ${teamWithFlag(awayTeam)}`;
}

function goalKey(goal: ParsedEspnGoal) {
  return [
    normaliseText(goal.minute),
    normaliseText(goal.scorer),
    normaliseText(goal.teamName),
    goal.ownGoal ? "og" : "goal",
    goal.penalty ? "pen" : ""
  ].join("|");
}

function normaliseStoredGoalKey(key: string) {
  const [
    minute,
    scorer,
    teamName,
    partFour,
    partFive,
    partSix
  ] = key.split("|");

  const normalisedPartFour = normaliseText(partFour ?? "");
  const normalisedPartFive = normaliseText(partFive ?? "");
  const normalisedPartSix = normaliseText(partSix ?? "");

  const isOwnGoal =
    normalisedPartFour === "og" ||
    normalisedPartFive === "og" ||
    normalisedPartSix === "og";

  const isPenalty =
    normalisedPartFour === "pen" ||
    normalisedPartFive === "pen" ||
    normalisedPartSix === "pen";

  return [
    normaliseText(minute ?? ""),
    normaliseText(scorer ?? ""),
    normaliseText(teamName ?? ""),
    isOwnGoal ? "og" : "goal",
    isPenalty ? "pen" : ""
  ].join("|");
}

function redCardKey(card: ParsedEspnCard) {
  return [
    normaliseText(card.minute),
    normaliseText(card.player),
    normaliseText(card.teamName),
    normaliseText(card.type)
  ].join("|");
}

function normaliseStoredRedCardKey(key: string) {
  const [
    minute,
    player,
    teamName,
    type
  ] = key.split("|");

  return [
    normaliseText(minute ?? ""),
    normaliseText(player ?? ""),
    normaliseText(teamName ?? ""),
    normaliseText(type ?? "")
  ].join("|");
}

function isSameTeam(left: string, right: string) {
  const normalisedLeft = normaliseText(left);
  const normalisedRight = normaliseText(right);

  return (
    normalisedLeft === normalisedRight ||
    normalisedLeft.includes(normalisedRight) ||
    normalisedRight.includes(normalisedLeft)
  );
}

function isSameScheduledMatch(
  match: ParsedEspnMatch,
  scheduledMatch: ScheduleMatch
) {
  const sameOrder =
    isSameTeam(match.homeTeam, scheduledMatch.homeTeam) &&
    isSameTeam(match.awayTeam, scheduledMatch.awayTeam);

  const reversedOrder =
    isSameTeam(match.homeTeam, scheduledMatch.awayTeam) &&
    isSameTeam(match.awayTeam, scheduledMatch.homeTeam);

  return sameOrder || reversedOrder;
}

function getScoreAfterGoal(
  match: ParsedEspnMatch,
  targetGoal: ParsedEspnGoal
) {
  let homeScore = 0;
  let awayScore = 0;

  const targetKey = goalKey(targetGoal);

  for (const goal of match.goals) {
    if (isSameTeam(goal.teamName, match.homeTeam)) {
      homeScore += 1;
    } else if (isSameTeam(goal.teamName, match.awayTeam)) {
      awayScore += 1;
    }

    if (goalKey(goal) === targetKey) {
      break;
    }
  }

  const couldCalculateScore = homeScore + awayScore > 0;

  if (!couldCalculateScore) {
    return scoreLine(match);
  }

  return `${teamWithFlag(match.homeTeam)} ${homeScore} - ${awayScore} ${teamWithFlag(match.awayTeam)}`;
}

function getGoalTagText(goal: ParsedEspnGoal) {
  const tags = [];

  if (goal.penalty) tags.push("PEN");
  if (goal.ownGoal) tags.push("OG");

  return tags.length > 0
    ? ` (${tags.join(", ")})`
    : "";
}

function formatGoal(goal: ParsedEspnGoal) {
  return [
    `**${goal.minute}** — ${goal.scorer}${getGoalTagText(goal)}`,
    `Team: **${teamWithFlag(goal.teamName)}**`
  ].join("\n");
}

function formatFullTimeGoal(goal: ParsedEspnGoal) {
  return [
    `⚽ **${goal.minute}** — ${goal.scorer}${getGoalTagText(goal)}`,
    `Team: **${teamWithFlag(goal.teamName)}**`
  ].join("\n");
}

function formatRedCard(card: ParsedEspnCard) {
  return [
    `🟥 **${card.minute}** — ${card.player}`,
    `Team: **${teamWithFlag(card.teamName)}**`
  ].join("\n");
}

function formatFullTimeGoals(match: ParsedEspnMatch) {
  if (match.goals.length === 0) {
    return "No goals.";
  }

  return match.goals
    .map(formatFullTimeGoal)
    .join("\n\n");
}

function formatFullTimeRedCards(match: ParsedEspnMatch) {
  return match.redCards
    .map(formatRedCard)
    .join("\n\n");
}

function getNextScheduledMatch(match: ParsedEspnMatch): ScheduleMatch | undefined {
  const now = Date.now();
  const referenceTime = now - NEXT_MATCH_BUFFER_MS;

  return WORLD_CUP_SCHEDULE
    .filter(scheduledMatch => {
      const scheduledKickoffTime = new Date(scheduledMatch.kickoffUtc).getTime();

      if (Number.isNaN(scheduledKickoffTime)) {
        return false;
      }

      const isFutureOrVeryRecent = scheduledKickoffTime > referenceTime;
      const isCurrentMatch = isSameScheduledMatch(match, scheduledMatch);

      return isFutureOrVeryRecent && !isCurrentMatch;
    })
    .sort((a, b) => {
      return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
    })[0];
}

function getNextEspnMatch(
  currentMatch: ParsedEspnMatch,
  allMatches: ParsedEspnMatch[]
) {
  const now = Date.now();
  const referenceTime = now - NEXT_MATCH_BUFFER_MS;

  return allMatches
    .filter(match => {
      if (match.espnId === currentMatch.espnId) {
        return false;
      }

      const kickoffTime = new Date(match.kickoffUtc).getTime();

      if (Number.isNaN(kickoffTime)) {
        return false;
      }

      if (kickoffTime <= referenceTime) {
        return false;
      }

      return match.statusState === "pre" || !match.completed;
    })
    .sort((a, b) => {
      return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
    })[0];
}

function buildEspnNextMatchText(nextMatch: ParsedEspnMatch) {
  const kickoffUnix = Math.floor(new Date(nextMatch.kickoffUtc).getTime() / 1000);

  return [
    `**${versusLine(nextMatch.homeTeam, nextMatch.awayTeam)}**`,
    `Kickoff: <t:${kickoffUnix}:F>`
  ].join("\n");
}

function buildLocalNextMatchText(nextMatch: ScheduleMatch) {
  const kickoffUnix = Math.floor(new Date(nextMatch.kickoffUtc).getTime() / 1000);

  return [
    `**${versusLine(nextMatch.homeTeam, nextMatch.awayTeam)}**`,
    `${getScheduleStageLabel(nextMatch)} • ${nextMatch.venue}`,
    `Kickoff: <t:${kickoffUnix}:F>`
  ].join("\n");
}

function buildNextMatchText(
  match: ParsedEspnMatch,
  allMatches: ParsedEspnMatch[]
) {
  const espnNextMatch = getNextEspnMatch(match, allMatches);

  if (espnNextMatch) {
    return buildEspnNextMatchText(espnNextMatch);
  }

  const nextMatch = getNextScheduledMatch(match);

  if (!nextMatch) {
    return "No upcoming World Cup match found.";
  }

  return buildLocalNextMatchText(nextMatch);
}

async function sendToResultsChannel(
  client: Client,
  embed: EmbedBuilder
) {
  const channelId = process.env.RESULTS_CHANNEL_ID;

  if (!channelId) {
    console.warn("⚠️ RESULTS_CHANNEL_ID is missing. ESPN live watcher cannot post updates.");
    return;
  }

  const channel = await client.channels.fetch(channelId);

  if (!canSendToChannel(channel)) {
    console.warn("⚠️ RESULTS_CHANNEL_ID does not point to a sendable Discord channel.");
    return;
  }

  await channel.send({
    embeds: [embed]
  });
}

function buildOneHourAlertEmbed(match: ParsedEspnMatch) {
  const kickoffUnix = Math.floor(new Date(match.kickoffUtc).getTime() / 1000);

  return new EmbedBuilder()
    .setTitle("⏰ Match starts in 1 hour")
    .setDescription(
      [
        `**${versusLine(match.homeTeam, match.awayTeam)}**`,
        "",
        `Kickoff: <t:${kickoffUnix}:F>`
      ].join("\n")
    );
}

function buildMatchStartEmbed(match: ParsedEspnMatch) {
  return new EmbedBuilder()
    .setTitle("🟢 Match Started")
    .setDescription(
      [
        `**${versusLine(match.homeTeam, match.awayTeam)}**`,
        "",
        `Current score: **${scoreLine(match)}**`
      ].join("\n")
    );
}

function buildGoalEmbed(match: ParsedEspnMatch, goal: ParsedEspnGoal) {
  const calculatedScoreLine = getScoreAfterGoal(match, goal);

  return new EmbedBuilder()
    .setTitle("⚽ GOAL!")
    .setDescription(
      [
        `**${calculatedScoreLine}**`,
        "",
        formatGoal(goal)
      ].join("\n")
    );
}

function buildRedCardEmbed(match: ParsedEspnMatch, card: ParsedEspnCard) {
  return new EmbedBuilder()
    .setTitle("🟥 Red Card")
    .setDescription(
      [
        `**${scoreLine(match)}**`,
        "",
        formatRedCard(card)
      ].join("\n")
    );
}

function buildScoreCorrectionEmbed(
  match: ParsedEspnMatch,
  oldHomeScore: number,
  oldAwayScore: number
) {
  return new EmbedBuilder()
    .setTitle("🚫 Score corrected")
    .setDescription(
      [
        "Possible VAR/disallowed goal update.",
        "",
        `Previous score: **${teamWithFlag(match.homeTeam)} ${oldHomeScore} - ${oldAwayScore} ${teamWithFlag(match.awayTeam)}**`,
        `Current score: **${scoreLine(match)}**`
      ].join("\n")
    );
}

function buildHalfTimeEmbed(match: ParsedEspnMatch) {
  return new EmbedBuilder()
    .setTitle("⏸️ Half-time")
    .setDescription(`**${scoreLine(match)}**`);
}

function buildFullTimeEmbed(
  match: ParsedEspnMatch,
  allMatches: ParsedEspnMatch[]
) {
  const sections = [
    `**${scoreLine(match)}**`,
    "",
    "## ⚽ Goals",
    formatFullTimeGoals(match)
  ];

  if (match.redCards.length > 0) {
    sections.push(
      "",
      "## 🟥 Red Cards",
      formatFullTimeRedCards(match)
    );
  }

  sections.push(
    "",
    "## ⏭️ Next Match",
    buildNextMatchText(match, allMatches)
  );

  return new EmbedBuilder()
    .setTitle("🏁 Full-time")
    .setDescription(sections.join("\n"));
}

async function createInitialState(match: ParsedEspnMatch) {
  await EspnLiveState.findOneAndUpdate(
    {
      espnId: match.espnId
    },
    {
      $setOnInsert: {
        espnId: match.espnId,
        matchName: match.name,
        kickoffUtc: match.kickoffUtc,
        lastStatus: match.status,
        lastHomeScore: match.homeScore,
        lastAwayScore: match.awayScore,

        postedGoalKeys: match.completed
          ? match.goals.map(goalKey)
          : [],

        postedRedCardKeys: match.completed
          ? match.redCards.map(redCardKey)
          : [],

        disallowedGoalKeys: [],
        postedVarKeys: [],
        oneHourAlertPosted: false,
        matchStartPosted: false,
        halfTimePosted: false,
        fullTimePosted: match.completed
      }
    },
    {
      upsert: true
    }
  );
}

async function processMatch(
  client: Client,
  match: ParsedEspnMatch,
  allMatches: ParsedEspnMatch[]
) {
  let state = await EspnLiveState.findOne({
    espnId: match.espnId
  });

  if (!state) {
    await createInitialState(match);

    state = await EspnLiveState.findOne({
      espnId: match.espnId
    });

    if (!state) {
      return;
    }
  }

  const shouldPostOneHourAlert =
    match.statusState === "pre" &&
    !state.oneHourAlertPosted &&
    isOneHourBeforeKickoff(match.kickoffUtc);

  if (shouldPostOneHourAlert) {
    await sendToResultsChannel(client, buildOneHourAlertEmbed(match));
    state.oneHourAlertPosted = true;
  }

  const shouldPostMatchStart =
    isLive(match) &&
    !isHalfTime(match.status) &&
    !state.matchStartPosted;

  if (shouldPostMatchStart) {
    await sendToResultsChannel(client, buildMatchStartEmbed(match));
    state.matchStartPosted = true;
  }

  const postedGoalKeys = new Set(
    (state.postedGoalKeys ?? []).map(normaliseStoredGoalKey)
  );

  const postedRedCardKeys = new Set(
    (state.postedRedCardKeys ?? []).map(normaliseStoredRedCardKey)
  );

  const postedVarKeys = new Set(state.postedVarKeys ?? []);

  const scoreWentBackwards =
    match.homeScore < state.lastHomeScore ||
    match.awayScore < state.lastAwayScore;

  if (scoreWentBackwards) {
    const correctionKey = [
      state.lastHomeScore,
      state.lastAwayScore,
      match.homeScore,
      match.awayScore
    ].join("-");

    if (!postedVarKeys.has(correctionKey)) {
      await sendToResultsChannel(
        client,
        buildScoreCorrectionEmbed(
          match,
          state.lastHomeScore,
          state.lastAwayScore
        )
      );

      postedVarKeys.add(correctionKey);
    }
  }

  for (const goal of match.goals) {
    const key = goalKey(goal);

    if (!postedGoalKeys.has(key)) {
      await sendToResultsChannel(client, buildGoalEmbed(match, goal));
      postedGoalKeys.add(key);
    }
  }

  for (const redCard of match.redCards) {
    const key = redCardKey(redCard);

    if (!postedRedCardKeys.has(key)) {
      await sendToResultsChannel(client, buildRedCardEmbed(match, redCard));
      postedRedCardKeys.add(key);
    }
  }

  const shouldPostHalfTime =
    isHalfTime(match.status) &&
    !state.halfTimePosted;

  if (shouldPostHalfTime) {
    await sendToResultsChannel(client, buildHalfTimeEmbed(match));
    state.halfTimePosted = true;
  }

  const shouldPostFullTime =
    match.completed &&
    !state.fullTimePosted;

  if (shouldPostFullTime) {
    await sendToResultsChannel(client, buildFullTimeEmbed(match, allMatches));
    state.fullTimePosted = true;
  }

  state.lastStatus = match.status;
  state.lastHomeScore = match.homeScore;
  state.lastAwayScore = match.awayScore;
  state.postedGoalKeys = Array.from(postedGoalKeys);
  state.postedRedCardKeys = Array.from(postedRedCardKeys);
  state.postedVarKeys = Array.from(postedVarKeys);

  await state.save();
}

async function checkEspnMatches(client: Client) {
  try {
    const {
      dates,
      matches
    } = await fetchMatchesForWatcher();

    for (const match of matches) {
      await processMatch(client, match, matches);
    }

    const matchNames = matches
      .map(match => `${match.homeTeam} vs ${match.awayTeam} (${match.status})`)
      .join(", ");

    console.log(
      `📡 ESPN live watcher checked ${matches.length} match(es) from dates ${dates.join(", ")}${matchNames ? `: ${matchNames}` : "."}`
    );
  } catch (error) {
    console.error("❌ ESPN live watcher failed:", error);
  }
}

export function startEspnLiveWatcher(client: Client) {
  if (watcherStarted) {
    return;
  }

  const channelId = process.env.RESULTS_CHANNEL_ID;

  if (!channelId) {
    console.warn("⚠️ ESPN live watcher disabled because RESULTS_CHANNEL_ID is missing.");
    return;
  }

  watcherStarted = true;

  console.log("📡 ESPN live watcher started.");

  void checkEspnMatches(client);

  setInterval(() => {
    void checkEspnMatches(client);
  }, CHECK_INTERVAL_MS);
}