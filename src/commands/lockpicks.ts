import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { GuildSettings } from "../models/GuildSettings.js";

export const data = new SlashCommandBuilder()
  .setName("lockpicks")
  .setDescription("Lock group stage predictions")
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
      content: "You need Manage Server permission to lock group picks.",
      ephemeral: false
    });
    return;
  }

  await GuildSettings.findOneAndUpdate(
    {
      guildId: interaction.guildId
    },
    {
      $set: {
        /**
         * Keep legacy global lock off so match predictions do not get blocked
         * by the old picksLocked field.
         */
        picksLocked: false,

        groupPicksLocked: true,
        groupPicksLockedBy: interaction.user.id,
        groupPicksLockedAt: new Date(),

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
    content: "🔒 Group predictions are now locked. Users can no longer start, restart, edit, or submit group predictions.",
    ephemeral: false
  });
}