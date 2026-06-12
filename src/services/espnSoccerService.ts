type EspnAthlete = {
  displayName?: string;
};

type EspnDetail = {
  type?: {
    text?: string;
    displayName?: string;
    name?: string;
  };
  clock?: {
    displayValue?: string;
  };
  team?: {
    id?: string;
  };
  scoringPlay?: boolean;
  ownGoal?: boolean;
  penaltyKick?: boolean;
  athletesInvolved?: EspnAthlete[];
};

type EspnCompetitor = {
  homeAway: "home" | "away";
  score: string;
  team: {
    id: string;
    displayName: string;
    shortDisplayName?: string;
    abbreviation?: string;
  };
};

type EspnCompetition = {
  status: {
    displayClock?: string;
    type: {
      name: string;
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
  competitors: EspnCompetitor[];
  details?: EspnDetail[];
};

type EspnEvent = {
  id: string;
  name: string;
  shortName: string;
  date: string;
  competitions: EspnCompetition[];
};

type EspnScoreboardResponse = {
  events?: EspnEvent[];
};

export type ParsedEspnGoal = {
  minute: string;
  scorer: string;
  teamName: string;
  type: string;
  ownGoal: boolean;
  penalty: boolean;
};

export type ParsedEspnCard = {
  minute: string;
  player: string;
  teamName: string;
  type: string;
};

export type ParsedEspnMatch = {
  espnId: string;
  name: string;
  shortName: string;
  kickoffUtc: string;
  status: string;
  statusState: string;
  completed: boolean;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  goals: ParsedEspnGoal[];
  redCards: ParsedEspnCard[];
};

function getTeamNameById(competition: EspnCompetition, teamId?: string) {
  if (!teamId) return "Unknown team";

  const competitor = competition.competitors.find(item => {
    return item.team.id === teamId;
  });

  return competitor?.team.shortDisplayName ??
    competitor?.team.displayName ??
    "Unknown team";
}

function getDetailTypeText(detail: EspnDetail) {
  return detail.type?.text ??
    detail.type?.displayName ??
    detail.type?.name ??
    "";
}

function parseGoals(competition: EspnCompetition): ParsedEspnGoal[] {
  const details = competition.details ?? [];

  return details
    .filter(detail => detail.scoringPlay)
    .map(detail => {
      return {
        minute: detail.clock?.displayValue ?? "?",
        scorer: detail.athletesInvolved?.[0]?.displayName ?? "Unknown scorer",
        teamName: getTeamNameById(competition, detail.team?.id),
        type: getDetailTypeText(detail) || "Goal",
        ownGoal: Boolean(detail.ownGoal),
        penalty: Boolean(detail.penaltyKick)
      };
    });
}

function isRedCardDetail(detail: EspnDetail) {
  const typeText = getDetailTypeText(detail)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return (
    typeText.includes("redcard") ||
    typeText.includes("secondyellow") ||
    typeText.includes("2ndyellow")
  );
}

function parseRedCards(competition: EspnCompetition): ParsedEspnCard[] {
  const details = competition.details ?? [];

  return details
    .filter(isRedCardDetail)
    .map(detail => {
      return {
        minute: detail.clock?.displayValue ?? "?",
        player: detail.athletesInvolved?.[0]?.displayName ?? "Unknown player",
        teamName: getTeamNameById(competition, detail.team?.id),
        type: getDetailTypeText(detail) || "Red Card"
      };
    });
}

function parseMatch(event: EspnEvent): ParsedEspnMatch | null {
  const competition = event.competitions[0];

  if (!competition) {
    return null;
  }

  const home = competition.competitors.find(team => {
    return team.homeAway === "home";
  });

  const away = competition.competitors.find(team => {
    return team.homeAway === "away";
  });

  if (!home || !away) {
    return null;
  }

  return {
    espnId: event.id,
    name: event.name,
    shortName: event.shortName,
    kickoffUtc: event.date,
    status: competition.status.type.shortDetail,
    statusState: competition.status.type.state,
    completed: competition.status.type.completed,
    homeTeam: home.team.shortDisplayName ?? home.team.displayName,
    awayTeam: away.team.shortDisplayName ?? away.team.displayName,
    homeScore: Number(home.score),
    awayScore: Number(away.score),
    goals: parseGoals(competition),
    redCards: parseRedCards(competition)
  };
}

export async function fetchEspnScoreboard({
  league = "fifa.world",
  date
}: {
  league?: string;
  date?: string;
}) {
  const url = new URL(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`
  );

  if (date) {
    url.searchParams.set("dates", date);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as EspnScoreboardResponse;

  return (data.events ?? [])
    .map(parseMatch)
    .filter((match): match is ParsedEspnMatch => Boolean(match));
}