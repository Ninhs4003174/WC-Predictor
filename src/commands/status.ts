import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

import {
  countKnockoutPicks,
  getChampion,
  hasKnockoutStarted,
  teamWithFlag,
  TOTAL_KNOCKOUT_PICKS
} from "../data/knockoutBracket.js";

import {
  GROUP_ORDER,
  type GroupKey
} from "../data/worldCupGroups.js";

import { KnockoutPrediction } from "../models/KnockoutPrediction.js";
import { MatchPrediction } from "../models/MatchPrediction.js";

import {
  WorldCupPrediction,
  type IWorldCupPrediction
} from "../models/WorldCupPrediction.js";

import { getAllScheduleMatchesWithIds } from "../services/matchScheduleService.js";

const PAGE_SIZE = 10;

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("View World Cup Predictor status")
  .addStringOption(option =>
    option
      .setName("type")
      .setDescription("Choose which prediction status to view")
      .setRequired(true)
      .addChoices(
        {
          name: "Knockout predictions",
          value: "knockout"
        },
        {
          name: "Match predictions",
          value: "match"
        },
        {
          name: "Group predictions legacy",
          value: "group"
        }
      )
  )
  .addBooleanOption(option =>
    option
      .setName("public")
      .setDescription("Show the status to everyone? Defaults to private.")
      .setRequired(false)
  );

type PredictionMapLike =
  | IWorldCupPrediction["predictions"]
  | Record<string, string[]>
  | undefined;

type StatusPagePayload = {
  embed: EmbedBuilder;
  totalPages: number;
};

function getGroupPicks(
  predictions: PredictionMapLike,
  group: GroupKey
): string[] | undefined {
  if (!predictions) return undefined;

  if (predictions instanceof Map) {
    return predictions.get(group);
  }

  return predictions[group];
}

function countCompletedGroups(prediction: IWorldCupPrediction) {
  return GROUP_ORDER.reduce((total, group) => {
    const picks = getGroupPicks(prediction.predictions, group);

    return picks && picks.length === 4
      ? total + 1
      : total;
  }, 0);
}

function buildPageButtons(page: number, totalPages: number) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("status_previous")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 0),

    new ButtonBuilder()
      .setCustomId("status_next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= totalPages - 1)
  );
}

function getPageSlice<T>(items: T[], page: number) {
  const start = page * PAGE_SIZE;

  return items.slice(start, start + PAGE_SIZE);
}

