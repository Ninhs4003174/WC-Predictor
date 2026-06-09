import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  type Interaction
} from "discord.js";

import {
  GROUP_ORDER,
  type GroupKey
} from "../data/worldCupGroups.js";

import { GuildSettings } from "../models/GuildSettings.js";
import { WorldCupPrediction } from "../models/WorldCupPrediction.js";
import { buildGroupPredictionPayload } from "../services/playViewService.js";
import { buildPredictionsSummaryEmbed } from "../services/predictionsViewService.js";

import {
  clearSession,
  getSession,
  setSession,
  type PositionKey
} from "../utils/playSessions.js";

type PredictionSummary = {
  predictions: Map<string, string[]>;
};

function buildEditGroupSelectPayload() {
  const embed = buildPredictionsSummaryEmbed({
    username: "Your",
    prediction: null,
    title: "✏️ Edit Predictions"
  }).setDescription("Choose which group you want to edit.");

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("wc_edit_group")
      .setPlaceholder("Choose a group to edit")
      .addOptions(
        GROUP_ORDER.map(group => ({
          label: `Group ${group}`,
          value: group
        }))
      )
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

function buildRestartConfirmPayload() {
  const embed = buildPredictionsSummaryEmbed({
    username: "Your",
    prediction: null,
    title: "⚠️ Restart predictions?"
  }).setDescription(
    [
      "This will delete all your saved group predictions and start again from **Group A**.",
      "",
      "This cannot be undone."
    ].join("\n")
  );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("wc_confirm_restart")
      .setLabel("Yes, restart")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("wc_cancel_restart")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

function hasCompletedAllGroups(prediction: PredictionSummary) {
  return GROUP_ORDER.every(groupKey => {
    const groupPicks = prediction.predictions.get(groupKey);

    return Boolean(groupPicks && groupPicks.length === 4);
  });
}

async function arePicksLocked(guildId: string) {
  const settings = await GuildSettings.findOne({
    guildId
  });

  return Boolean(settings?.picksLocked);
}

async function continuePredictions(interaction: Interaction) {
  if (!interaction.guildId || !interaction.isRepliable()) {
    return true;
  }

  const existing = await WorldCupPrediction.findOne({
    guildId: interaction.guildId,
    userId: interaction.user.id
  });

  const nextGroup = GROUP_ORDER.find(group => {
    return !existing?.predictions.get(group);
  }) as GroupKey | undefined;

  if (!nextGroup) {
    await interaction.reply({
      content: "✅ You have already completed every group. Use `/predictions` to edit or `/play` to restart.",
      ephemeral: true
    });
    return true;
  }

  setSession(interaction.guildId, interaction.user.id, {
    group: nextGroup,
    mode: "play",
    picks: {}
  });

  if (interaction.isButton()) {
    await interaction.update(buildGroupPredictionPayload(nextGroup));
  } else {
    await interaction.reply({
      ...buildGroupPredictionPayload(nextGroup),
      ephemeral: true
    });
  }

  return true;
}

export async function handlePlayInteraction(
  interaction: Interaction
): Promise<boolean> {
  if (!interaction.guildId) return false;

  const locked = await arePicksLocked(interaction.guildId);

  const isCancelRestartButton =
    interaction.isButton() &&
    interaction.customId === "wc_cancel_restart";

  if (locked && !isCancelRestartButton) {
    const isPredictionInteraction =
      (
        interaction.isButton() &&
        interaction.customId.startsWith("wc_")
      ) ||
      (
        interaction.isStringSelectMenu() &&
        interaction.customId.startsWith("wc_")
      );

    if (isPredictionInteraction) {
      await interaction.reply({
        content: "🔒 Picks are currently locked. You cannot start, continue, restart, edit, or submit predictions.",
        ephemeral: true
      });

      return true;
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "wc_continue_predictions") {
      return continuePredictions(interaction);
    }

    if (interaction.customId === "wc_restart_predictions") {
      await interaction.update(buildRestartConfirmPayload());
      return true;
    }

    if (interaction.customId === "wc_cancel_restart") {
      await interaction.update({
        content: "Restart cancelled.",
        embeds: [],
        components: []
      });
      return true;
    }

    if (interaction.customId === "wc_confirm_restart") {
      await WorldCupPrediction.findOneAndUpdate(
        {
          guildId: interaction.guildId,
          userId: interaction.user.id
        },
        {
          $set: {
            predictions: {},
            completed: false
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      clearSession(interaction.guildId, interaction.user.id);

      setSession(interaction.guildId, interaction.user.id, {
        group: "A",
        mode: "play",
        picks: {}
      });

      await interaction.update({
        ...buildGroupPredictionPayload("A"),
        content: ""
      });

      return true;
    }

    if (interaction.customId === "wc_edit_predictions") {
      const prediction = await WorldCupPrediction.findOne({
        guildId: interaction.guildId,
        userId: interaction.user.id
      });

      if (!prediction) {
        await interaction.reply({
          content: "You do not have any predictions to edit yet. Use `/play` first.",
          ephemeral: true
        });
        return true;
      }

      await interaction.update(buildEditGroupSelectPayload());
      return true;
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "wc_edit_group") {
      const selectedGroup = interaction.values[0] as GroupKey;

      const prediction = await WorldCupPrediction.findOne({
        guildId: interaction.guildId,
        userId: interaction.user.id
      });

      if (!prediction) {
        await interaction.reply({
          content: "You do not have any predictions to edit yet. Use `/play` first.",
          ephemeral: true
        });
        return true;
      }

      const existingPicks = prediction.predictions.get(selectedGroup);

      setSession(interaction.guildId, interaction.user.id, {
        group: selectedGroup,
        mode: "edit",
        picks: existingPicks
          ? {
              first: existingPicks[0],
              second: existingPicks[1],
              third: existingPicks[2],
              fourth: existingPicks[3]
            }
          : {}
      });

      await interaction.update(buildGroupPredictionPayload(selectedGroup));
      return true;
    }

    if (!interaction.customId.startsWith("wc_pick:")) {
      return false;
    }

    const [, group, position] = interaction.customId.split(":") as [
      string,
      GroupKey,
      PositionKey
    ];

    const selectedTeam = interaction.values[0];

    const currentSession = getSession(
      interaction.guildId,
      interaction.user.id
    );

    if (!currentSession || currentSession.group !== group) {
      await interaction.reply({
        content: "This prediction session expired. Use `/play` or `/predictions` again.",
        ephemeral: true
      });
      return true;
    }

    currentSession.picks[position] = selectedTeam;

    setSession(interaction.guildId, interaction.user.id, currentSession);

    await interaction.deferUpdate();
    return true;
  }

  if (interaction.isButton()) {
    if (!interaction.customId.startsWith("wc_submit:")) {
      return false;
    }

    const [, group] = interaction.customId.split(":") as [
      string,
      GroupKey
    ];

    const session = getSession(interaction.guildId, interaction.user.id);

    if (!session || session.group !== group) {
      await interaction.reply({
        content: "This prediction session expired. Use `/play` or `/predictions` again.",
        ephemeral: true
      });
      return true;
    }

    const {
      first,
      second,
      third,
      fourth
    } = session.picks;

    if (!first || !second || !third || !fourth) {
      await interaction.reply({
        content: "You need to pick 1st, 2nd, 3rd and 4th before submitting.",
        ephemeral: true
      });
      return true;
    }

    const picks = [first, second, third, fourth];

    const hasDuplicates = new Set(picks).size !== picks.length;

    if (hasDuplicates) {
      await interaction.reply({
        content: "You picked the same team more than once. Fix your group order.",
        ephemeral: true
      });
      return true;
    }

    const savedPrediction = await WorldCupPrediction.findOneAndUpdate(
      {
        guildId: interaction.guildId,
        userId: interaction.user.id
      },
      {
        $set: {
          [`predictions.${group}`]: picks
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    if (!savedPrediction) {
      await interaction.reply({
        content: "Something went wrong while saving your prediction. Try again.",
        ephemeral: true
      });
      return true;
    }

    const completedAllGroups = hasCompletedAllGroups(savedPrediction);

    if (savedPrediction.completed !== completedAllGroups) {
      savedPrediction.completed = completedAllGroups;
      await savedPrediction.save();
    }

    clearSession(interaction.guildId, interaction.user.id);

    if (session.mode === "edit") {
      const embed = buildPredictionsSummaryEmbed({
        username: interaction.user.username,
        prediction: savedPrediction,
        title: `✅ Group ${group} updated`
      });

      await interaction.update({
        content: "",
        embeds: [embed],
        components: []
      });

      return true;
    }

    const currentIndex = GROUP_ORDER.indexOf(group);
    const nextGroup = GROUP_ORDER[currentIndex + 1];

    if (!nextGroup) {
      const confirmationEmbed = buildPredictionsSummaryEmbed({
        username: interaction.user.username,
        prediction: savedPrediction,
        title: "✅ Predictions submitted"
      });

      await interaction.update({
        content: "",
        embeds: [confirmationEmbed],
        components: []
      });

      return true;
    }

    setSession(interaction.guildId, interaction.user.id, {
      group: nextGroup,
      mode: "play",
      picks: {}
    });

    await interaction.update(buildGroupPredictionPayload(nextGroup));
    return true;
  }

  return false;
}