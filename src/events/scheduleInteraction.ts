import type { Interaction } from "discord.js";

import {
  buildSchedulePayload,
  parseScheduleButtonData
} from "../services/scheduleViewService.js";

export async function handleScheduleInteraction(
  interaction: Interaction
): Promise<boolean> {
  if (!interaction.isButton()) {
    return false;
  }

  if (!interaction.customId.startsWith("schedule_page:")) {
    return false;
  }

  const [, rawGroup, rawCountry, rawPage] = interaction.customId.split(":");

  const scope = parseScheduleButtonData(rawGroup, rawCountry);
  const page = Number.parseInt(rawPage, 10);

  await interaction.update(
    buildSchedulePayload(Number.isNaN(page) ? 0 : page, scope)
  );

  return true;
}