async function buildKnockoutStatusPage(
  guildId: string,
  page: number
): Promise<StatusPagePayload> {
  const predictionDocs = await KnockoutPrediction.find({
    guildId
  });

  const userProgress = predictionDocs
    .map(prediction => {
      const picksMade = countKnockoutPicks(prediction.rounds);
      const champion = getChampion(prediction.rounds);

      return {
        userId: prediction.userId,
        picksMade,
        completed: prediction.completed,
        champion
      };
    })
    .filter(user => user.picksMade > 0)
    .sort((a, b) => {
      if (b.picksMade !== a.picksMade) {
        return b.picksMade - a.picksMade;
      }

      return a.userId.localeCompare(b.userId);
    });

  const totalEntrants = userProgress.length;
  const completedUsers = userProgress.filter(user => user.completed);
  const inProgressUsers = userProgress.filter(user => !user.completed);

  const totalPicks = userProgress.reduce((total, user) => {
    return total + user.picksMade;
  }, 0);

  const maxPossiblePicks = totalEntrants * TOTAL_KNOCKOUT_PICKS;

  const completionPercent =
    maxPossiblePicks === 0
      ? 0
      : Math.round((totalPicks / maxPossiblePicks) * 100);

  const totalPages = Math.max(1, Math.ceil(userProgress.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const pageUsers = getPageSlice(userProgress, safePage);

  const userList =
    pageUsers.length === 0
      ? "No knockout predictions submitted yet."
      : pageUsers
          .map((user, index) => {
            const rank = safePage * PAGE_SIZE + index + 1;
            const status = user.completed ? "✅ complete" : "🟡 in progress";
            const championText = user.champion
              ? ` — Champion: **${teamWithFlag(user.champion)}**`
              : "";

            return `**${rank}.** <@${user.userId}> \`${user.userId}\` — **${user.picksMade}/${TOTAL_KNOCKOUT_PICKS}** picks ${status}${championText}`;
          })
          .join("\n");

  const lockText = hasKnockoutStarted()
    ? "🔒 Locked"
    : "🔓 Open";

  const embed = new EmbedBuilder()
    .setTitle("🏆 Knockout Prediction Status")
    .setDescription(
      [
        "A user counts as **entered** once they submit at least one knockout pick.",
        "",
        `👥 **Total Entrants:** ${totalEntrants}`,
        `✅ **Completed Entries:** ${completedUsers.length}`,
        `🟡 **In Progress:** ${inProgressUsers.length}`,
        `🏆 **Picks Submitted:** ${totalPicks}/${maxPossiblePicks}`,
        `📊 **Overall Completion:** ${completionPercent}%`,
        `🔐 **Lock Status:** ${lockText}`
      ].join("\n")
    )
    .addFields({
      name: `👤 Users / User IDs — Page ${safePage + 1}/${totalPages}`,
      value: userList,
      inline: false
    })
    .setFooter({
      text: "Knockout predictions count once a winner is selected"
    })
    .setTimestamp();

  return {
    embed,
    totalPages
  };
}

async function buildGroupStatusPage(
  guildId: string,
  page: number
): Promise<StatusPagePayload> {
  const groupPredictionDocs = await WorldCupPrediction.find({
    guildId
  });

  const userProgress = groupPredictionDocs
    .map(prediction => {
      const completedGroups = countCompletedGroups(prediction);

      return {
        userId: prediction.userId,
        completedGroups,
        completed: prediction.completed || completedGroups === GROUP_ORDER.length,
        prediction
      };
    })
    .filter(user => user.completedGroups > 0)
    .sort((a, b) => {
      if (b.completedGroups !== a.completedGroups) {
        return b.completedGroups - a.completedGroups;
      }

      return a.userId.localeCompare(b.userId);
    });

  const totalEntrants = userProgress.length;
  const completedUsers = userProgress.filter(user => user.completed);
  const inProgressUsers = userProgress.filter(user => !user.completed);

  const totalGroupSubmissions = userProgress.reduce((total, user) => {
    return total + user.completedGroups;
  }, 0);

  const maxPossibleGroupSubmissions = totalEntrants * GROUP_ORDER.length;

  const completionPercent =
    maxPossibleGroupSubmissions === 0
      ? 0
      : Math.round((totalGroupSubmissions / maxPossibleGroupSubmissions) * 100);

  const groupBreakdown = GROUP_ORDER.map(group => {
    const count = userProgress.filter(user => {
      const picks = getGroupPicks(user.prediction.predictions, group);

      return picks && picks.length === 4;
    }).length;

    return `**${group}:** ${count}/${totalEntrants}`;
  }).join(" • ");

  const totalPages = Math.max(1, Math.ceil(userProgress.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const pageUsers = getPageSlice(userProgress, safePage);

  const userList =
    pageUsers.length === 0
      ? "No group predictions submitted yet."
      : pageUsers
          .map((user, index) => {
            const rank = safePage * PAGE_SIZE + index + 1;
            const status = user.completed ? "✅ complete" : "🟡 in progress";

            return `**${rank}.** <@${user.userId}> \`${user.userId}\` — **${user.completedGroups}/${GROUP_ORDER.length}** groups ${status}`;
          })
          .join("\n");

  const embed = new EmbedBuilder()
    .setTitle("🌍 Group Prediction Status Legacy")
    .setDescription(
      [
        "A user counts as **entered** once they submit at least one group.",
        "",
        `👥 **Total Entrants:** ${totalEntrants}`,
        `✅ **Completed Entries:** ${completedUsers.length}`,
        `🟡 **In Progress:** ${inProgressUsers.length}`,
        `🌍 **Groups Submitted:** ${totalGroupSubmissions}/${maxPossibleGroupSubmissions}`,
        `📊 **Overall Completion:** ${completionPercent}%`
      ].join("\n")
    )
    .addFields(
      {
        name: "📌 Group Breakdown",
        value: groupBreakdown || "No group predictions submitted yet.",
        inline: false
      },
      {
        name: `👤 Users / User IDs — Page ${safePage + 1}/${totalPages}`,
        value: userList,
        inline: false
      }
    )
    .setFooter({
      text: "Legacy group predictions"
    })
    .setTimestamp();

  return {
    embed,
    totalPages
  };
}

async function buildMatchStatusPage(
  guildId: string,
  page: number
): Promise<StatusPagePayload> {
  const totalMatches = getAllScheduleMatchesWithIds().length;

  const [
    totalPredictions,
    matchIdsWithPredictions,
    userStats
  ] = await Promise.all([
    MatchPrediction.countDocuments({ guildId }),
    MatchPrediction.distinct("matchId", { guildId }),
    MatchPrediction.aggregate([
      {
        $match: {
          guildId
        }
      },
      {
        $group: {
          _id: "$userId",
          predictions: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          predictions: -1,
          _id: 1
        }
      }
    ])
  ]);

  const totalEntrants = userStats.length;

  const averagePredictions =
    totalEntrants === 0
      ? "0.0"
      : (totalPredictions / totalEntrants).toFixed(1);

  const totalPages = Math.max(1, Math.ceil(userStats.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const pageUsers = getPageSlice(userStats, safePage);

  const userList =
    pageUsers.length === 0
      ? "No match predictions submitted yet."
      : pageUsers
          .map((user, index) => {
            const rank = safePage * PAGE_SIZE + index + 1;

            return `**${rank}.** <@${user._id}> \`${user._id}\` — **${user.predictions}** match predictions`;
          })
          .join("\n");

  const embed = new EmbedBuilder()
    .setTitle("⚽ Match Prediction Status")
    .setDescription(
      [
        "A user counts as **entered** once they submit at least one match prediction.",
        "",
        `👥 **Entrants:** ${totalEntrants}`,
        `📝 **Total Predictions:** ${totalPredictions}`,
        `⚽ **Matches Picked:** ${matchIdsWithPredictions.length}/${totalMatches}`,
        `📊 **Average Activity:** ${averagePredictions} predictions per entrant`
      ].join("\n")
    )
    .addFields({
      name: `👤 Users / User IDs — Page ${safePage + 1}/${totalPages}`,
      value: userList,
      inline: false
    })
    .setFooter({
      text: "Match predictions count once a match score is submitted"
    })
    .setTimestamp();

  return {
    embed,
    totalPages
  };
}

async function buildStatusPage(
  type: string,
  guildId: string,
  page: number
) {
  if (type === "knockout") {
    return buildKnockoutStatusPage(guildId, page);
  }

  if (type === "group") {
    return buildGroupStatusPage(guildId, page);
  }

  return buildMatchStatusPage(guildId, page);
}

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "This command only works inside a server.",
      ephemeral: true
    });
    return;
  }

  const type = interaction.options.getString("type", true);
  const showPublic = interaction.options.getBoolean("public") ?? false;

  let page = 0;

  await interaction.deferReply({
    ephemeral: !showPublic
  });

  const firstPayload = await buildStatusPage(
    type,
    interaction.guildId,
    page
  );

  const message = await interaction.editReply({
    embeds: [firstPayload.embed],
    components: firstPayload.totalPages > 1
      ? [buildPageButtons(page, firstPayload.totalPages)]
      : []
  });

  if (firstPayload.totalPages <= 1) {
    return;
  }

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 5 * 60 * 1000
  });

  collector.on("collect", async buttonInteraction => {
    if (buttonInteraction.user.id !== interaction.user.id) {
      await buttonInteraction.reply({
        content: "Only the person who ran this command can use these buttons.",
        ephemeral: true
      });
      return;
    }

    if (buttonInteraction.customId === "status_previous") {
      page -= 1;
    }

    if (buttonInteraction.customId === "status_next") {
      page += 1;
    }

    const payload = await buildStatusPage(
      type,
      interaction.guildId!,
      page
    );

    const safePage = Math.min(Math.max(page, 0), payload.totalPages - 1);
    page = safePage;

    await buttonInteraction.update({
      embeds: [payload.embed],
      components: payload.totalPages > 1
        ? [buildPageButtons(page, payload.totalPages)]
        : []
    });
  });

  collector.on("end", async () => {
    try {
      await interaction.editReply({
        components: []
      });
    } catch {
      // Ignore if the message can no longer be edited.
    }
  });
}