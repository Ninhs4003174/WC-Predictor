import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder
} from "discord.js";

import * as ping from "./ping.js";
import * as play from "./play.js";
import * as predictions from "./predictions.js";
import * as lockpicks from "./lockpicks.js";
import * as unlockpicks from "./unlockpicks.js";
import * as schedule from "./schedule.js";
import * as help from "./help.js";

export type BotCommand = {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commands: BotCommand[] = [
  ping,
  play,
  predictions,
  schedule,
  lockpicks,
  unlockpicks,
  help
];

export const commandMap = new Map(
  commands.map(command => [command.data.name, command])
);