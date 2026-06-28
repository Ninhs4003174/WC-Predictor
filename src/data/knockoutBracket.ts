export type RoundId = "r32" | "r16" | "qf" | "sf" | "final";

export type KnockoutMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
};

export type KnockoutRounds = Partial<Record<RoundId, string[]>>;

export type KnockoutRoundsLike =
  | KnockoutRounds
  | Map<string, string[]>
  | undefined
  | null;

export const ROUND_ORDER: RoundId[] = [
  "r32",
  "r16",
  "qf",
  "sf",
  "final"
];

export const ROUND_LABELS: Record<RoundId, string> = {
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-finals",
  sf: "Semi-finals",
  final: "Final"
};

export const ROUND_POINTS: Record<RoundId, number> = {
  r32: 10,
  r16: 20,
  qf: 30,
  sf: 40,
  final: 50
};

export const TOTAL_KNOCKOUT_PICKS = 31;

export const FIRST_KNOCKOUT_KICKOFF_UTC = "2026-06-28T19:00:00Z";

export const ROUND_OF_32_MATCHES: KnockoutMatch[] = [
  {
    id: "r32-1",
    homeTeam: "South Africa",
    awayTeam: "Canada"
  },
  {
    id: "r32-2",
    homeTeam: "Netherlands",
    awayTeam: "Morocco"
  },
  {
    id: "r32-3",
    homeTeam: "Germany",
    awayTeam: "Paraguay"
  },
  {
    id: "r32-4",
    homeTeam: "France",
    awayTeam: "Sweden"
  },
  {
    id: "r32-5",
    homeTeam: "Brazil",
    awayTeam: "Japan"
  },
  {
    id: "r32-6",
    homeTeam: "Ivory Coast",
    awayTeam: "Norway"
  },
  {
    id: "r32-7",
    homeTeam: "Mexico",
    awayTeam: "Ecuador"
  },
  {
    id: "r32-8",
    homeTeam: "England",
    awayTeam: "Congo DR"
  },
  {
    id: "r32-9",
    homeTeam: "Belgium",
    awayTeam: "Senegal"
  },
  {
    id: "r32-10",
    homeTeam: "United States",
    awayTeam: "Bosnia and Herzegovina"
  },
  {
    id: "r32-11",
    homeTeam: "Spain",
    awayTeam: "Austria"
  },
  {
    id: "r32-12",
    homeTeam: "Portugal",
    awayTeam: "Croatia"
  },
  {
    id: "r32-13",
    homeTeam: "Australia",
    awayTeam: "Egypt"
  },
  {
    id: "r32-14",
    homeTeam: "Argentina",
    awayTeam: "Cape Verde"
  },
  {
    id: "r32-15",
    homeTeam: "Switzerland",
    awayTeam: "Algeria"
  },
  {
    id: "r32-16",
    homeTeam: "Colombia",
    awayTeam: "Ghana"
  }
];

