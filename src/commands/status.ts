import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

import {
  GROUP_ORDER,
  type GroupKey
} from "../data/worldCupGroups.js";

import { MatchPrediction } from "../models/MatchPrediction.js";

import {
  WorldCupPrediction,
  type IWorldCupPrediction
} from "../models/WorldCupPrediction.js";

import { getAllScheduleMatchesWithIds } from "../services/matchScheduleService.js";

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
          name: "Group predictions",
          value: "group"
        },
        {
          name: "Match predictions",
          value: "match"
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

function truncateText(text: string, maxLength = 1000) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 30)}\n...and more`;
}

async function buildGroupStatusEmbed(guildId: string) {
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
    .sort((a, b) => b.completedGroups - a.completedGroups);

  const totalEntrants = userProgress.length;
  const completedEntries = userProgress.filter(user => user.completed).length;

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

    return `**${group}:** ${count}`;
  }).join(" • ");

  const userList =
    userProgress.length === 0
      ? "No group predictions submitted yet."
      : userProgress
          .map(user => {
            const status = user.completed ? "✅ complete" : "🟡 in progress";

            return `<@${user.userId}> \`${user.userId}\` — **${user.completedGroups}/${GROUP_ORDER.length}** groups ${status}`;
          })
          .join("\n");

  return new EmbedBuilder()
    .setTitle("🌍 Group Prediction Status")
    .setDescription(
      [
        "A user counts as **entered** once they submit at least one group.",
        "",
        `👥 **Entrants:** ${totalEntrants}`,
        `✅ **Completed Entries:** ${completedEntries}`,
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
        name: "👤 Users / User IDs",
        value: truncateText(userList),
        inline: false
      }
    )
    .setFooter({
      text: "Group predictions count once a group is submitted"
    })
    .setTimestamp();
}

async function buildMatchStatusEmbed(guildId: string) {
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
          predictions: -1
        }
      }
    ])
  ]);

  const totalEntrants = userStats.length;

  const averagePredictions =
    totalEntrants === 0
      ? "0.0"
      : (totalPredictions / totalEntrants).toFixed(1);

  const userList =
    userStats.length === 0
      ? "No match predictions submitted yet."
      : userStats
          .map(user => {
            return `<@${user._id}> \`${user._id}\` — **${user.predictions}** match predictions`;
          })
          .join("\n");

  return new EmbedBuilder()
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
      name: "👤 Users / User IDs",
      value: truncateText(userList),
      inline: false
    })
    .setFooter({
      text: "Match predictions count once a match score is submitted"
    })
    .setTimestamp();
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

  await interaction.deferReply({
    ephemeral: !showPublic
  });

  const embed =
    type === "group"
      ? await buildGroupStatusEmbed(interaction.guildId)
      : await buildMatchStatusEmbed(interaction.guildId);

  await interaction.editReply({
    embeds: [embed]
  });
}