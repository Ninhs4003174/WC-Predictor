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
  GROUP_ORDER,
  type GroupKey
} from "../data/worldCupGroups.js";

import {
  ACTUAL_GROUP_STANDINGS,
  EXACT_POSITION_POINTS,
  MAX_GROUP_STAGE_SCORE,
  ONE_POSITION_AWAY_POINTS
} from "../data/groupResults.js";

import {
  WorldCupPrediction,
  type IWorldCupPrediction
} from "../models/WorldCupPrediction.js";

const PAGE_SIZE = 10;

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("View the group-stage prediction leaderboard")
  .addBooleanOption(option =>
    option
      .setName("public")
      .setDescription("Show the leaderboard to everyone? Defaults to public.")
      .setRequired(false)
  );

type PredictionMapLike =
  | IWorldCupPrediction["predictions"]
  | Record<string, string[]>
  | undefined;

type GroupScoreBreakdown = {
  group: GroupKey;
  points: number;
  exact: number;
  close: number;
};

type LeaderboardEntry = {
  userId: string;
  score: number;
  exact: number;
  close: number;
  completedGroups: number;
  groups: GroupScoreBreakdown[];
};

function normaliseTeamName(teamName: string) {
  return teamName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function canonicalTeamKey(teamName: string) {
  const normalised = normaliseTeamName(teamName);

  const aliases: Record<string, string> = {
    usa: "unitedstates",
    us: "unitedstates",
    unitedstatesofamerica: "unitedstates",

    turkey: "turkiye",
    türkiye: "turkiye",

    curacao: "curacao",
    curaçao: "curacao",

    caboverde: "capeverde",
    capeverde: "capeverde",

    drcongo: "congodr",
    congodr: "congodr",
    democraticrepublicofcongo: "congodr",

    bosniaherzegovina: "bosniaandherzegovina",
    bosniaherz: "bosniaandherzegovina",

    ivorycoast: "ivorycoast",
    cotedivoire: "ivorycoast"
  };

  return aliases[normalised] ?? normalised;
}

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

function getActualPosition(group: GroupKey, teamName: string) {
  const actualStandings = ACTUAL_GROUP_STANDINGS[group];
  const targetKey = canonicalTeamKey(teamName);

  return actualStandings.findIndex(actualTeam => {
    return canonicalTeamKey(actualTeam) === targetKey;
  });
}

function scoreGroup(group: GroupKey, picks: string[] | undefined): GroupScoreBreakdown {
  if (!picks || picks.length === 0) {
    return {
      group,
      points: 0,
      exact: 0,
      close: 0
    };
  }

  return picks.slice(0, 4).reduce<GroupScoreBreakdown>(
    (breakdown, pickedTeam, predictedIndex) => {
      const actualIndex = getActualPosition(group, pickedTeam);

      if (actualIndex === -1) {
        return breakdown;
      }

      if (actualIndex === predictedIndex) {
        breakdown.points += EXACT_POSITION_POINTS;
        breakdown.exact += 1;
        return breakdown;
      }

      if (Math.abs(actualIndex - predictedIndex) === 1) {
        breakdown.points += ONE_POSITION_AWAY_POINTS;
        breakdown.close += 1;
      }

      return breakdown;
    },
    {
      group,
      points: 0,
      exact: 0,
      close: 0
    }
  );
}

function scorePrediction(prediction: IWorldCupPrediction): LeaderboardEntry {
  const groups = GROUP_ORDER.map(group => {
    return scoreGroup(group, getGroupPicks(prediction.predictions, group));
  });

  const score = groups.reduce((total, group) => {
    return total + group.points;
  }, 0);

  const exact = groups.reduce((total, group) => {
    return total + group.exact;
  }, 0);

  const close = groups.reduce((total, group) => {
    return total + group.close;
  }, 0);

  const completedGroups = GROUP_ORDER.reduce((total, group) => {
    const picks = getGroupPicks(prediction.predictions, group);

    return picks && picks.length === 4
      ? total + 1
      : total;
  }, 0);

  return {
    userId: prediction.userId,
    score,
    exact,
    close,
    completedGroups,
    groups
  };
}

function getMedal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";

  return `**${rank}.**`;
}

