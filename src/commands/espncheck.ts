import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

import { fetchEspnScoreboard } from "../services/espnSoccerService.js";

function formatDate(input: string | null) {
  if (!input) return undefined;

  return input.replaceAll("-", "");
}

function formatGoals(goals: {
  minute: string;
  scorer: string;
  teamName: string;
  type: string;
  ownGoal: boolean;
  penalty: boolean;
}[]) {
  if (goals.length === 0) {
    return "No goals found yet.";
  }

  return goals
    .map(goal => {
      const tags = [];

      if (goal.penalty) tags.push("PEN");
      if (goal.ownGoal) tags.push("OG");

      const tagText = tags.length > 0
        ? ` (${tags.join(", ")})`
        : "";

      return `⚽ **${goal.minute}** — ${goal.scorer}${tagText} • ${goal.teamName}`;
    })
    .join("\n");
}

export const data = new SlashCommandBuilder()
  .setName("espncheck")
  .setDescription("Check ESPN soccer scores and goal details")
  .addStringOption(option =>
    option
      .setName("league")
      .setDescription("ESPN league code")
      .setRequired(false)
      .addChoices(
        {
          name: "FIFA World Cup",
          value: "fifa.world"
        },
        {
          name: "Premier League test",
          value: "eng.1"
        }
      )
  )
  .addStringOption(option =>
    option
      .setName("date")
      .setDescription("Date as YYYYMMDD or YYYY-MM-DD")
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option
      .setName("public")
      .setDescription("Show to everyone? Defaults to private.")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const league = interaction.options.getString("league") ?? "fifa.world";
  const date = formatDate(interaction.options.getString("date"));
  const showPublic = interaction.options.getBoolean("public") ?? false;

  await interaction.deferReply({
    ephemeral: !showPublic
  });

  const matches = await fetchEspnScoreboard({
    league,
    date
  });

  if (matches.length === 0) {
    await interaction.editReply({
      content: `No ESPN matches found for league \`${league}\`${date ? ` on \`${date}\`` : ""}.`
    });

    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("📡 ESPN Score Check")
    .setDescription(
      [
        `League: \`${league}\``,
        date ? `Date: \`${date}\`` : "Date: ESPN default/current scoreboard"
      ].join("\n")
    )
    .setTimestamp();

  for (const match of matches.slice(0, 8)) {
    embed.addFields({
      name: `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`,
      value: [
        `Status: **${match.status}**`,
        `ESPN ID: \`${match.espnId}\``,
        "",
        formatGoals(match.goals)
      ].join("\n"),
      inline: false
    });
  }

  await interaction.editReply({
    embeds: [embed]
  });
}