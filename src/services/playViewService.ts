import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import type { GroupKey } from "../data/worldCupGroups.js";

import {
  WORLD_CUP_GROUPS,
  getTeamDisplayName
} from "../data/worldCupGroups.js";

import type { PositionKey } from "../utils/playSessions.js";

function createPositionSelect(
  group: GroupKey,
  position: PositionKey,
  placeholder: string
) {
  const teams = WORLD_CUP_GROUPS[group];

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`wc_pick:${group}:${position}`)
      .setPlaceholder(placeholder)
      .addOptions(
        teams.map(team => ({
          label: team,
          value: team
        }))
      )
  );
}

export function buildGroupPredictionPayload(group: GroupKey) {
  const teams = WORLD_CUP_GROUPS[group];

  const embed = new EmbedBuilder()
    .setTitle(`🌍 World Cup Predictor — Group ${group}`)
    .setDescription(
      [
        `Predict the full finishing order for **Group ${group}**.`,
        "",
        teams.map(team => `• ${getTeamDisplayName(team)}`).join("\n"),
        "",
        "**Scoring later:**",
        "Exact position = 5 pts",
        "1 position off = 2 pts",
        "",
        "Choose 1st, 2nd, 3rd and 4th below, then press **Submit Group**."
      ].join("\n")
    );

  const firstRow = createPositionSelect(group, "first", "Pick 1st place");
  const secondRow = createPositionSelect(group, "second", "Pick 2nd place");
  const thirdRow = createPositionSelect(group, "third", "Pick 3rd place");
  const fourthRow = createPositionSelect(group, "fourth", "Pick 4th place");

  const submitRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`wc_submit:${group}`)
      .setLabel(`Submit Group ${group}`)
      .setStyle(ButtonStyle.Success)
  );

  return {
    embeds: [embed],
    components: [
      firstRow,
      secondRow,
      thirdRow,
      fourthRow,
      submitRow
    ]
  };
}