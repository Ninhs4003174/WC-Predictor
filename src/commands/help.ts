import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Show the World Cup Predictor command guide");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("🌍 World Cup Predictor Help")
    .setDescription(
      [
        "Use this bot to predict World Cup group standings and match scores.",
        "",
        "Group predictions and match score predictions are saved separately."
      ].join("\n")
    )
    .addFields(
      {
        name: "🏆 /play",
        value: "Start your full group-stage table predictions. You will predict 1st, 2nd, 3rd and 4th for every group.",
        inline: false
      },
      {
        name: "📋 /predictions",
        value: "View your saved group predictions. While picks are unlocked, you can edit your own predictions. After picks are locked, everyone can compare predictions.",
        inline: false
      },
      {
        name: "📅 /schedule",
        value: "View the World Cup group-stage schedule. You can filter by group or country, change pages, and use the dropdown to predict a match score.",
        inline: false
      },
      {
        name: "⚽ /matchpredictions",
        value: "View all of your saved match score predictions. Use `/schedule` if you want to add or update a match prediction.",
        inline: false
      },
      {
        name: "ℹ️ /help",
        value: "Shows this help menu.",
        inline: false
      }
    )
    .setFooter({
      text: "Scoring: Group exact position = 5 pts, 1 position off = 2 pts • Match exact score = 10 pts, correct result = 3 pts"
    });

  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });
}