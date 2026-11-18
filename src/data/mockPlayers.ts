import { MatchFormat, MatchFormatId, Player, Position } from "@/types/soccer";

function buildMatchFormat(
  playersPerTeam: number,
  name: string,
  description: string,
  recommendedPositions: Record<Position, number>
): MatchFormat {
  const id = `${playersPerTeam}x${playersPerTeam}` as MatchFormatId;
  const formationSlots: Position[] = [
    ...Array(recommendedPositions.Goleiro).fill("Goleiro"),
    ...Array(recommendedPositions.Zagueiro).fill("Zagueiro"),
    ...Array(recommendedPositions["Meio-campista"]).fill("Meio-campista"),
    ...Array(recommendedPositions.Atacante).fill("Atacante"),
  ];

  return {
    id,
    name,
    shortName: id,
    playersPerTeam,
    totalStarters: playersPerTeam * 2,
    description,
    formationSlots,
    recommendedPositions,
  };
}

export const MATCH_FORMATS: Record<MatchFormatId, MatchFormat> = {
  "1x1": buildMatchFormat(
    1,
    "X1 / Duelo",
    "1 jogador na linha por equipe (1 ATA). Duelo direto!",
    { Goleiro: 0, Zagueiro: 0, "Meio-campista": 0, Atacante: 1 }
  ),
  "2x2": buildMatchFormat(
    2,
    "Dupla",
    "2 jogadores na linha por equipe (1 ZAG, 1 ATA). Posições sorteadas na hora!",
    { Goleiro: 0, Zagueiro: 1, "Meio-campista": 0, Atacante: 1 }
  ),
  "3x3": buildMatchFormat(
    3,
    "Trio",
    "1 Goleiro + 2 na linha por equipe (1 ZAG, 1 ATA). Posições sorteadas na hora!",
    { Goleiro: 1, Zagueiro: 1, "Meio-campista": 0, Atacante: 1 }
  ),
  "4x4": buildMatchFormat(
    4,
    "Quadra / Society 4",
    "1 Goleiro + 3 na linha por equipe (1 ZAG, 1 MEI, 1 ATA). Posições sorteadas na hora!",
    { Goleiro: 1, Zagueiro: 1, "Meio-campista": 1, Atacante: 1 }
  ),
  "5x5": buildMatchFormat(
    5,
    "Futsal / Society 5",
    "1 Goleiro + 4 na linha por equipe (1 ZAG, 2 MEI, 1 ATA). Posições sorteadas na hora!",
    { Goleiro: 1, Zagueiro: 1, "Meio-campista": 2, Atacante: 1 }
  ),
  "6x6": buildMatchFormat(
    6,
    "Society 6",
    "1 Goleiro + 5 na linha por equipe (2 ZAG, 2 MEI, 1 ATA). Posições sorteadas na hora!",
    { Goleiro: 1, Zagueiro: 2, "Meio-campista": 2, Atacante: 1 }
  ),
  "7x7": buildMatchFormat(
    7,
    "Society 7",
    "1 Goleiro + 6 na linha por equipe (2 ZAG, 2 MEI, 2 ATA). Posições sorteadas na hora!",
    { Goleiro: 1, Zagueiro: 2, "Meio-campista": 2, Atacante: 2 }
  ),
  "8x8": buildMatchFormat(
    8,
    "Society 8",
    "1 Goleiro + 7 na linha por equipe (3 ZAG, 2 MEI, 2 ATA). Posições sorteadas na hora!",
    { Goleiro: 1, Zagueiro: 3, "Meio-campista": 2, Atacante: 2 }
  ),
  "9x9": buildMatchFormat(
    9,
    "Futebol 9",
    "1 Goleiro + 8 na linha por equipe (3 ZAG, 3 MEI, 2 ATA). Posições sorteadas na hora!",
    { Goleiro: 1, Zagueiro: 3, "Meio-campista": 3, Atacante: 2 }
  ),
  "10x10": buildMatchFormat(
    10,
    "Futebol 10",
    "1 Goleiro + 9 na linha por equipe (3 ZAG, 4 MEI, 2 ATA). Posições sorteadas na hora!",
    { Goleiro: 1, Zagueiro: 3, "Meio-campista": 4, Atacante: 2 }
  ),
  "11x11": buildMatchFormat(
    11,
    "Partida Tradicional",
    "1 Goleiro + 10 na linha por equipe (4 ZAG, 4 MEI, 2 ATA). Partida tradicional!",
    { Goleiro: 1, Zagueiro: 4, "Meio-campista": 4, Atacante: 2 }
  ),
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
