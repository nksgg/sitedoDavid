import { MatchFormat, MatchFormatId, Player, Position } from "@/types/soccer";

export const MATCH_FORMATS: Record<MatchFormatId, MatchFormat> = {
  "5x5": {
    id: "5x5",
    name: "Futsal / Society 5",
    shortName: "5x5",
    playersPerTeam: 5,
    totalStarters: 10,
    description:
      "1 Goleiro + 4 na linha por equipe (1 ZAG, 2 MEI, 1 ATA). Posições sorteadas na hora!",
    formationSlots: [
      "Goleiro",
      "Zagueiro",
      "Meio-campista",
      "Meio-campista",
      "Atacante",
    ],
    recommendedPositions: {
      Goleiro: 1,
      Zagueiro: 1,
      "Meio-campista": 2,
      Atacante: 1,
    },
  },
  "7x7": {
    id: "7x7",
    name: "Society 7",
    shortName: "7x7",
    playersPerTeam: 7,
    totalStarters: 14,
    description:
      "1 Goleiro + 6 na linha por equipe (2 ZAG, 2 MEI, 2 ATA). Posições sorteadas na hora!",
    formationSlots: [
      "Goleiro",
      "Zagueiro",
      "Zagueiro",
      "Meio-campista",
      "Meio-campista",
      "Atacante",
      "Atacante",
    ],
    recommendedPositions: {
      Goleiro: 1,
      Zagueiro: 2,
      "Meio-campista": 2,
      Atacante: 2,
    },
  },
  "11x11": {
    id: "11x11",
    name: "Futebol de Campo 11",
    shortName: "11x11",
    playersPerTeam: 11,
    totalStarters: 22,
    description:
      "1 Goleiro + 10 na linha por equipe (4 ZAG, 4 MEI, 2 ATA). Posições sorteadas na hora!",
    formationSlots: [
      "Goleiro",
      "Zagueiro",
      "Zagueiro",
      "Zagueiro",
      "Zagueiro",
      "Meio-campista",
      "Meio-campista",
      "Meio-campista",
      "Meio-campista",
      "Atacante",
      "Atacante",
    ],
    recommendedPositions: {
      Goleiro: 1,
      Zagueiro: 4,
      "Meio-campista": 4,
      Atacante: 2,
    },
  },
};

export const POSITION_ORDER: Record<Position, number> = {
  Goleiro: 1,
  Zagueiro: 2,
  "Meio-campista": 3,
  Atacante: 4,
};

export const POSITION_META: Record<
  Position,
  {
    label: string;
    shortLabel: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    darkBadgeBg: string;
    darkBadgeText: string;
    darkBadgeBorder: string;
    dotColor: string;
  }
> = {
  Goleiro: {
    label: "Goleiro",
    shortLabel: "GOL",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    darkBadgeBg: "dark:bg-amber-950/50",
    darkBadgeText: "dark:text-amber-300",
    darkBadgeBorder: "dark:border-amber-800/60",
    dotColor: "bg-amber-500",
  },
  Zagueiro: {
    label: "Zagueiro / Defensor",
    shortLabel: "ZAG",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-200",
    darkBadgeBg: "dark:bg-sky-950/50",
    darkBadgeText: "dark:text-sky-300",
    darkBadgeBorder: "dark:border-sky-800/60",
    dotColor: "bg-sky-500",
  },
  "Meio-campista": {
    label: "Meio-campista",
    shortLabel: "MEI",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    darkBadgeBg: "dark:bg-emerald-950/50",
    darkBadgeText: "dark:text-emerald-300",
    darkBadgeBorder: "dark:border-emerald-800/60",
    dotColor: "bg-emerald-500",
  },
  Atacante: {
    label: "Atacante",
    shortLabel: "ATA",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
    darkBadgeBg: "dark:bg-rose-950/50",
    darkBadgeText: "dark:text-rose-300",
    darkBadgeBorder: "dark:border-rose-800/60",
    dotColor: "bg-rose-500",
  },
};

/**
 * Jogadores cadastrados inicialmente SEM posição pré-definida.
 * A posição onde cada um vai jogar é definida no momento do sorteio/escalação!
 */
export const INITIAL_PLAYERS: Player[] = [
  { id: "p-1", name: "Carlos Eduardo (Cadu)", status: "available", skillLevel: 5 },
  { id: "p-2", name: "Marcos Vinícius", status: "available", skillLevel: 4 },
  { id: "p-3", name: "Rafael Rocha", status: "unavailable", skillLevel: 4 },
  { id: "p-4", name: "Thiago Silva", status: "available", skillLevel: 5 },
  { id: "p-5", name: "Bruno Henrique", status: "available", skillLevel: 4 },
  { id: "p-6", name: "Leonardo Ortiz", status: "available", skillLevel: 4 },
  { id: "p-7", name: "Gustavo Gómez", status: "available", skillLevel: 5 },
  { id: "p-8", name: "Rodrigo Caio", status: "unavailable", skillLevel: 3 },
  { id: "p-9", name: "Danilo Avelar", status: "available", skillLevel: 3 },
  { id: "p-10", name: "Lucas Paquetá", status: "available", skillLevel: 5 },
  { id: "p-11", name: "Matheus Pereira", status: "available", skillLevel: 5 },
  { id: "p-12", name: "André Trindade", status: "available", skillLevel: 4 },
  { id: "p-13", name: "Gabriel Menino", status: "available", skillLevel: 4 },
  { id: "p-14", name: "Jean Lucas", status: "available", skillLevel: 3 },
  { id: "p-15", name: "Felipe Melo", status: "unavailable", skillLevel: 3 },
  { id: "p-16", name: "Everton Ribeiro", status: "available", skillLevel: 5 },
  { id: "p-17", name: "Pedro Guilherme", status: "available", skillLevel: 5 },
  { id: "p-18", name: "Hulk Paraíba", status: "available", skillLevel: 5 },
  { id: "p-19", name: "Paulinho", status: "available", skillLevel: 4 },
  { id: "p-20", name: "Ferreirinha", status: "available", skillLevel: 4 },
  { id: "p-21", name: "Yuri Alberto", status: "available", skillLevel: 3 },
  { id: "p-22", name: "Calleri", status: "unavailable", skillLevel: 4 },
];
