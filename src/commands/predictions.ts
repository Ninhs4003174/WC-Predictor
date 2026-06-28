import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import {
  countKnockoutPicks,
  hasKnockoutStarted
} from "../data/knockoutBracket.js";

import { KnockoutPrediction } from "../models/KnockoutPrediction.js";
import { buildKnockoutPredictionsSummaryEmbed } from "../services/predictionsViewService.js";

export const data = new SlashCommandBuilder()
  .setName("predictions")
  .setDescription("View saved World Cup knockout predictions")
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

  const picksLocked = hasKnockoutStarted();

  const targetUser =
    interaction.options.getUser("user") ?? interaction.user;

  const isViewingOwnPredictions = targetUser.id === interaction.user.id;

  const isAdmin =
    interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ??
    false;

  if (!isViewingOwnPredictions && !isAdmin && !picksLocked) {
    await interaction.reply({
      content: "🔒 You cannot view other people's knockout predictions until picks are locked.",
      ephemeral: true
    });
    return;
  }

  const prediction = await KnockoutPrediction.findOne({
    guildId: interaction.guildId,
    userId: targetUser.id
  });

  if (!prediction || countKnockoutPicks(prediction.rounds) === 0) {
    await interaction.reply({
      content: `${targetUser.username} has not made any knockout predictions yet.`,
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

  const embed = buildKnockoutPredictionsSummaryEmbed({
    username: targetUser.username,
    prediction
  }).setFooter({
    text: `${statusText} | ${lockText}${privacyText}`
  });

  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  const canRestart = isViewingOwnPredictions && !picksLocked;

  if (canRestart) {
    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("ko_restart_predictions")
          .setLabel("Restart Bracket")
          .setStyle(ButtonStyle.Danger)
      )
    );
  }

  await interaction.reply({
    embeds: [embed],
    components,
    ephemeral: true
  });
}