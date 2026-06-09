import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Show all World Cup Predictor commands");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("🌍 World Cup Predictor Help")
    .setDescription("Here are the current bot commands:")
    .addFields(
      {
        name: "/play",
        value: "Start your group predictions, continue where you left off, or restart your predictions.",
        inline: false
      },
      {
        name: "/predictions",
        value: "View your saved predictions. Edit predictions once saved.",
        inline: false
      },
      {
        name: "/schedule",
        value: "View the World Cup group-stage schedule. You can also choose a specific group.",
        inline: false
      },
      {
        name: "/help",
        value: "Shows this help menu.",
        inline: false
      }
    );

  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });
}