export function normaliseTeamName(teamName: string) {
  return teamName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function getTeamFlag(teamName: string) {
  const normalised = normaliseTeamName(teamName);

  const ENGLAND_FLAG = "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}";
  const SCOTLAND_FLAG = "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}";

  const flags: Record<string, string> = {
    southafrica: "🇿🇦",
    canada: "🇨🇦",
    netherlands: "🇳🇱",
    morocco: "🇲🇦",
    germany: "🇩🇪",
    paraguay: "🇵🇾",
    france: "🇫🇷",
    sweden: "🇸🇪",
    brazil: "🇧🇷",
    japan: "🇯🇵",
    ivorycoast: "🇨🇮",
    cotedivoire: "🇨🇮",
    norway: "🇳🇴",
    mexico: "🇲🇽",
    ecuador: "🇪🇨",
    england: ENGLAND_FLAG,
    congodr: "🇨🇩",
    drcongo: "🇨🇩",
    democraticrepublicofcongo: "🇨🇩",
    belgium: "🇧🇪",
    senegal: "🇸🇳",
    unitedstates: "🇺🇸",
    usa: "🇺🇸",
    us: "🇺🇸",
    bosniaandherzegovina: "🇧🇦",
    bosniaherzegovina: "🇧🇦",
    bosniaherz: "🇧🇦",
    spain: "🇪🇸",
    austria: "🇦🇹",
    portugal: "🇵🇹",
    croatia: "🇭🇷",
    australia: "🇦🇺",
    egypt: "🇪🇬",
    argentina: "🇦🇷",
    capeverde: "🇨🇻",
    switzerland: "🇨🇭",
    algeria: "🇩🇿",
    colombia: "🇨🇴",
    ghana: "🇬🇭",
    scotland: SCOTLAND_FLAG
  };

  return flags[normalised] ?? "";
}

export function teamWithFlag(teamName: string) {
  const flag = getTeamFlag(teamName);

  return flag
    ? `${flag} ${teamName}`
    : teamName;
}

export function hasKnockoutStarted() {
  return Date.now() >= new Date(FIRST_KNOCKOUT_KICKOFF_UTC).getTime();
}

export function getWinnersFromRounds(
  rounds: KnockoutRoundsLike,
  roundId: RoundId
): string[] {
  if (!rounds) {
    return [];
  }

  if (rounds instanceof Map) {
    return rounds.get(roundId) ?? [];
  }

  return rounds[roundId] ?? [];
}

export function getRoundWinnersObject(rounds: KnockoutRoundsLike): KnockoutRounds {
  const result: KnockoutRounds = {};

  for (const roundId of ROUND_ORDER) {
    result[roundId] = getWinnersFromRounds(rounds, roundId);
  }

  return result;
}

export function getPreviousRoundId(roundId: RoundId): RoundId | null {
  const index = ROUND_ORDER.indexOf(roundId);

  if (index <= 0) {
    return null;
  }

  return ROUND_ORDER[index - 1];
}

function buildMatchesFromWinners(
  roundId: RoundId,
  winners: string[]
): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];

  for (let i = 0; i < winners.length; i += 2) {
    const homeTeam = winners[i];
    const awayTeam = winners[i + 1];

    if (!homeTeam || !awayTeam) {
      continue;
    }

    matches.push({
      id: `${roundId}-${matches.length + 1}`,
      homeTeam,
      awayTeam
    });
  }

  return matches;
}

export function getRoundMatches(
  roundId: RoundId,
  rounds: KnockoutRoundsLike
): KnockoutMatch[] {
  if (roundId === "r32") {
    return ROUND_OF_32_MATCHES;
  }

  const previousRoundId = getPreviousRoundId(roundId);

  if (!previousRoundId) {
    return [];
  }

  const previousMatches = getRoundMatches(previousRoundId, rounds);
  const previousWinners = getWinnersFromRounds(rounds, previousRoundId);

  if (previousWinners.length !== previousMatches.length) {
    return [];
  }

  return buildMatchesFromWinners(roundId, previousWinners);
}

export function getCurrentPredictionStep(rounds: KnockoutRoundsLike) {
  for (const roundId of ROUND_ORDER) {
    const matches = getRoundMatches(roundId, rounds);

    if (matches.length === 0) {
      return null;
    }

    const winners = getWinnersFromRounds(rounds, roundId);

    if (winners.length < matches.length) {
      return {
        roundId,
        matchIndex: winners.length,
        match: matches[winners.length],
        matches
      };
    }
  }

  return null;
}

export function countKnockoutPicks(rounds: KnockoutRoundsLike) {
  return ROUND_ORDER.reduce((total, roundId) => {
    const matches = getRoundMatches(roundId, rounds);
    const winners = getWinnersFromRounds(rounds, roundId);

    return total + Math.min(winners.length, matches.length);
  }, 0);
}

export function isKnockoutComplete(rounds: KnockoutRoundsLike) {
  return getWinnersFromRounds(rounds, "final").length === 1;
}

export function getChampion(rounds: KnockoutRoundsLike) {
  return getWinnersFromRounds(rounds, "final")[0] ?? null;
}