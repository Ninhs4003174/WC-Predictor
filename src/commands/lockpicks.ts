import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { GuildSettings } from "../models/GuildSettings.js";

export const data = new SlashCommandBuilder()
  .setName("lockpicks")
  .setDescription("Lock all World Cup predictions")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "This command only works inside a server.",
      ephemeral: false
    });
    return;
  }

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({
      content: "You need Manage Server permission to lock picks.",
      ephemeral: false
    });
    return;
  }

  const settings = await GuildSettings.findOneAndUpdate(
    {
      guildId: interaction.guildId
    },
    {
      $set: {
        picksLocked: true,
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
    content: `🔒 Picks are now locked. Users can no longer start, restart, edit, or submit predictions.`,
    ephemeral: false
  });
}