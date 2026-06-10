import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { MatchLock } from "../models/MatchLock.js";
import { getMatchById, getMatchDisplayName } from "../services/matchScheduleService.js";

export const data = new SlashCommandBuilder()
  .setName("lockmatch")
  .setDescription("Lock predictions for one match")
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
      content: "You need Manage Server permission to lock a match.",
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

  await MatchLock.findOneAndUpdate(
    {
      guildId: interaction.guildId,
      matchId
    },
    {
      $set: {
        locked: true,
        lockedBy: interaction.user.id,
        lockedAt: new Date()
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  await interaction.reply({
    content: `🔒 Locked predictions for **#${match.matchId} — ${getMatchDisplayName(match)}**.`,
    ephemeral: true
  });
}