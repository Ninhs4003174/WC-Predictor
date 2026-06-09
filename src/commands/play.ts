import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

import {
  GROUP_ORDER,
  type GroupKey
} from "../data/worldCupGroups.js";

import { GuildSettings } from "../models/GuildSettings.js";
import { WorldCupPrediction } from "../models/WorldCupPrediction.js";
import { buildGroupPredictionPayload } from "../services/playViewService.js";
import { setSession } from "../utils/playSessions.js";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Start your World Cup group predictions");

function hasAnyPredictions(predictions: Map<string, string[]> | undefined) {
  if (!predictions) return false;

  return GROUP_ORDER.some(group => {
    return Boolean(predictions.get(group));
  });
}

function buildExistingPredictionPayload(completed: boolean) {
  const embed = new EmbedBuilder()
    .setTitle("🌍 World Cup Predictor")
    .setDescription(
      completed
        ? [
            "You have already completed your group predictions.",
            "",
            "You can use `/predictions` to view or edit individual groups.",
            "",
            "Or you can restart everything from Group A."
          ].join("\n")
        : [
            "You already have predictions in progress.",
            "",
            "You can continue where you left off, or restart everything from Group A."
          ].join("\n")
    );

  const row = new ActionRowBuilder<ButtonBuilder>();

  if (!completed) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId("wc_continue_predictions")
        .setLabel("Continue Predictions")
        .setStyle(ButtonStyle.Primary)
    );
  }

  row.addComponents(
    new ButtonBuilder()
      .setCustomId("wc_restart_predictions")
      .setLabel("Restart Predictions")
      .setStyle(ButtonStyle.Danger)
  );

  return {
    embeds: [embed],
    components: [row],
    ephemeral: true
  };
}

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "This command only works inside a server.",
      ephemeral: true
    });
    return;
  }

  const settings = await GuildSettings.findOne({
    guildId: interaction.guildId
  });

  if (settings?.picksLocked) {
    await interaction.reply({
      content: "🔒 Picks are currently locked. You cannot start, continue, restart, edit, or submit predictions.",
      ephemeral: true
    });
    return;
  }

  const existing = await WorldCupPrediction.findOne({
    guildId: interaction.guildId,
    userId: interaction.user.id
  });

  const predictions = existing?.predictions;
  const userHasPredictions = hasAnyPredictions(predictions);

  if (existing && userHasPredictions) {
    await interaction.reply(buildExistingPredictionPayload(existing.completed));
    return;
  }

  const nextGroup = GROUP_ORDER.find(group => {
    return !predictions?.get(group);
  }) as GroupKey | undefined;

  const groupToStart = nextGroup ?? "A";

  setSession(interaction.guildId, interaction.user.id, {
    group: groupToStart,
    mode: "play",
    picks: {}
  });

  await interaction.reply({
    ...buildGroupPredictionPayload(groupToStart),
    ephemeral: true
  });
}