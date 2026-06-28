import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

import {
  countKnockoutPicks,
  getCurrentPredictionStep,
  hasKnockoutStarted,
  TOTAL_KNOCKOUT_PICKS
} from "../data/knockoutBracket.js";

import { KnockoutPrediction } from "../models/KnockoutPrediction.js";
import { buildKnockoutPredictionPayload } from "../services/playViewService.js";
import { buildKnockoutPredictionsSummaryEmbed } from "../services/predictionsViewService.js";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Start your World Cup knockout stage predictions");

function buildExistingPredictionPayload({
  completed,
  locked,
  picksMade
}: {
  completed: boolean;
  locked: boolean;
  picksMade: number;
}) {
  const embed = new EmbedBuilder()
    .setTitle("🏆 World Cup Knockout Predictor")
    .setDescription(
      completed
        ? [
            "You have already completed your knockout bracket.",
            "",
            "Use `/predictions` to view your saved bracket."
          ].join("\n")
        : [
            "You already have knockout predictions in progress.",
            "",
            `Progress: **${picksMade}/${TOTAL_KNOCKOUT_PICKS}** picks made.`,
            "",
            locked
              ? "Predictions are now locked because the knockout stage has started."
              : "You can continue where you left off, or restart your bracket."
          ].join("\n")
    );

  const row = new ActionRowBuilder<ButtonBuilder>();

  if (!completed && !locked) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId("ko_continue_predictions")
        .setLabel("Continue Predictions")
        .setStyle(ButtonStyle.Primary)
    );
  }

  if (!locked) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId("ko_restart_predictions")
        .setLabel("Restart Bracket")
        .setStyle(ButtonStyle.Danger)
    );
  }

  return {
    embeds: [embed],
    components: row.components.length > 0 ? [row] : [],
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

  const locked = hasKnockoutStarted();

  const existing = await KnockoutPrediction.findOne({
    guildId: interaction.guildId,
    userId: interaction.user.id
  });

  const picksMade = countKnockoutPicks(existing?.rounds);

  if (existing && picksMade > 0) {
    await interaction.reply(
      buildExistingPredictionPayload({
        completed: existing.completed,
        locked,
        picksMade
      })
    );
    return;
  }

  if (locked) {
    await interaction.reply({
      content: "🔒 Knockout predictions are locked because the knockout stage has started.",
      ephemeral: true
    });
    return;
  }

  const step = getCurrentPredictionStep(existing?.rounds);

  if (!step) {
    const embed = buildKnockoutPredictionsSummaryEmbed({
      username: interaction.user.username,
      prediction: existing,
      title: "✅ Knockout predictions submitted"
    });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
    return;
  }

  await interaction.reply({
    ...buildKnockoutPredictionPayload({
      roundId: step.roundId,
      matchIndex: step.matchIndex,
      match: step.match,
      matches: step.matches,
      rounds: existing?.rounds
    }),
    ephemeral: true
  });
}