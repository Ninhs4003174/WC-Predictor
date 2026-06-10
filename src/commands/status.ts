import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

import { MatchPrediction } from "../models/MatchPrediction.js";
import { getAllScheduleMatchesWithIds } from "../services/matchScheduleService.js";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("View World Cup Predictor event status")
  .addBooleanOption(option =>
    option
      .setName("public")
      .setDescription("Show the status to everyone? Defaults to private.")
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

  const showPublic = interaction.options.getBoolean("public") ?? false;

  await interaction.deferReply({
    ephemeral: !showPublic
  });

  const guildId = interaction.guildId;

  const [
    entrantIds,
    totalPredictions,
    matchIdsWithPredictions
  ] = await Promise.all([
    MatchPrediction.distinct("userId", { guildId }),
    MatchPrediction.countDocuments({ guildId }),
    MatchPrediction.distinct("matchId", { guildId })
  ]);

  const totalEntrants = entrantIds.length;
  const totalMatches = getAllScheduleMatchesWithIds().length;
  const matchesWithPredictions = matchIdsWithPredictions.length;

  const averagePredictions =
    totalEntrants === 0
      ? "0.0"
      : (totalPredictions / totalEntrants).toFixed(1);

  const embed = new EmbedBuilder()
    .setTitle("🏆 World Cup Predictor Status")
    .setDescription(
      [
        "Here is the current event activity so far.",
        "",
        "A user counts as **entered** once they submit at least one prediction."
      ].join("\n")
    )
    .addFields(
      {
        name: "👥 Entrants",
        value: `**${totalEntrants}** users`,
        inline: true
      },
      {
        name: "📝 Total Predictions",
        value: `**${totalPredictions}** submitted`,
        inline: true
      },
      {
        name: "⚽ Matches Picked",
        value: `**${matchesWithPredictions}/${totalMatches}** matches`,
        inline: true
      },
      {
        name: "📊 Average Activity",
        value: `**${averagePredictions}** predictions per entrant`,
        inline: true
      }
    )
    .setFooter({
      text: "Predictions lock when each match starts"
    })
    .setTimestamp();

  await interaction.editReply({
    embeds: [embed]
  });
}