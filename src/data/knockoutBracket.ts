export type RoundId = "r32" | "r16" | "qf" | "sf" | "third" | "final";

export type KnockoutMatch = {
  id: string;
  matchNumber?: number;
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
  "third",
  "final"
];

export const ROUND_LABELS: Record<RoundId, string> = {
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-finals",
  sf: "Semi-finals",
  third: "Third-place playoff",
  final: "Final"
};

export const ROUND_POINTS: Record<RoundId, number> = {
  r32: 10,
  r16: 20,
  qf: 30,
  sf: 40,
  third: 50,
  final: 50
};

export const TOTAL_KNOCKOUT_PICKS = 32;

export const FIRST_KNOCKOUT_KICKOFF_UTC = "2026-06-28T19:00:00Z";

export const ROUND_OF_32_MATCHES: KnockoutMatch[] = [
  {
    id: "match-73",
    matchNumber: 73,
    homeTeam: "South Africa",
    awayTeam: "Canada"
  },
  {
    id: "match-75",
    matchNumber: 75,
    homeTeam: "Netherlands",
    awayTeam: "Morocco"
  },
  {
    id: "match-74",
    matchNumber: 74,
    homeTeam: "Germany",
    awayTeam: "Paraguay"
  },
  {
    id: "match-77",
    matchNumber: 77,
    homeTeam: "France",
    awayTeam: "Sweden"
  },
  {
    id: "match-83",
    matchNumber: 83,
    homeTeam: "Portugal",
    awayTeam: "Croatia"
  },
  {
    id: "match-84",
    matchNumber: 84,
    homeTeam: "Spain",
    awayTeam: "Austria"
  },
  {
    id: "match-81",
    matchNumber: 81,
    homeTeam: "United States",
    awayTeam: "Bosnia and Herzegovina"
  },
  {
    id: "match-82",
    matchNumber: 82,
    homeTeam: "Belgium",
    awayTeam: "Senegal"
  },
  {
    id: "match-76",
    matchNumber: 76,
    homeTeam: "Brazil",
    awayTeam: "Japan"
  },
  {
    id: "match-78",
    matchNumber: 78,
    homeTeam: "Ivory Coast",
    awayTeam: "Norway"
  },
  {
    id: "match-79",
    matchNumber: 79,
    homeTeam: "Mexico",
    awayTeam: "Ecuador"
  },
  {
    id: "match-80",
    matchNumber: 80,
    homeTeam: "England",
    awayTeam: "DR Congo"
  },
  {
    id: "match-86",
    matchNumber: 86,
    homeTeam: "Argentina",
    awayTeam: "Cape Verde"
  },
  {
    id: "match-88",
    matchNumber: 88,
    homeTeam: "Australia",
    awayTeam: "Egypt"
  },
  {
    id: "match-85",
    matchNumber: 85,
    homeTeam: "Switzerland",
    awayTeam: "Algeria"
  },
  {
    id: "match-87",
    matchNumber: 87,
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
  if (roundId === "third" || roundId === "final") {
    return "sf";
  }

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

function getLosersFromRound(
  rounds: KnockoutRoundsLike,
  roundId: RoundId
): string[] {
  const matches = getRoundMatches(roundId, rounds);
  const winners = getWinnersFromRounds(rounds, roundId);

  if (matches.length === 0 || winners.length !== matches.length) {
    return [];
  }

  return matches
    .map((match, index) => {
      const winner = winners[index];

      if (winner === match.homeTeam) {
        return match.awayTeam;
      }

      if (winner === match.awayTeam) {
        return match.homeTeam;
      }

      return null;
    })
    .filter((team): team is string => Boolean(team));
}

export function getRoundMatches(
  roundId: RoundId,
  rounds: KnockoutRoundsLike
): KnockoutMatch[] {
  if (roundId === "r32") {
    return ROUND_OF_32_MATCHES;
  }

  if (roundId === "third") {
    const semiFinalLosers = getLosersFromRound(rounds, "sf");

    if (semiFinalLosers.length !== 2) {
      return [];
    }

    return [
      {
        id: "match-103",
        matchNumber: 103,
        homeTeam: semiFinalLosers[0],
        awayTeam: semiFinalLosers[1]
      }
    ];
  }

  if (roundId === "final") {
    const semiFinalWinners = getWinnersFromRounds(rounds, "sf");

    if (semiFinalWinners.length !== 2) {
      return [];
    }

    return [
      {
        id: "match-104",
        matchNumber: 104,
        homeTeam: semiFinalWinners[0],
        awayTeam: semiFinalWinners[1]
      }
    ];
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
  return (
    getWinnersFromRounds(rounds, "third").length === 1 &&
    getWinnersFromRounds(rounds, "final").length === 1
  );
}

export function getChampion(rounds: KnockoutRoundsLike) {
  return getWinnersFromRounds(rounds, "final")[0] ?? null;
}

export function getThirdPlace(rounds: KnockoutRoundsLike) {
  return getWinnersFromRounds(rounds, "third")[0] ?? null;
}