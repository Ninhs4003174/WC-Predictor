import {
  Client,
  EmbedBuilder
} from "discord.js";

import {
  fetchEspnScoreboard,
  type ParsedEspnGoal,
  type ParsedEspnMatch
} from "./espnSoccerService.js";

import { EspnLiveState } from "../models/EspnLiveState.js";

const CHECK_INTERVAL_MS = 1 * 60 * 1000;

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

function isLive(match: ParsedEspnMatch) {
  return match.statusState === "in" && !match.completed;
}

function isHalfTime(status: string) {
  return /half/i.test(status);
}

function isOneHourBeforeKickoff(kickoffUtc: string) {
  const kickoffTime = new Date(kickoffUtc).getTime();
  const now = Date.now();

  const minutesUntilKickoff = (kickoffTime - now) / 1000 / 60;

  return minutesUntilKickoff <= 65 && minutesUntilKickoff >= 55;
}

function goalKey(goal: ParsedEspnGoal) {
  return [
    goal.minute,
    goal.scorer,
    goal.teamName,
    goal.type,
    goal.ownGoal ? "OG" : "",
    goal.penalty ? "PEN" : ""
  ].join("|");
}

function parseGoalKey(key: string) {
  const [
    minute,
    scorer,
    teamName,
    type,
    ownGoal,
    penalty
  ] = key.split("|");

  return {
    minute: minute || "?",
    scorer: scorer || "Unknown scorer",
    teamName: teamName || "Unknown team",
    type: type || "Goal",
    ownGoal: ownGoal === "OG",
    penalty: penalty === "PEN"
  };
}

function normaliseTeamName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSameTeam(left: string, right: string) {
  const normalisedLeft = normaliseTeamName(left);
  const normalisedRight = normaliseTeamName(right);

  return (
    normalisedLeft === normalisedRight ||
    normalisedLeft.includes(normalisedRight) ||
    normalisedRight.includes(normalisedLeft)
  );
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
    return `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`;
  }

  return `${match.homeTeam} ${homeScore} - ${awayScore} ${match.awayTeam}`;
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
        `**${match.homeTeam} vs ${match.awayTeam}**`,
        "",
        `Kickoff: <t:${kickoffUnix}:F>`,
        `Relative: <t:${kickoffUnix}:R>`,
        "",
        "Get your predictions in before the match starts."
      ].join("\n")
    );
}

function buildMatchStartEmbed(match: ParsedEspnMatch) {
  return new EmbedBuilder()
    .setTitle("🟢 Match Started")
    .setDescription(
      [
        `**${match.homeTeam} vs ${match.awayTeam}**`,
        "",
        `Current score: **${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}**`
      ].join("\n")
    );
}

function buildGoalEmbed(match: ParsedEspnMatch, goal: ParsedEspnGoal) {
  const tags = [];

  if (goal.penalty) tags.push("PEN");
  if (goal.ownGoal) tags.push("OG");

  const tagText = tags.length > 0
    ? ` (${tags.join(", ")})`
    : "";

  const scoreLine = getScoreAfterGoal(match, goal);

  return new EmbedBuilder()
    .setTitle("⚽ GOAL!")
    .setDescription(
      [
        `**${scoreLine}**`,
        "",
        `**${goal.minute}** — ${goal.scorer}${tagText}`,
        `Team: **${goal.teamName}**`
      ].join("\n")
    );
}

function buildGoalDisallowedEmbed(
  match: ParsedEspnMatch,
  removedGoalKey: string
) {
  const removedGoal = parseGoalKey(removedGoalKey);

  const tags = [];

  if (removedGoal.penalty) tags.push("PEN");
  if (removedGoal.ownGoal) tags.push("OG");

  const tagText = tags.length > 0
    ? ` (${tags.join(", ")})`
    : "";

  return new EmbedBuilder()
    .setTitle("🚫 Goal disallowed")
    .setDescription(
      [
        `**${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}**`,
        "",
        "A previously posted goal appears to have been removed after review.",
        "",
        `Removed goal: **${removedGoal.minute}** — ${removedGoal.scorer}${tagText}`,
        `Team: **${removedGoal.teamName}**`
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
        `Previous score: **${match.homeTeam} ${oldHomeScore} - ${oldAwayScore} ${match.awayTeam}**`,
        `Current score: **${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}**`
      ].join("\n")
    );
}

function buildHalfTimeEmbed(match: ParsedEspnMatch) {
  return new EmbedBuilder()
    .setTitle("⏸️ Half-time")
    .setDescription(
      `**${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}**`
    );
}

function buildFullTimeEmbed(match: ParsedEspnMatch) {
  return new EmbedBuilder()
    .setTitle("🏁 Full-time")
    .setDescription(
      [
        `**${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}**`,
        "",
        "Match complete."
      ].join("\n")
    );
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
        postedGoalKeys: match.statusState === "pre"
          ? []
          : match.goals.map(goalKey),
        disallowedGoalKeys: [],
        postedVarKeys: [],
        oneHourAlertPosted: false,
        matchStartPosted: false,
        halfTimePosted: isHalfTime(match.status),
        fullTimePosted: match.completed
      }
    },
    {
      upsert: true
    }
  );
}

async function processMatch(client: Client, match: ParsedEspnMatch) {
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

  const postedGoalKeys = new Set(state.postedGoalKeys ?? []);
  const currentGoalKeys = new Set(match.goals.map(goalKey));
  const disallowedGoalKeys = new Set(state.disallowedGoalKeys ?? []);
  const postedVarKeys = new Set(state.postedVarKeys ?? []);

  for (const oldGoalKey of postedGoalKeys) {
    const goalNoLongerExists = !currentGoalKeys.has(oldGoalKey);

    if (goalNoLongerExists && !disallowedGoalKeys.has(oldGoalKey)) {
      await sendToResultsChannel(
        client,
        buildGoalDisallowedEmbed(match, oldGoalKey)
      );

      disallowedGoalKeys.add(oldGoalKey);
    }
  }

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
    await sendToResultsChannel(client, buildFullTimeEmbed(match));
    state.fullTimePosted = true;
  }

  state.lastStatus = match.status;
  state.lastHomeScore = match.homeScore;
  state.lastAwayScore = match.awayScore;
  state.postedGoalKeys = Array.from(postedGoalKeys);
  state.disallowedGoalKeys = Array.from(disallowedGoalKeys);
  state.postedVarKeys = Array.from(postedVarKeys);

  await state.save();
}

async function checkEspnMatches(client: Client) {
  try {
    const matches = await fetchEspnScoreboard({
      league: "fifa.world"
    });

    for (const match of matches) {
      await processMatch(client, match);
    }

    console.log(`📡 ESPN live watcher checked ${matches.length} match(es).`);
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