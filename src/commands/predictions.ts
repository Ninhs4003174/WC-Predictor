import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { GuildSettings } from "../models/GuildSettings.js";
import { WorldCupPrediction } from "../models/WorldCupPrediction.js";

import { buildPredictionsSummaryEmbed } from "../services/predictionsViewService.js";

export const data = new SlashCommandBuilder()
  .setName("predictions")
  .setDescription("View saved World Cup group predictions")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("The user whose predictions you want to view")
      .setRequired(false)
  );

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

  const picksLocked = Boolean(settings?.picksLocked);

  const targetUser =
    interaction.options.getUser("user") ?? interaction.user;

  const isViewingOwnPredictions = targetUser.id === interaction.user.id;

  const isAdmin =
    interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ??
    false;

  if (!isViewingOwnPredictions && !isAdmin && !picksLocked) {
    await interaction.reply({
      content: "🔒 You cannot view other people's predictions until picks are locked.",
      ephemeral: true
    });
    return;
  }

  const prediction = await WorldCupPrediction.findOne({
    guildId: interaction.guildId,
    userId: targetUser.id
  });

  if (!prediction) {
    await interaction.reply({
      content: `${targetUser.username} has not made any predictions yet.`,
      ephemeral: true
    });
    return;
  }

  const statusText = prediction.completed
    ? "✅ Completed"
    : "⏳ In progress";

  const lockText = picksLocked
    ? "🔒 Picks locked"
    : "🔓 Picks unlocked";

  const privacyText =
    !isViewingOwnPredictions && isAdmin && !picksLocked
      ? " | Admin view"
      : "";

  const embed = buildPredictionsSummaryEmbed({
    username: targetUser.username,
    prediction
  }).setFooter({
    text: `${statusText} | ${lockText}${privacyText}`
  });

  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  const canEdit = isViewingOwnPredictions && !picksLocked;

  if (canEdit) {
    const editRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("wc_edit_predictions")
        .setLabel("Edit Predictions")
        .setStyle(ButtonStyle.Primary)
    );

    components.push(editRow);
  }

  await interaction.reply({
    embeds: [embed],
    components,
    ephemeral: true
  });
}