function getPageSlice<T>(items: T[], page: number) {
  const start = page * PAGE_SIZE;

  return items.slice(start, start + PAGE_SIZE);
}

function buildPageButtons(page: number, totalPages: number) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("leaderboard_previous")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 0),

    new ButtonBuilder()
      .setCustomId("leaderboard_next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= totalPages - 1)
  );
}

function formatGroupBreakdown(entry: LeaderboardEntry) {
  return entry.groups
    .map(group => {
      return `${group.group}:${group.points}`;
    })
    .join(" • ");
}

function buildLeaderboardEmbed(
  entries: LeaderboardEntry[],
  page: number
) {
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const pageEntries = getPageSlice(entries, safePage);

  const leaderboardText =
    pageEntries.length === 0
      ? "No group predictions have been submitted yet."
      : pageEntries
          .map((entry, index) => {
            const rank = safePage * PAGE_SIZE + index + 1;
            const medal = getMedal(rank);

            return [
              `${medal} <@${entry.userId}>`,
              `Score: **${entry.score}/${MAX_GROUP_STAGE_SCORE}**`,
              `Exact: **${entry.exact}** • One-off: **${entry.close}** • Groups: **${entry.completedGroups}/${GROUP_ORDER.length}**`,
              `\`${formatGroupBreakdown(entry)}\``
            ].join("\n");
          })
          .join("\n\n");

  const leader = entries[0];

  const description = leader
    ? [
        `Current leader: <@${leader.userId}> with **${leader.score}/${MAX_GROUP_STAGE_SCORE}** points.`,
        "",
        `Scoring: exact position = **${EXACT_POSITION_POINTS}**, one position away = **${ONE_POSITION_AWAY_POINTS}**.`,
        "",
        leaderboardText
      ].join("\n")
    : [
        `Scoring: exact position = **${EXACT_POSITION_POINTS}**, one position away = **${ONE_POSITION_AWAY_POINTS}**.`,
        "",
        leaderboardText
      ].join("\n");

  return new EmbedBuilder()
    .setTitle("🏆 Group Stage Leaderboard")
    .setDescription(description)
    .setFooter({
      text: `Page ${safePage + 1}/${totalPages} • Max score ${MAX_GROUP_STAGE_SCORE}`
    })
    .setTimestamp();
}

async function getLeaderboardEntries(guildId: string) {
  const predictions = await WorldCupPrediction.find({
    guildId
  });

  return predictions
    .map(prediction => scorePrediction(prediction))
    .filter(entry => entry.completedGroups > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.exact !== a.exact) {
        return b.exact - a.exact;
      }

      if (b.close !== a.close) {
        return b.close - a.close;
      }

      if (b.completedGroups !== a.completedGroups) {
        return b.completedGroups - a.completedGroups;
      }

      return a.userId.localeCompare(b.userId);
    });
}

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "This command only works inside a server.",
      ephemeral: true
    });
    return;
  }

  const showPublic = interaction.options.getBoolean("public") ?? true;

  await interaction.deferReply({
    ephemeral: !showPublic
  });

  const entries = await getLeaderboardEntries(interaction.guildId);

  let page = 0;
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));

  const message = await interaction.editReply({
    embeds: [buildLeaderboardEmbed(entries, page)],
    components: totalPages > 1
      ? [buildPageButtons(page, totalPages)]
      : []
  });

  if (totalPages <= 1) {
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

    if (buttonInteraction.customId === "leaderboard_previous") {
      page -= 1;
    }

    if (buttonInteraction.customId === "leaderboard_next") {
      page += 1;
    }

    page = Math.min(Math.max(page, 0), totalPages - 1);

    await buttonInteraction.update({
      embeds: [buildLeaderboardEmbed(entries, page)],
      components: [buildPageButtons(page, totalPages)]
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