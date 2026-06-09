import {
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from "discord.js";

import {
  GROUP_ORDER,
  type GroupKey
} from "../data/worldCupGroups.js";

import { buildSchedulePayload } from "../services/scheduleViewService.js";

export const data = new SlashCommandBuilder()
  .setName("schedule")
  .setDescription("View the World Cup group-stage schedule")
  .addStringOption(option =>
    option
      .setName("group")
      .setDescription("Choose a group to view")
      .setRequired(false)
      .addChoices(
        ...GROUP_ORDER.map(group => ({
          name: `Group ${group}`,
          value: group
        }))
      )
  )
  .addStringOption(option =>
    option
      .setName("country")
      .setDescription("Filter by country/team name, e.g. Brazil, Australia, USA")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const selectedGroup = interaction.options.getString("group") as
    | GroupKey
    | null;

  const country = interaction.options.getString("country") ?? undefined;

  await interaction.reply({
    ...buildSchedulePayload(0, {
      group: selectedGroup ?? "all",
      country
    }),
    ephemeral: true
  });
}