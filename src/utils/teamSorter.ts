import {
  MATCH_FORMATS,
  POSITION_META,
  POSITION_ORDER,
} from "@/data/mockPlayers";
import {
  MatchFormatId,
  MatchRecord,
  Player,
  PlayerCareerStats,
  PlayerMatchStats,
  Position,
  SortedTeamsResult,
  TeamConfig,
} from "@/types/soccer";

const ALL_POSITIONS: Position[] = [
  "Goleiro",
  "Zagueiro",
  "Meio-campista",
  "Atacante",
];

/**
 * Embaralha um array usando o algoritmo Fisher-Yates
 */
export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Ordena os jogadores pela posição sorteada/escalada (GOL -> ZAG -> MEI -> ATA) e depois por nome
 */
export function sortPlayersByPosition(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const posA = a.assignedPosition ? POSITION_ORDER[a.assignedPosition] : 99;
    const posB = b.assignedPosition ? POSITION_ORDER[b.assignedPosition] : 99;
    if (posA !== posB) return posA - posB;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

/**
 * Descobre qual é a próxima vaga tática livre em um time (ex: primeiro Goleiro, depois Zagueiro, Meia, Atacante)
 */
export function getNextTacticalPosition(
  currentTeam: Player[],
  formatId: MatchFormatId,
  balanceGoalkeepers = true
): Position {
  const format = MATCH_FORMATS[formatId];
  const currentCounts: Record<Position, number> = {
    Goleiro: 0,
    Zagueiro: 0,
    "Meio-campista": 0,
    Atacante: 0,
  };

  for (const p of currentTeam) {
    if (p.assignedPosition) {
      currentCounts[p.assignedPosition] += 1;
    }
  }

  // Se a trava de goleiro estiver ativa, o formato tiver goleiro e o time ainda não tiver goleiro, o 1º a entrar vira Goleiro
  if (
    balanceGoalkeepers &&
    format.recommendedPositions.Goleiro > 0 &&
    currentCounts.Goleiro === 0
  ) {
    return "Goleiro";
  }

  // Procura na formação recomendada a primeira posição que ainda não atingiu a cota
  for (const pos of ALL_POSITIONS) {
    const recommended = format.recommendedPositions[pos];
    if (currentCounts[pos] < recommended) {
      return pos;
    }
  }

  // Fallback caso o time tenha mais jogadores que o padrão
  const fieldPositions: Position[] = ["Zagueiro", "Meio-campista", "Atacante"];
  return fieldPositions[currentTeam.length % fieldPositions.length];
}

/**
 * Atribui posições táticas sorteadas aos jogadores de um time já separado
 */
export function assignPositionsToTeam(
  teamPlayers: Player[],
  formatId: MatchFormatId,
  balanceGoalkeepers: boolean
): Player[] {
  if (teamPlayers.length === 0) return [];

  const format = MATCH_FORMATS[formatId];
  const shuffledTeam = shuffleArray(teamPlayers);

  // Monta a lista de posições para o tamanho atual do time
  const slots: Position[] = [];
  for (let i = 0; i < shuffledTeam.length; i++) {
    if (i < format.formationSlots.length) {
      slots.push(format.formationSlots[i]);
    } else {
      const extras: Position[] = ["Zagueiro", "Meio-campista", "Atacante"];
      slots.push(extras[i % extras.length]);
    }
  }

  // Se NÃO quiser forçar a formação padrão com 1 Goleiro garantido, sorteia posições livres
  if (!balanceGoalkeepers) {
    return sortPlayersByPosition(
      shuffledTeam.map((p) => ({
        ...p,
        assignedPosition:
          ALL_POSITIONS[Math.floor(Math.random() * ALL_POSITIONS.length)],
      }))
    );
  }

  // Com equilíbrio de goleiro e formação tática:
  // O jogador sorteado no índice 0 assume o Goleiro, e os demais assumem ZAG, MEI e ATA
  const assigned = shuffledTeam.map((player, index) => ({
    ...player,
    assignedPosition: slots[index] || "Meio-campista",
  }));

  return sortPlayersByPosition(assigned);
}

/**
 * Realiza o sorteio dos times e DEFINE A POSIÇÃO onde cada jogador vai atuar na hora do sorteio!
 */
export function generateBalancedTeams(
  availablePlayers: Player[],
  config: TeamConfig
): SortedTeamsResult {
  const format = MATCH_FORMATS[config.format];
  const limitPerTeam = format.playersPerTeam;
  const warnings: string[] = [];

  if (availablePlayers.length < format.totalStarters) {
    warnings.push(
      `Jogadores disponíveis (${availablePlayers.length}) abaixo do ideal para ${format.shortName} (${format.totalStarters} titulares). Os times e posições foram sorteados com os atletas presentes.`
    );
  }

  if (availablePlayers.length < 2 && config.balanceGoalkeepers) {
    warnings.push(
      "Menos de 2 jogadores disponíveis: não foi possível escalar 1 goleiro para cada lado."
    );
  }

  // Limpa posições anteriores antes de novo sorteio
  const cleanPool = shuffleArray(
    availablePlayers.map((p) => ({ ...p, assignedPosition: undefined }))
  );

  // Se o equilíbrio técnico estiver ativo, ordena por estrelas (embaralhado dentro de cada faixa) para Snake Draft justo
  const orderedPool = config.balancePositions
    ? [...cleanPool].sort((a, b) => (b.skillLevel || 3) - (a.skillLevel || 3))
    : cleanPool;

  const rawTeamA: Player[] = [];
  const rawTeamB: Player[] = [];
  const reserves: Player[] = [];

  // Distribuição Snake Draft entre Time A e Time B
  let giveToA = true;
  for (const player of orderedPool) {
    const aFull = rawTeamA.length >= limitPerTeam;
    const bFull = rawTeamB.length >= limitPerTeam;

    if (aFull && bFull) {
      reserves.push({ ...player, assignedPosition: undefined });
      continue;
    }

    if (aFull) {
      rawTeamB.push(player);
      continue;
    }

    if (bFull) {
      rawTeamA.push(player);
      continue;
    }

    if (rawTeamA.length < rawTeamB.length) {
      rawTeamA.push(player);
    } else if (rawTeamB.length < rawTeamA.length) {
      rawTeamB.push(player);
    } else {
      if (giveToA) {
        rawTeamA.push(player);
      } else {
        rawTeamB.push(player);
      }
      giveToA = !giveToA;
    }
  }

  // Agora sorteia/define ONDE CADA UM VAI JOGAR dentro do Time A e do Time B!
  const teamA = assignPositionsToTeam(
    rawTeamA,
    config.format,
    config.balanceGoalkeepers
  );
  const teamB = assignPositionsToTeam(
    rawTeamB,
    config.format,
    config.balanceGoalkeepers
  );

  return {
    teamA,
    teamB,
    reserves,
    warnings,
    lastSortedAt: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/**
 * Formata a escalação completa para envio rápido no WhatsApp
 */
export function formatWhatsAppLineup(
  teamA: Player[],
  teamB: Player[],
  reserves: Player[],
  config: TeamConfig
): string {
  const format = MATCH_FORMATS[config.format];
  const dateStr = new Date().toLocaleDateString("pt-BR");

  const formatPlayerLine = (p: Player, idx: number, isReserve = false) => {
    if (isReserve || !p.assignedPosition) {
      return `${idx + 1}. 🏃 *${p.name}* _(Reserva)_`;
    }
    const meta = POSITION_META[p.assignedPosition];
    const icon = p.assignedPosition === "Goleiro" ? "🧤" : "🏃";
    return `${idx + 1}. ${icon} *${p.name}* — _${p.assignedPosition} (${meta.shortLabel})_`;
  };

  const sortedA = sortPlayersByPosition(teamA);
  const sortedB = sortPlayersByPosition(teamB);

  const lines: string[] = [
    `⚽🔥 *CONFRONTO E POSIÇÕES SORTEADAS - RACHA ${format.shortName}* 🔥⚽`,
    `📅 Data: ${dateStr} | Formato: ${format.name}`,
    ``,
    `🟠 *${config.teamAName.toUpperCase()} (${sortedA.length}/${format.playersPerTeam})*`,
    ...(sortedA.length > 0
      ? sortedA.map((p, i) => formatPlayerLine(p, i))
      : ["_Nenhum jogador escalado_"]),
    ``,
    `⚫ *${config.teamBName.toUpperCase()} (${sortedB.length}/${format.playersPerTeam})*`,
    ...(sortedB.length > 0
      ? sortedB.map((p, i) => formatPlayerLine(p, i))
      : ["_Nenhum jogador escalado_"]),
  ];

  if (reserves.length > 0) {
    lines.push(
      ``,
      `🔄 *RESERVAS / PRÓXIMOS (${reserves.length})*`,
      ...reserves.map((p, i) => formatPlayerLine(p, i, true))
    );
  }

  lines.push(``, `⚡ _Gerado pelo FutebolSorter_`);
  return lines.join("\n");
}

/**
 * Calcula estatísticas resumidas das posições atribuídas no time
 */
export function getTeamStats(players: Player[]) {
  const counts: Record<Position, number> = {
    Goleiro: 0,
    Zagueiro: 0,
    "Meio-campista": 0,
    Atacante: 0,
  };

  let totalSkill = 0;
  for (const p of players) {
    if (p.assignedPosition) {
      counts[p.assignedPosition] += 1;
    }
    totalSkill += p.skillLevel;
  }

  const avgSkill =
    players.length > 0 ? (totalSkill / players.length).toFixed(1) : "0.0";

  return {
    counts,
    hasGoalkeeper: counts.Goleiro > 0,
    avgSkill,
    totalPlayers: players.length,
  };
}

export function getEmptyCareerStats(): PlayerCareerStats {
  return {
    matches: 0,
    goals: 0,
    assists: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
    mvps: 0,
  };
}

export function getEmptyPlayerMatchStats(
  player: Player,
  team: "teamA" | "teamB" | "reserve"
): PlayerMatchStats {
  return {
    playerId: player.id,
    playerName: player.name,
    team,
    position: player.assignedPosition,
    goals: 0,
    assists: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
  };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Formata a súmula final da partida (placar, gols, assistências, faltas, cartões e MVP) para WhatsApp
 */
export function formatWhatsAppMatchSummary(
  record: Omit<MatchRecord, "id" | "date"> & { date?: string }
): string {
  const format = MATCH_FORMATS[record.format];
  const dateObj = record.date ? new Date(record.date) : new Date();
  const dateStr = dateObj.toLocaleDateString("pt-BR");

  const winnerLine =
    record.scoreA > record.scoreB
      ? `🏆 Vitória de *${record.teamAName}*!`
      : record.scoreB > record.scoreA
      ? `🏆 Vitória de *${record.teamBName}*!`
      : `🤝 *Empate equilibrado!*`;

  const lines: string[] = [
    `⚽📊 *SÚMULA FINAL - RACHA ${format.shortName}* 📊⚽`,
    `📅 ${dateStr}${
      record.durationSeconds && record.durationSeconds > 0
        ? ` • ⏱️ ${formatDuration(record.durationSeconds)}`
        : ""
    }`,
    ``,
    `🟠 *${record.teamAName}*  ${record.scoreA} x ${record.scoreB}  *${record.teamBName}* ⚫`,
    winnerLine,
  ];

  const scorersA = record.playerStats
    .filter((p) => p.team === "teamA" && p.goals > 0)
    .sort((a, b) => b.goals - a.goals);
  const scorersB = record.playerStats
    .filter((p) => p.team === "teamB" && p.goals > 0)
    .sort((a, b) => b.goals - a.goals);

  if (scorersA.length > 0 || scorersB.length > 0) {
    lines.push(``, `⚽ *GOLS DA PARTIDA*`);
    if (scorersA.length > 0) {
      lines.push(
        `🟠 _${record.teamAName}_: ${scorersA
          .map((p) => `${p.playerName} (${p.goals})`)
          .join(", ")}`
      );
    }
    if (scorersB.length > 0) {
      lines.push(
        `⚫ _${record.teamBName}_: ${scorersB
          .map((p) => `${p.playerName} (${p.goals})`)
          .join(", ")}`
      );
    }
  }

  const assists = record.playerStats
    .filter((p) => p.assists > 0)
    .sort((a, b) => b.assists - a.assists);
  if (assists.length > 0) {
    lines.push(
      ``,
      `🎯 *ASSISTÊNCIAS*`,
      ...assists.map((p) => `• ${p.playerName} (${p.assists})`)
    );
  }

  const saves = record.playerStats
    .filter((p) => p.saves > 0)
    .sort((a, b) => b.saves - a.saves);
  if (saves.length > 0) {
    lines.push(
      ``,
      `🧤 *DEFESAS DIFÍCEIS*`,
      ...saves.map((p) => `• ${p.playerName} (${p.saves})`)
    );
  }

  const foulsAndCards = record.playerStats
    .filter((p) => p.fouls > 0 || p.yellowCards > 0 || p.redCards > 0)
    .sort(
      (a, b) =>
        b.redCards * 5 +
        b.yellowCards * 2 +
        b.fouls -
        (a.redCards * 5 + a.yellowCards * 2 + a.fouls)
    );

  if (foulsAndCards.length > 0) {
    lines.push(``, `🟨 *FALTAS & CARTÕES*`);
    for (const p of foulsAndCards) {
      const parts: string[] = [];
      if (p.fouls > 0) parts.push(`${p.fouls} falta${p.fouls > 1 ? "s" : ""}`);
      if (p.yellowCards > 0) parts.push(`🟨 ${p.yellowCards}`);
      if (p.redCards > 0) parts.push(`🟥 ${p.redCards}`);
      lines.push(`• ${p.playerName}: ${parts.join(" • ")}`);
    }
  }

  if (record.mvpPlayerName) {
    lines.push(``, `⭐ *CRAQUE DO JOGO (MVP):* ${record.mvpPlayerName}`);
  }

  if (record.notes && record.notes.trim()) {
    lines.push(``, `📝 _Obs: ${record.notes.trim()}_`);
  }

  lines.push(``, `⚡ _Súmula gerada pelo FutebolSorter_`);
  return lines.join("\n");
}
