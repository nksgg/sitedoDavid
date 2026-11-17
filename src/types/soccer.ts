export type Position = "Goleiro" | "Zagueiro" | "Meio-campista" | "Atacante";

export type PlayerStatus = "available" | "unavailable";

export interface Player {
  id: string;
  name: string;
  status: PlayerStatus;
  skillLevel: number; // 1 to 5 stars
  /**
   * Posição atribuída ao jogador SOMENTE quando escalado/sorteado no time
   */
  assignedPosition?: Position;
}

export type MatchFormatId = "5x5" | "7x7" | "11x11";

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

export type ActiveTab = "roster" | "builder" | "matchup";

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
