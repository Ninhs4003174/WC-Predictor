import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Interaction
} from "discord.js";

import {
  getChampion,
  getCurrentPredictionStep,
  getRoundMatches,
  getRoundWinnersObject,
  getWinnersFromRounds,
  hasKnockoutStarted,
  isKnockoutComplete,
  ROUND_LABELS,
  type RoundId
} from "../data/knockoutBracket.js";

import { KnockoutPrediction } from "../models/KnockoutPrediction.js";
import { buildKnockoutPredictionPayload } from "../services/playViewService.js";
import { buildKnockoutPredictionsSummaryEmbed } from "../services/predictionsViewService.js";

function buildRestartConfirmPayload() {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ko_confirm_restart")
      .setLabel("Yes, restart")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("ko_cancel_restart")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    content: [
      "⚠️ **Restart knockout predictions?**",
      "",
      "This will delete your saved knockout bracket and start again from the Round of 32.",
      "",
      "This cannot be undone."
    ].join("\n"),
    embeds: [],
    components: [row]
  };
}

async function getOrCreatePrediction(guildId: string, userId: string) {
  return KnockoutPrediction.findOneAndUpdate(
    {
      guildId,
      userId
    },
    {
      $setOnInsert: {
        guildId,
        userId,
        rounds: {},
        completed: false,
        champion: null
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

async function continuePredictions(interaction: Interaction) {
  if (!interaction.guildId || !interaction.isButton()) {
    return true;
  }

  const prediction = await getOrCreatePrediction(
    interaction.guildId,
    interaction.user.id
  );

  const step = getCurrentPredictionStep(prediction.rounds);

  if (!step) {
    const embed = buildKnockoutPredictionsSummaryEmbed({
      username: interaction.user.username,
      prediction,
      title: "✅ Knockout predictions submitted"
    });

    await interaction.update({
      content: "",
      embeds: [embed],
      components: []
    });

    return true;
  }

  await interaction.update({
    ...buildKnockoutPredictionPayload({
      roundId: step.roundId,
      matchIndex: step.matchIndex,
      match: step.match,
      matches: step.matches,
      rounds: prediction.rounds
    }),
    content: ""
  });

  return true;
}

async function handleWinnerPick(interaction: Interaction) {
  if (!interaction.guildId || !interaction.isButton()) {
    return true;
  }

  if (hasKnockoutStarted()) {
    await interaction.reply({
      content: "🔒 Knockout predictions are locked because the knockout stage has started.",
      ephemeral: true
    });
    return true;
  }

  const [
    ,
    roundIdRaw,
    matchIndexRaw,
    winnerSide
  ] = interaction.customId.split(":");

  const roundId = roundIdRaw as RoundId;
  const matchIndex = Number(matchIndexRaw);

  const prediction = await getOrCreatePrediction(
    interaction.guildId,
    interaction.user.id
  );

  const currentStep = getCurrentPredictionStep(prediction.rounds);

  if (
    !currentStep ||
    currentStep.roundId !== roundId ||
    currentStep.matchIndex !== matchIndex
  ) {
    await interaction.reply({
      content: "This knockout prediction button is outdated. Use `/play` to continue from your current spot.",
      ephemeral: true
    });
    return true;
  }

  const matches = getRoundMatches(roundId, prediction.rounds);
  const match = matches[matchIndex];

  if (!match) {
    await interaction.reply({
      content: "Could not find that knockout match. Use `/play` again.",
      ephemeral: true
    });
    return true;
  }

  const winner =
    winnerSide === "home"
      ? match.homeTeam
      : match.awayTeam;

  const rounds = getRoundWinnersObject(prediction.rounds);
  const currentRoundWinners = getWinnersFromRounds(rounds, roundId);

  currentRoundWinners[matchIndex] = winner;
  rounds[roundId] = currentRoundWinners;

  const completed = isKnockoutComplete(rounds);
  const champion = getChampion(rounds);

  await KnockoutPrediction.findOneAndUpdate(
    {
      guildId: interaction.guildId,
      userId: interaction.user.id
    },
    {
      $set: {
        rounds,
        completed,
        champion
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  const savedPrediction = await KnockoutPrediction.findOne({
    guildId: interaction.guildId,
    userId: interaction.user.id
  });

  const nextStep = getCurrentPredictionStep(savedPrediction?.rounds);

  if (!nextStep) {
    const embed = buildKnockoutPredictionsSummaryEmbed({
      username: interaction.user.username,
      prediction: savedPrediction,
      title: "✅ Knockout bracket submitted"
    });

    await interaction.update({
      content: "",
      embeds: [embed],
      components: []
    });

    return true;
  }

  const justFinishedRound =
    matchIndex === matches.length - 1 &&
    nextStep.roundId !== roundId;

  const roundFinishedMessage = justFinishedRound
    ? `✅ ${ROUND_LABELS[roundId]} complete. Moving to **${ROUND_LABELS[nextStep.roundId]}**.`
    : "";

  await interaction.update({
    ...buildKnockoutPredictionPayload({
      roundId: nextStep.roundId,
      matchIndex: nextStep.matchIndex,
      match: nextStep.match,
      matches: nextStep.matches,
      rounds: savedPrediction?.rounds,
      note: roundFinishedMessage
    }),
    content: ""
  });

  return true;
}

export async function handlePlayInteraction(
  interaction: Interaction
): Promise<boolean> {
  if (!interaction.guildId) return false;

  const isOldGroupInteraction =
    (
      interaction.isButton() ||
      interaction.isStringSelectMenu()
    ) &&
    interaction.customId.startsWith("wc_");

  if (isOldGroupInteraction) {
    await interaction.reply({
      content: "Group prediction buttons are no longer active. Use `/play` to predict the knockout stage.",
      ephemeral: true
    });
    return true;
  }

  if (!interaction.isButton()) {
    return false;
  }

  if (!interaction.customId.startsWith("ko_")) {
    return false;
  }

  const locked = hasKnockoutStarted();

  const isCancelRestartButton = interaction.customId === "ko_cancel_restart";

  if (locked && !isCancelRestartButton) {
    await interaction.reply({
      content: "🔒 Knockout predictions are locked because the knockout stage has started.",
      ephemeral: true
    });
    return true;
  }

  if (interaction.customId === "ko_continue_predictions") {
    return continuePredictions(interaction);
  }

  if (interaction.customId === "ko_restart_predictions") {
    await interaction.update(buildRestartConfirmPayload());
    return true;
  }

  if (interaction.customId === "ko_cancel_restart") {
    await interaction.update({
      content: "Restart cancelled.",
      embeds: [],
      components: []
    });
    return true;
  }

  if (interaction.customId === "ko_confirm_restart") {
    await KnockoutPrediction.findOneAndUpdate(
      {
        guildId: interaction.guildId,
        userId: interaction.user.id
      },
      {
        $set: {
          rounds: {},
          completed: false,
          champion: null
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    const prediction = await KnockoutPrediction.findOne({
      guildId: interaction.guildId,
      userId: interaction.user.id
    });

    const step = getCurrentPredictionStep(prediction?.rounds);

    if (!step) {
      await interaction.update({
        content: "Something went wrong starting your knockout bracket. Try `/play` again.",
        embeds: [],
        components: []
      });
      return true;
    }

    await interaction.update({
      ...buildKnockoutPredictionPayload({
        roundId: step.roundId,
        matchIndex: step.matchIndex,
        match: step.match,
        matches: step.matches,
        rounds: prediction?.rounds
      }),
      content: ""
    });

    return true;
  }

  if (interaction.customId.startsWith("ko_pick:")) {
    return handleWinnerPick(interaction);
  }

  return false;
}