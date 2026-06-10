import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import {
  GROUP_ORDER,
  getTeamDisplayName,
  type GroupKey
} from "../data/worldCupGroups.js";

import {
  getAllScheduleMatchesWithIds,
  type ScheduleMatchWithId
} from "./matchScheduleService.js";

const PAGE_SIZE = 6;

export type ScheduleScope = {
  group: "all" | GroupKey;
  country?: string;
};

function toDiscordTimestamp(kickoffUtc: string) {
  const unixSeconds = Math.floor(new Date(kickoffUtc).getTime() / 1000);
  return `<t:${unixSeconds}:f>`;
}

function formatMatch(match: ScheduleMatchWithId) {
  return [
    `**#${match.matchId} — Group ${match.group}: ${getTeamDisplayName(match.homeTeam)} vs ${getTeamDisplayName(match.awayTeam)}**`,
    `${toDiscordTimestamp(match.kickoffUtc)}`,
    `📍 ${match.venue}`
  ].join("\n");
}

function sortMatches(matches: ScheduleMatchWithId[]) {
  return matches.slice().sort((a, b) => {
    return (
      new Date(a.kickoffUtc).getTime() -
      new Date(b.kickoffUtc).getTime()
    );
  });
}

function cleanText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function getCountryAliases(country: string) {
  const cleaned = cleanText(country);

  const aliases: Record<string, string[]> = {
    usa: ["united states", "usa", "us", "america"],
    "united states": ["united states", "usa", "us", "america"],

    "south korea": ["south korea", "korea republic", "korea"],
    korea: ["south korea", "korea republic", "korea"],

    czechia: ["czechia", "czech republic"],
    "czech republic": ["czechia", "czech republic"],

    "ivory coast": ["ivory coast", "cote divoire", "côte divoire"],
    "cote divoire": ["ivory coast", "cote divoire", "côte divoire"],

    curacao: ["curacao", "curaçao"],
    "curaçao": ["curacao", "curaçao"],

    turkey: ["turkey", "turkiye", "türkiye"],
    turkiye: ["turkey", "turkiye", "türkiye"],
    "türkiye": ["turkey", "turkiye", "türkiye"],

    "dr congo": ["dr congo", "congo dr", "congo"],
    "congo dr": ["dr congo", "congo dr", "congo"],

    bosnia: ["bosnia", "bosnia and herzegovina"],
    "bosnia and herzegovina": ["bosnia", "bosnia and herzegovina"],

    "new zealand": ["new zealand", "nz"],
    nz: ["new zealand", "nz"]
  };

  return aliases[cleaned] ?? [cleaned];
}

function countryMatches(match: ScheduleMatchWithId, country: string) {
  const aliases = getCountryAliases(country);

  const homeTeam = cleanText(match.homeTeam);
  const awayTeam = cleanText(match.awayTeam);

  return aliases.some(alias => {
    return (
      homeTeam.includes(alias) ||
      awayTeam.includes(alias) ||
      alias.includes(homeTeam) ||
      alias.includes(awayTeam)
    );
  });
}

function getMatchesForScope(scope: ScheduleScope) {
  let matches = getAllScheduleMatchesWithIds();

  if (scope.group !== "all") {
    matches = matches.filter(match => {
      return match.group === scope.group;
    });
  }

  if (scope.country && scope.country.trim().length > 0) {
    matches = matches.filter(match => {
      return countryMatches(match, scope.country!);
    });
  }

  return sortMatches(matches);
}

function isGroupKey(value: string): value is GroupKey {
  return GROUP_ORDER.includes(value as GroupKey);
}

export function normaliseScheduleGroup(group: string): "all" | GroupKey {
  if (group === "all") {
    return "all";
  }

  if (isGroupKey(group)) {
    return group;
  }

  return "all";
}

function encodeCountryForButton(country?: string) {
  if (!country) return "none";
  return encodeURIComponent(country);
}

function decodeCountryFromButton(country: string) {
  if (country === "none") return undefined;
  return decodeURIComponent(country);
}

export function parseScheduleButtonData(rawGroup: string, rawCountry: string) {
  return {
    group: normaliseScheduleGroup(rawGroup),
    country: decodeCountryFromButton(rawCountry)
  };
}

function buildPredictMatchSelectRow(matches: ScheduleMatchWithId[]) {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("match_predict_select")
      .setPlaceholder("Choose a match to predict")
      .addOptions(
        matches.map(match => ({
          label: `#${match.matchId} ${match.homeTeam} vs ${match.awayTeam}`.slice(0, 100),
          description: `Group ${match.group} • Enter the predicted score`.slice(0, 100),
          value: match.matchId
        }))
      )
  );
}

export function buildSchedulePayload(
  page: number,
  scope: ScheduleScope = {
    group: "all"
  }
) {
  const matches = getMatchesForScope(scope);

  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);

  const start = safePage * PAGE_SIZE;
  const pageMatches = matches.slice(start, start + PAGE_SIZE);

  const titleParts = ["📅 World Cup Group Stage Schedule"];

  if (scope.group !== "all") {
    titleParts.push(`Group ${scope.group}`);
  }

  if (scope.country) {
    titleParts.push(scope.country);
  }

  const embed = new EmbedBuilder()
    .setTitle(titleParts.join(" — "))
    .setDescription(
      pageMatches.length > 0
        ? [
            pageMatches.map(formatMatch).join("\n\n"),
            "",
            "Use the dropdown below to predict a match score."
          ].join("\n")
        : "No matches found for that filter."
    )
    .setFooter({
      text: `Page ${safePage + 1}/${totalPages} • Times use your Discord local timezone`
    });

  const components = [];

  const countryForButton = encodeCountryForButton(scope.country);

  if (totalPages > 1) {
    const pageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`schedule_page:${scope.group}:${countryForButton}:${safePage - 1}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(safePage === 0),

      new ButtonBuilder()
        .setCustomId(`schedule_page:${scope.group}:${countryForButton}:${safePage + 1}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(safePage >= totalPages - 1)
    );

    components.push(pageRow);
  }

  if (pageMatches.length > 0) {
    components.push(buildPredictMatchSelectRow(pageMatches));
  }

  return {
    embeds: [embed],
    components
  };
}