import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";

import {
  countKnockoutPicks,
  ROUND_LABELS,
  ROUND_POINTS,
  teamWithFlag,
  TOTAL_KNOCKOUT_PICKS,
  type KnockoutMatch,
  type KnockoutRoundsLike,
  type RoundId
} from "../data/knockoutBracket.js";

type BuildKnockoutPredictionPayloadOptions = {
  roundId: RoundId;
  matchIndex: number;
  match: KnockoutMatch;
  matches: KnockoutMatch[];
  rounds: KnockoutRoundsLike;
  note?: string;
};

export function buildKnockoutPredictionPayload({
  roundId,
  matchIndex,
  match,
  matches,
  rounds,
  note
}: BuildKnockoutPredictionPayloadOptions) {
  const picksMade = countKnockoutPicks(rounds);

  const embed = new EmbedBuilder()
    .setTitle(`🏆 World Cup Predictor — ${ROUND_LABELS[roundId]}`)
    .setDescription(
      [
        note ? `${note}\n` : null,
        `Pick the winner for **${ROUND_LABELS[roundId]} Match ${matchIndex + 1}/${matches.length}**.`,
        "",
        `Correct winner this round: **${ROUND_POINTS[roundId]} points**`,
        "",
        `## ${teamWithFlag(match.homeTeam)} vs ${teamWithFlag(match.awayTeam)}`,
        "",
        `Progress: **${picksMade}/${TOTAL_KNOCKOUT_PICKS}** picks made.`,
        "",
        "Choose the team you think will advance."
      ]
        .filter(Boolean)
        .join("\n")
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`ko_pick:${roundId}:${matchIndex}:home`)
      .setLabel(match.homeTeam)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`ko_pick:${roundId}:${matchIndex}:away`)
      .setLabel(match.awayTeam)
      .setStyle(ButtonStyle.Primary)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}