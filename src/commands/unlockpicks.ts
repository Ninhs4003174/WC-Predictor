import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { GuildSettings } from "../models/GuildSettings.js";

export const data = new SlashCommandBuilder()
  .setName("unlockpicks")
  .setDescription("Unlock World Cup predictions")
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
      content: "You need Manage Server permission to unlock picks.",
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
        picksLocked: false,
        lockedBy: null,
        lockedAt: null
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  await interaction.reply({
    content: "🔓 Picks are now unlocked. Users can start, restart, edit, and submit predictions again.",
    ephemeral: false
  });
}