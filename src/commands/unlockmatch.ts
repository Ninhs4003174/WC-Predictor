import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { MatchLock } from "../models/MatchLock.js";
import { getMatchById, getMatchDisplayName } from "../services/matchScheduleService.js";

export const data = new SlashCommandBuilder()
  .setName("unlockmatch")
  .setDescription("Unlock predictions for one manually locked match")
  .addIntegerOption(option =>
    option
      .setName("match_id")
      .setDescription("The match ID from /schedule")
      .setRequired(true)
      .setMinValue(1)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "This command only works inside a server.",
      ephemeral: true
    });
    return;
  }

  const isAdmin =
    interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ??
    false;

  if (!isAdmin) {
    await interaction.reply({
      content: "You need Manage Server permission to unlock a match.",
      ephemeral: true
    });
    return;
  }

  const matchId = String(interaction.options.getInteger("match_id", true));
  const match = getMatchById(matchId);

  if (!match) {
    await interaction.reply({
      content: `I could not find match ID ${matchId}. Use /schedule to check match IDs.`,
      ephemeral: true
    });
    return;
  }

  await MatchLock.findOneAndDelete({
    guildId: interaction.guildId,
    matchId
  });

  await interaction.reply({
    content: `🔓 Unlocked manual lock for **#${match.matchId} — ${getMatchDisplayName(match)}**. It will still auto-lock when the match starts.`,
    ephemeral: true
  });
}