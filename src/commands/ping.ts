import {
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Check if the bot is online");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply({
    content: "🏓 Pong! World Cup Predictor is online.",
    ephemeral: true
  });
}