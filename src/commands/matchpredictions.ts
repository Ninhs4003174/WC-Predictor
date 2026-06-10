import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import { getTeamDisplayName } from "../data/worldCupGroups.js";
import { MatchPrediction } from "../models/MatchPrediction.js";

import {
  getAllScheduleMatchesWithIds,
  getMatchById
} from "../services/matchScheduleService.js";

const PAGE_SIZE = 10;

type BuildMatchPredictionsPayloadOptions = {
  guildId: string;
  userId: string;
  username: string;
  page: number;
};

type MatchPredictionLike = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
};

export const data = new SlashCommandBuilder()
  .setName("matchpredictions")
  .setDescription("View and edit your saved match score predictions");

function toDiscordTimestamp(kickoffUtc: string) {
  const unixSeconds = Math.floor(new Date(kickoffUtc).getTime() / 1000);
  return `<t:${unixSeconds}:f>`;
}

function buildEditDropdown(predictions: MatchPredictionLike[]) {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("match_predict_select")
      .setPlaceholder("Choose one of your predictions to edit")
      .addOptions(
        predictions.map(prediction => {
          const match = getMatchById(prediction.matchId);

          const homeTeam = match?.homeTeam ?? prediction.homeTeam;
          const awayTeam = match?.awayTeam ?? prediction.awayTeam;

          return {
            label: `#${prediction.matchId} ${homeTeam} vs ${awayTeam}`.slice(0, 100),
            description: `Current: ${homeTeam} ${prediction.homeGoals} - ${prediction.awayGoals} ${awayTeam}`.slice(0, 100),
            value: prediction.matchId
          };
        })
      )
  );
}

function buildPageButtons(page: number, totalPages: number) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`match_predictions_page:${page - 1}`)
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 0),

    new ButtonBuilder()
      .setCustomId(`match_predictions_page:${page + 1}`)
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= totalPages - 1)
  );
}

export async function buildMatchPredictionsPayload({
  guildId,
  userId,
  username,
  page
}: BuildMatchPredictionsPayloadOptions) {
  const predictions = await MatchPrediction.find({
    guildId,
    userId
  });

  if (predictions.length === 0) {
    return {
      content: "You have not made any match score predictions yet. Use `/schedule` and choose a match from the dropdown.",
      embeds: [],
      components: []
    };
  }

  const scheduleMatches = getAllScheduleMatchesWithIds();

  const matchOrder = new Map(
    scheduleMatches.map((match, index) => [match.matchId, index])
  );

  const sortedPredictions = predictions.slice().sort((a, b) => {
    const aIndex = matchOrder.get(a.matchId) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = matchOrder.get(b.matchId) ?? Number.MAX_SAFE_INTEGER;

    return aIndex - bIndex;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(sortedPredictions.length / PAGE_SIZE)
  );

  const safePage = Math.min(
    Math.max(page, 0),
    totalPages - 1
  );

  const start = safePage * PAGE_SIZE;
  const pagePredictions = sortedPredictions.slice(start, start + PAGE_SIZE);

  const embed = new EmbedBuilder()
    .setTitle(`⚽ ${username}'s Match Predictions`)
    .setDescription(
      [
        "These are your saved score predictions.",
        "",
        "Use the dropdown below to edit one of the predictions on this page.",
        "",
      ].join("\n")
    )
    .setFooter({
      text: `Page ${safePage + 1}/${totalPages} • Predictions lock when each match starts`
    });

  for (const prediction of pagePredictions) {
    const match = getMatchById(prediction.matchId);

    const homeTeam = match?.homeTeam ?? prediction.homeTeam;
    const awayTeam = match?.awayTeam ?? prediction.awayTeam;

    const matchTitle = match
      ? `#${match.matchId} — ${getTeamDisplayName(homeTeam)} vs ${getTeamDisplayName(awayTeam)}`
      : `#${prediction.matchId} — ${getTeamDisplayName(homeTeam)} vs ${getTeamDisplayName(awayTeam)}`;

    const valueParts = [
      `Prediction: **${getTeamDisplayName(homeTeam)} ${prediction.homeGoals} - ${prediction.awayGoals} ${getTeamDisplayName(awayTeam)}**`
    ];

    if (match) {
      valueParts.push(`Kickoff: ${toDiscordTimestamp(match.kickoffUtc)}`);
    }

    embed.addFields({
      name: matchTitle,
      value: valueParts.join("\n"),
      inline: false
    });
  }

  const components = [];

  if (totalPages > 1) {
    components.push(buildPageButtons(safePage, totalPages));
  }

  components.push(buildEditDropdown(pagePredictions));

  return {
    content: "",
    embeds: [embed],
    components
  };
}

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "This command only works inside a server.",
      ephemeral: true
    });
    return;
  }

  const payload = await buildMatchPredictionsPayload({
    guildId: interaction.guildId,
    userId: interaction.user.id,
    username: interaction.user.username,
    page: 0
  });

  await interaction.reply({
    ...payload,
    ephemeral: true
  });
}