import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type Interaction
} from "discord.js";

import { MatchPrediction } from "../models/MatchPrediction.js";
import { buildMatchPredictionsPayload } from "../commands/matchpredictions.js";

import {
  buildSchedulePayload,
  parseScheduleButtonData
} from "../services/scheduleViewService.js";

import {
  getMatchById,
  getMatchDisplayName
} from "../services/matchScheduleService.js";

import { getMatchPredictionLockStatus } from "../services/matchLockService.js";

function createGoalInput(
  customId: string,
  teamName: string,
  existingValue?: number
) {
  const input = new TextInputBuilder()
    .setCustomId(customId)
    .setLabel(`${teamName} goals`.slice(0, 45))
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Example: 2")
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(2);

  if (existingValue !== undefined) {
    input.setValue(String(existingValue));
  }

  return input;
}

function parseGoalInput(value: string) {
  const trimmed = value.trim();

  if (!/^\d{1,2}$/.test(trimmed)) {
    return null;
  }

  const numberValue = Number(trimmed);

  if (!Number.isInteger(numberValue)) {
    return null;
  }

  if (numberValue < 0 || numberValue > 99) {
    return null;
  }

  return numberValue;
}

export async function handleScheduleInteraction(
  interaction: Interaction
): Promise<boolean> {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("schedule_page:")) {
      const [, rawGroup, rawCountry, rawPage] = interaction.customId.split(":");

      const scope = parseScheduleButtonData(rawGroup, rawCountry);
      const page = Number.parseInt(rawPage, 10);

      await interaction.update(
        buildSchedulePayload(Number.isNaN(page) ? 0 : page, scope)
      );

      return true;
    }

    if (interaction.customId.startsWith("match_predictions_page:")) {
      if (!interaction.guildId) {
        await interaction.reply({
          content: "This only works inside a server.",
          ephemeral: true
        });
        return true;
      }

      const [, rawPage] = interaction.customId.split(":");
      const page = Number.parseInt(rawPage, 10);

      const payload = await buildMatchPredictionsPayload({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        username: interaction.user.username,
        page: Number.isNaN(page) ? 0 : page
      });

      await interaction.update(payload);

      return true;
    }

    return false;
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId !== "match_predict_select") {
      return false;
    }

    if (!interaction.guildId) {
      await interaction.reply({
        content: "This only works inside a server.",
        ephemeral: true
      });
      return true;
    }

    const matchId = interaction.values[0];
    const match = getMatchById(matchId);

    if (!match) {
      await interaction.reply({
        content: "I could not find that match.",
        ephemeral: true
      });
      return true;
    }

    const lockStatus = await getMatchPredictionLockStatus(
      interaction.guildId,
      match
    );

    if (lockStatus.locked) {
      await interaction.reply({
        content: lockStatus.reason ?? "This match is locked.",
        ephemeral: true
      });
      return true;
    }

    const existingPrediction = await MatchPrediction.findOne({
      guildId: interaction.guildId,
      userId: interaction.user.id,
      matchId: match.matchId
    });

    const modal = new ModalBuilder()
      .setCustomId(`match_score_modal:${match.matchId}`)
      .setTitle(getMatchDisplayName(match).slice(0, 45));

    const homeInput = createGoalInput(
      "homeGoals",
      match.homeTeam,
      existingPrediction?.homeGoals
    );

    const awayInput = createGoalInput(
      "awayGoals",
      match.awayTeam,
      existingPrediction?.awayGoals
    );

    const homeRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      homeInput
    );

    const awayRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      awayInput
    );

    modal.addComponents(homeRow, awayRow);

    await interaction.showModal(modal);

    return true;
  }

  if (interaction.isModalSubmit()) {
    if (!interaction.customId.startsWith("match_score_modal:")) {
      return false;
    }

    if (!interaction.guildId) {
      await interaction.reply({
        content: "This only works inside a server.",
        ephemeral: true
      });
      return true;
    }

    const [, matchId] = interaction.customId.split(":");
    const match = getMatchById(matchId);

    if (!match) {
      await interaction.reply({
        content: "I could not find that match.",
        ephemeral: true
      });
      return true;
    }

    const lockStatus = await getMatchPredictionLockStatus(
      interaction.guildId,
      match
    );

    if (lockStatus.locked) {
      await interaction.reply({
        content: lockStatus.reason ?? "This match is locked.",
        ephemeral: true
      });
      return true;
    }

    const homeGoals = parseGoalInput(
      interaction.fields.getTextInputValue("homeGoals")
    );

    const awayGoals = parseGoalInput(
      interaction.fields.getTextInputValue("awayGoals")
    );

    if (homeGoals === null || awayGoals === null) {
      await interaction.reply({
        content: "Please enter valid whole-number scores between 0 and 99.",
        ephemeral: true
      });
      return true;
    }

    await MatchPrediction.findOneAndUpdate(
      {
        guildId: interaction.guildId,
        userId: interaction.user.id,
        matchId: match.matchId
      },
      {
        $set: {
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeGoals,
          awayGoals
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    await interaction.reply({
      content: `✅ Saved prediction: **${match.homeTeam} ${homeGoals} - ${awayGoals} ${match.awayTeam}**`,
      ephemeral: true
    });

    return true;
  }

  return false;
}