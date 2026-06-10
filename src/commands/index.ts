import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder
} from "discord.js";

import * as ping from "./ping.js";
import * as play from "./play.js";
import * as predictions from "./predictions.js";
import * as schedule from "./schedule.js";
import * as matchpredictions from "./matchpredictions.js";
import * as lockpicks from "./lockpicks.js";
import * as unlockpicks from "./unlockpicks.js";
import * as lockmatch from "./lockmatch.js";
import * as unlockmatch from "./unlockmatch.js";
import * as status from "./status.js";
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
  matchpredictions,
  lockpicks,
  unlockpicks,
  lockmatch,
  unlockmatch,
  status,
  help
];

export const commandMap = new Map(
  commands.map(command => [command.data.name, command])
);