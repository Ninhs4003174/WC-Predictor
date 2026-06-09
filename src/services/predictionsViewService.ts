import { EmbedBuilder } from "discord.js";

import {
  GROUP_ORDER,
  getTeamDisplayName
} from "../data/worldCupGroups.js";

export type PredictionSummary = {
  predictions: Map<string, string[]>;
};

type BuildPredictionsEmbedOptions = {
  username: string;
  prediction: PredictionSummary | null | undefined;
  title?: string;
};

function buildGroupFieldValue(groupPicks: string[] | undefined) {
  if (!groupPicks) {
    return "Not predicted yet.";
  }

  return [
    `**1.** ${getTeamDisplayName(groupPicks[0])}`,
    `**2.** ${getTeamDisplayName(groupPicks[1])}`,
    `**3.** ${getTeamDisplayName(groupPicks[2])}`,
    `**4.** ${getTeamDisplayName(groupPicks[3])}`
  ].join("\n");
}

export function buildPredictionsSummaryEmbed({
  username,
  prediction,
  title
}: BuildPredictionsEmbedOptions) {
  const embed = new EmbedBuilder()
    .setTitle(title ?? `📋 ${username}'s World Cup Predictions`);

  const fields = [];

  for (let i = 0; i < GROUP_ORDER.length; i += 2) {
    const firstGroup = GROUP_ORDER[i];
    const secondGroup = GROUP_ORDER[i + 1];

    const firstGroupPicks = prediction?.predictions.get(firstGroup);

    fields.push({
      name: `Group ${firstGroup}`,
      value: buildGroupFieldValue(firstGroupPicks),
      inline: true
    });

    if (secondGroup) {
      const secondGroupPicks = prediction?.predictions.get(secondGroup);

      fields.push({
        name: `Group ${secondGroup}`,
        value: buildGroupFieldValue(secondGroupPicks),
        inline: true
      });
    }

    fields.push({
      name: "\u200B",
      value: "\u200B",
      inline: true
    });
  }

  embed.addFields(fields);

  return embed;
}