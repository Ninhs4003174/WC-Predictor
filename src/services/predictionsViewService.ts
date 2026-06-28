import { EmbedBuilder } from "discord.js";

import {
  getChampion,
  getRoundMatches,
  getRoundWinnersObject,
  getWinnersFromRounds,
  isKnockoutComplete,
  ROUND_LABELS,
  ROUND_ORDER,
  ROUND_POINTS,
  teamWithFlag,
  TOTAL_KNOCKOUT_PICKS,
  type KnockoutRoundsLike
} from "../data/knockoutBracket.js";

export type KnockoutPredictionSummary = {
  rounds: KnockoutRoundsLike;
  completed?: boolean;
  champion?: string | null;
};

type BuildKnockoutPredictionsEmbedOptions = {
  username: string;
  prediction: KnockoutPredictionSummary | null | undefined;
  title?: string;
};

function buildRoundSummary(rounds: KnockoutRoundsLike, roundId: typeof ROUND_ORDER[number]) {
  const matches = getRoundMatches(roundId, rounds);
  const winners = getWinnersFromRounds(rounds, roundId);

  if (matches.length === 0) {
    return "Not available yet.";
  }

  return matches
    .map((match, index) => {
      const winner = winners[index];

      if (!winner) {
        return `**${index + 1}.** ${teamWithFlag(match.homeTeam)} vs ${teamWithFlag(match.awayTeam)} → Not picked yet`;
      }

      return `**${index + 1}.** ${teamWithFlag(match.homeTeam)} vs ${teamWithFlag(match.awayTeam)} → **${teamWithFlag(winner)}**`;
    })
    .join("\n");
}

function countSavedPicks(rounds: KnockoutRoundsLike) {
  return ROUND_ORDER.reduce((total, roundId) => {
    return total + getWinnersFromRounds(rounds, roundId).length;
  }, 0);
}

export function buildKnockoutPredictionsSummaryEmbed({
  username,
  prediction,
  title
}: BuildKnockoutPredictionsEmbedOptions) {
  const rounds = getRoundWinnersObject(prediction?.rounds);
  const champion = getChampion(rounds);
  const completed = isKnockoutComplete(rounds);
  const picksMade = countSavedPicks(rounds);

  const sections = [
    `Progress: **${Math.min(picksMade, TOTAL_KNOCKOUT_PICKS)}/${TOTAL_KNOCKOUT_PICKS}** picks`,
    completed && champion
      ? `Champion: **${teamWithFlag(champion)}**`
      : "Champion: Not decided yet",
    "",
    "## Scoring",
    ROUND_ORDER
      .map(roundId => {
        return `**${ROUND_LABELS[roundId]}:** ${ROUND_POINTS[roundId]} points per correct winner`;
      })
      .join("\n")
  ];

  for (const roundId of ROUND_ORDER) {
    sections.push(
      "",
      `## ${ROUND_LABELS[roundId]}`,
      buildRoundSummary(rounds, roundId)
    );
  }

  return new EmbedBuilder()
    .setTitle(title ?? `🏆 ${username}'s Knockout Predictions`)
    .setDescription(sections.join("\n"));
}