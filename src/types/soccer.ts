export type Position = "Goleiro" | "Zagueiro" | "Meio-campista" | "Atacante";

export type PlayerStatus = "available" | "unavailable";

export interface PlayerCareerStats {
  matches: number;
  goals: number;
  assists: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  mvps: number;
}

export interface Player {
  id: string;
  name: string;
  status: PlayerStatus;
  skillLevel: number; // 1 to 5 stars
  /**
   * Posição atribuída ao jogador SOMENTE quando escalado/sorteado no time
   */
  assignedPosition?: Position;
  /**
   * Estatísticas acumuladas do jogador no racha
   */
  stats?: PlayerCareerStats;
}

export type MatchFormatId =
  | "1x1"
  | "2x2"
  | "3x3"
  | "4x4"
  | "5x5"
  | "6x6"
  | "7x7"
  | "8x8"
  | "9x9"
  | "10x10"
  | "11x11";

export interface MatchFormat {
  id: MatchFormatId;
  name: string;
  shortName: string;
  playersPerTeam: number;
  totalStarters: number;
  description: string;
  formationSlots: Position[];
  recommendedPositions: Record<Position, number>;
}

export type BuilderMode = "auto" | "manual";

export type ActiveTab = "roster" | "builder" | "matchup" | "stats";

export interface TeamConfig {
  format: MatchFormatId;
  balanceGoalkeepers: boolean;
  balancePositions: boolean;
  teamAName: string;
  teamBName: string;
}

export interface SortedTeamsResult {
  teamA: Player[];
  teamB: Player[];
  reserves: Player[];
  warnings: string[];
  lastSortedAt: string | null;
}

export interface PlayerMatchStats {
  playerId: string;
  playerName: string;
  team: "teamA" | "teamB" | "reserve";
  position?: Position;
  goals: number;
  assists: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  saves: number;
}

export interface MatchRecord {
  id: string;
  date: string; // ISO string
  format: MatchFormatId;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  durationSeconds?: number;
  mvpPlayerId?: string;
  mvpPlayerName?: string;
  notes?: string;
  playerStats: PlayerMatchStats[];
}
