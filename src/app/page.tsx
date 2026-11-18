"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ActiveTab,
  BuilderMode,
  MatchRecord,
  Player,
  PlayerMatchStats,
  Position,
  TeamConfig,
} from "@/types/soccer";
import { INITIAL_PLAYERS, MATCH_FORMATS } from "@/data/mockPlayers";
import {
  assignPositionsToTeam,
  generateBalancedTeams,
  getEmptyCareerStats,
  getEmptyPlayerMatchStats,
  getNextTacticalPosition,
  sortPlayersByPosition,
} from "@/utils/teamSorter";
import { Header } from "@/components/Header";
import { PlayerManagement } from "@/components/PlayerManagement";
import { MatchConfigBar } from "@/components/MatchConfigBar";
import { TeamBuilder } from "@/components/TeamBuilder";
import { MatchupView } from "@/components/MatchupView";
import { MatchStatsView } from "@/components/MatchStatsView";
import { PlayerModal } from "@/components/PlayerModal";

const STORAGE_KEY_PLAYERS = "futebolsorter_players_v2";
const STORAGE_KEY_THEME = "futebolsorter_dark_v1";
const STORAGE_KEY_HISTORY = "futebolsorter_history_v1";

export default function FutebolSorterApp() {
  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState<ActiveTab>("roster");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Players Database State (sem posição pré-definida!)
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);

  // Match Configuration State
  const [config, setConfig] = useState<TeamConfig>({
    format: "7x7",
    balanceGoalkeepers: true,
    balancePositions: true,
    teamAName: "Time Laranja",
    teamBName: "Time Preto",
  });

  // Builder Mode State
  const [builderMode, setBuilderMode] = useState<BuilderMode>("auto");

  // Drawn / Drafted Teams State
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [reserves, setReserves] = useState<Player[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [lastSortedAt, setLastSortedAt] = useState<string | null>(null);

  // Modal & Toast State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Match Sheet & History State
  const [currentStats, setCurrentStats] = useState<
    Record<string, PlayerMatchStats>
  >({});
  const [mvpPlayerId, setMvpPlayerId] = useState<string | null>(null);
  const [matchNotes, setMatchNotes] = useState("");
  const [matchFinished, setMatchFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const savedPlayers = localStorage.getItem(STORAGE_KEY_PLAYERS);
      if (savedPlayers) {
        const parsed = JSON.parse(savedPlayers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPlayers(parsed);
        }
      }
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme === "true") {
        setDarkMode(true);
      }
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setMatchHistory(parsedHistory);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Persist matchHistory
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(matchHistory));
    } catch {
      // Ignore storage errors
    }
  }, [matchHistory]);

  // Live Match Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Sync currentStats with formed teams (preserving existing counters)
  useEffect(() => {
    setCurrentStats((prev) => {
      const next: Record<string, PlayerMatchStats> = {};
      const syncGroup = (
        list: Player[],
        teamKey: "teamA" | "teamB" | "reserve"
      ) => {
        for (const p of list) {
          const existing = prev[p.id];
          if (existing) {
            next[p.id] = {
              ...existing,
              playerName: p.name,
              team: teamKey,
              position: p.assignedPosition,
            };
          } else {
            next[p.id] = getEmptyPlayerMatchStats(p, teamKey);
          }
        }
      };
      syncGroup(teamA, "teamA");
      syncGroup(teamB, "teamB");
      syncGroup(reserves, "reserve");
      return next;
    });
  }, [teamA, teamB, reserves]);

  // Persist players & dark mode
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
    } catch {
      // Ignore storage errors
    }
  }, [players]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, String(darkMode));
    } catch {
      // Ignore
    }
  }, [darkMode]);

  // Derived Available Players
  const availablePlayers = useMemo(
    () => players.filter((p) => p.status === "available"),
    [players]
  );

  // Sync drafted teams if a player becomes unavailable or is deleted
  useEffect(() => {
    const availableMap = new Map(availablePlayers.map((p) => [p.id, p]));
    setTeamA((prev) =>
      prev
        .filter((p) => availableMap.has(p.id))
        .map((p) => ({
          ...availableMap.get(p.id)!,
          assignedPosition: p.assignedPosition,
        }))
    );
    setTeamB((prev) =>
      prev
        .filter((p) => availableMap.has(p.id))
        .map((p) => ({
          ...availableMap.get(p.id)!,
          assignedPosition: p.assignedPosition,
        }))
    );
    setReserves((prev) =>
      prev
        .filter((p) => availableMap.has(p.id))
        .map((p) => ({
          ...availableMap.get(p.id)!,
          assignedPosition: undefined,
        }))
    );
  }, [availablePlayers]);

  // Player CRUD Handlers
  const handleToggleStatus = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === "available" ? "unavailable" : "available",
            }
          : p
      )
    );
  };

  const handleQuickAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      name,
      status: "available",
      skillLevel: 4,
    };
    setPlayers((prev) => [newPlayer, ...prev]);
    showToast(`✅ ${name} adicionado aos disponíveis!`);
  };

  const handleSaveModalPlayer = (
    playerData: Omit<Player, "id">,
    editingId?: string
  ) => {
    if (editingId) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...playerData } : p))
      );
      showToast(`✏️ Dados de ${playerData.name} atualizados!`);
    } else {
      const newPlayer: Player = {
        ...playerData,
        id: `p-${Date.now()}`,
      };
      setPlayers((prev) => [newPlayer, ...prev]);
      showToast(`✅ ${playerData.name} cadastrado no elenco!`);
    }
  };

  const handleDeletePlayer = (id: string) => {
    const target = players.find((p) => p.id === id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      showToast(`🗑️ ${target.name} removido do elenco.`);
    }
  };

  const handleSetAllAvailable = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, status: "available" })));
    showToast("✅ Todos os jogadores foram marcados como Disponíveis!");
  };

  const handleResetMockData = () => {
    setPlayers(INITIAL_PLAYERS);
    setTeamA([]);
    setTeamB([]);
    setReserves([]);
    showToast("🔄 Elenco padrão restaurado com sucesso!");
  };

  // Config Update Handler
  const handleUpdateConfig = (partial: Partial<TeamConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  // Auto Sort Handler (Sorteia os times E onde cada um vai jogar!)
  const handleRunAutoSort = () => {
    const result = generateBalancedTeams(availablePlayers, config);
    setTeamA(result.teamA);
    setTeamB(result.teamB);
    setReserves(result.reserves);
    setWarnings(result.warnings);
    setLastSortedAt(result.lastSortedAt);
    setCurrentStats({});
    setMvpPlayerId(null);
    setMatchNotes("");
    setMatchFinished(false);
    setElapsedSeconds(0);
    setTimerRunning(false);
    showToast(
      `🎲 Times e posições em campo sorteados para ${MATCH_FORMATS[config.format].shortName}!`
    );
  };

  // Re-sort ONLY positions inside the current Team A and Team B
  const handleReshufflePositionsOnly = () => {
    if (teamA.length === 0 && teamB.length === 0) return;
    setTeamA((prev) =>
      assignPositionsToTeam(prev, config.format, config.balanceGoalkeepers)
    );
    setTeamB((prev) =>
      assignPositionsToTeam(prev, config.format, config.balanceGoalkeepers)
    );
    setLastSortedAt(
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    showToast("🎲 Posições (GOL, ZAG, MEI, ATA) re-sorteadas dentro dos times!");
  };

  // Change an individual player's assigned position on their team
  const handleChangePlayerPosition = (
    playerId: string,
    newPosition: Position
  ) => {
    setTeamA((prev) =>
      sortPlayersByPosition(
        prev.map((p) =>
          p.id === playerId ? { ...p, assignedPosition: newPosition } : p
        )
      )
    );
    setTeamB((prev) =>
      sortPlayersByPosition(
        prev.map((p) =>
          p.id === playerId ? { ...p, assignedPosition: newPosition } : p
        )
      )
    );
  };

  // Manual Assignment Handler (atribui a próxima vaga tática livre ao entrar no time)
  const handleAssignPlayerManual = (
    player: Player,
    destination: "teamA" | "teamB" | "reserves" | "pool"
  ) => {
    const limit = MATCH_FORMATS[config.format].playersPerTeam;

    if (
      destination === "teamA" &&
      teamA.length >= limit &&
      !teamA.some((p) => p.id === player.id)
    ) {
      showToast(
        `⚠️ ${config.teamAName} já atingiu o limite de ${limit} titulares! Enviando para Reservas.`
      );
      destination = "reserves";
    } else if (
      destination === "teamB" &&
      teamB.length >= limit &&
      !teamB.some((p) => p.id === player.id)
    ) {
      showToast(
        `⚠️ ${config.teamBName} já atingiu o limite de ${limit} titulares! Enviando para Reservas.`
      );
      destination = "reserves";
    }

    // Remove de qualquer lista anterior
    const nextA = teamA.filter((p) => p.id !== player.id);
    const nextB = teamB.filter((p) => p.id !== player.id);
    const nextRes = reserves.filter((p) => p.id !== player.id);

    if (destination === "teamA") {
      const assignedPos = getNextTacticalPosition(
        nextA,
        config.format,
        config.balanceGoalkeepers
      );
      nextA.push({ ...player, assignedPosition: assignedPos });
    } else if (destination === "teamB") {
      const assignedPos = getNextTacticalPosition(
        nextB,
        config.format,
        config.balanceGoalkeepers
      );
      nextB.push({ ...player, assignedPosition: assignedPos });
    } else if (destination === "reserves") {
      nextRes.push({ ...player, assignedPosition: undefined });
    }

    setTeamA(sortPlayersByPosition(nextA));
    setTeamB(sortPlayersByPosition(nextB));
    setReserves(nextRes);
    setLastSortedAt(
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // Auto-complete remaining manual slots
  const handleAutoCompleteRemaining = () => {
    const limit = MATCH_FORMATS[config.format].playersPerTeam;
    const assigned = new Set([
      ...teamA.map((p) => p.id),
      ...teamB.map((p) => p.id),
      ...reserves.map((p) => p.id),
    ]);
    const unassigned = availablePlayers.filter((p) => !assigned.has(p.id));

    const nextA = [...teamA];
    const nextB = [...teamB];
    const nextRes = [...reserves];

    for (const p of unassigned) {
      if (nextA.length < limit && nextA.length <= nextB.length) {
        const pos = getNextTacticalPosition(
          nextA,
          config.format,
          config.balanceGoalkeepers
        );
        nextA.push({ ...p, assignedPosition: pos });
      } else if (nextB.length < limit) {
        const pos = getNextTacticalPosition(
          nextB,
          config.format,
          config.balanceGoalkeepers
        );
        nextB.push({ ...p, assignedPosition: pos });
      } else if (nextA.length < limit) {
        const pos = getNextTacticalPosition(
          nextA,
          config.format,
          config.balanceGoalkeepers
        );
        nextA.push({ ...p, assignedPosition: pos });
      } else {
        nextRes.push({ ...p, assignedPosition: undefined });
      }
    }

    setTeamA(sortPlayersByPosition(nextA));
    setTeamB(sortPlayersByPosition(nextB));
    setReserves(nextRes);
    setLastSortedAt(
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    showToast("✨ Vagas e posições restantes sorteadas automaticamente!");
  };

  const handleClearTeams = () => {
    setTeamA([]);
    setTeamB([]);
    setReserves([]);
    setWarnings([]);
    setLastSortedAt(null);
    setCurrentStats({});
    setMvpPlayerId(null);
    setMatchNotes("");
    setMatchFinished(false);
    setElapsedSeconds(0);
    setTimerRunning(false);
    showToast("🧹 Escalações limpas.");
  };

  // Match Stats Handlers
  const handleUpdatePlayerStat = (
    playerId: string,
    field: "goals" | "assists" | "fouls" | "yellowCards" | "redCards" | "saves",
    delta: number
  ) => {
    setCurrentStats((prev) => {
      const target = prev[playerId];
      if (!target) return prev;
      const nextVal = Math.max(0, target[field] + delta);
      return {
        ...prev,
        [playerId]: {
          ...target,
          [field]: nextVal,
        },
      };
    });
  };

  const handleResetCurrentSheet = () => {
    setCurrentStats((prev) => {
      const reset: Record<string, PlayerMatchStats> = {};
      for (const [id, st] of Object.entries(prev)) {
        reset[id] = {
          ...st,
          goals: 0,
          assists: 0,
          fouls: 0,
          yellowCards: 0,
          redCards: 0,
          saves: 0,
        };
      }
      return reset;
    });
    setMvpPlayerId(null);
    setMatchNotes("");
    setMatchFinished(false);
    setElapsedSeconds(0);
    setTimerRunning(false);
    showToast("🧹 Súmula zerada para nova contagem.");
  };

  const handleFinishMatch = () => {
    const statsList = Object.values(currentStats);
    const scoreA = statsList
      .filter((s) => s.team === "teamA")
      .reduce((acc, s) => acc + s.goals, 0);
    const scoreB = statsList
      .filter((s) => s.team === "teamB")
      .reduce((acc, s) => acc + s.goals, 0);

    const mvpPlayer = mvpPlayerId
      ? players.find((p) => p.id === mvpPlayerId)
      : undefined;

    const newRecord: MatchRecord = {
      id: `m-${Date.now()}`,
      date: new Date().toISOString(),
      format: config.format,
      teamAName: config.teamAName,
      teamBName: config.teamBName,
      scoreA,
      scoreB,
      durationSeconds: elapsedSeconds,
      mvpPlayerId: mvpPlayer?.id,
      mvpPlayerName: mvpPlayer?.name,
      notes: matchNotes.trim() || undefined,
      playerStats: statsList,
    };

    setMatchHistory((prev) => [newRecord, ...prev]);

    // Update career stats for all participating players
    const statsById = new Map(statsList.map((s) => [s.playerId, s]));
    setPlayers((prev) =>
      prev.map((p) => {
        const matchStat = statsById.get(p.id);
        if (!matchStat) return p;
        const participated =
          matchStat.team === "teamA" ||
          matchStat.team === "teamB" ||
          matchStat.goals > 0 ||
          matchStat.assists > 0 ||
          matchStat.fouls > 0 ||
          matchStat.yellowCards > 0 ||
          matchStat.redCards > 0 ||
          matchStat.saves > 0;
        if (!participated) return p;

        const base = p.stats || getEmptyCareerStats();
        return {
          ...p,
          stats: {
            matches: base.matches + 1,
            goals: base.goals + matchStat.goals,
            assists: base.assists + matchStat.assists,
            fouls: base.fouls + matchStat.fouls,
            yellowCards: base.yellowCards + matchStat.yellowCards,
            redCards: base.redCards + matchStat.redCards,
            saves: base.saves + matchStat.saves,
            mvps: base.mvps + (mvpPlayerId === p.id ? 1 : 0),
          },
        };
      })
    );

    setTimerRunning(false);
    setMatchFinished(true);
    showToast(
      `🏆 Partida salva! ${config.teamAName} ${scoreA} × ${scoreB} ${config.teamBName}`
    );
  };

  const handleDeleteMatchRecord = (matchId: string) => {
    setMatchHistory((prev) => prev.filter((m) => m.id !== matchId));
    showToast("🗑️ Registro de partida removido do histórico.");
  };

  const handleResetCareerStats = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, stats: undefined })));
    setMatchHistory([]);
    showToast("🔄 Ranking geral e histórico de partidas zerados.");
  };

  const hasTeamsFormed = teamA.length > 0 || teamB.length > 0;

  const liveScore = useMemo(() => {
    if (!hasTeamsFormed) return null;
    const list = Object.values(currentStats);
    return {
      a: list
        .filter((s) => s.team === "teamA")
        .reduce((acc, s) => acc + s.goals, 0),
      b: list
        .filter((s) => s.team === "teamB")
        .reduce((acc, s) => acc + s.goals, 0),
    };
  }, [hasTeamsFormed, currentStats]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Sticky Header + Mobile Bottom Tab Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableCount={availablePlayers.length}
        totalCount={players.length}
        selectedFormat={config.format}
        hasTeamsFormed={hasTeamsFormed}
        matchCount={matchHistory.length}
        liveScore={liveScore}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenNewPlayerModal={() => {
          setEditingPlayer(null);
          setIsModalOpen(true);
        }}
      />

      {/* Main Content Container (pb-24 on mobile leaves room for the fixed bottom bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 space-y-5 sm:space-y-6">
        {/* TAB 1: GESTÃO DE JOGADORES */}
        {activeTab === "roster" && (
          <PlayerManagement
            players={players}
            selectedFormat={config.format}
            onToggleStatus={handleToggleStatus}
            onQuickAddPlayer={handleQuickAddPlayer}
            onOpenModalForEdit={(player) => {
              setEditingPlayer(player);
              setIsModalOpen(true);
            }}
            onOpenModalForNew={() => {
              setEditingPlayer(null);
              setIsModalOpen(true);
            }}
            onDeletePlayer={handleDeletePlayer}
            onSetAllAvailable={handleSetAllAvailable}
            onResetMockData={handleResetMockData}
            onGoToBuilder={() => setActiveTab("builder")}
          />
        )}

        {/* TAB 2: CONFIGURAÇÃO E MONTAGEM DOS TIMES (AUTO / MANUAL) */}
        {activeTab === "builder" && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            <MatchConfigBar
              config={config}
              onUpdateConfig={handleUpdateConfig}
              builderMode={builderMode}
              onChangeBuilderMode={setBuilderMode}
              availableCount={availablePlayers.length}
            />

            <TeamBuilder
              availablePlayers={availablePlayers}
              config={config}
              builderMode={builderMode}
              teamA={teamA}
              teamB={teamB}
              reserves={reserves}
              warnings={warnings}
              onRunAutoSort={handleRunAutoSort}
              onReshufflePositionsOnly={handleReshufflePositionsOnly}
              onAssignPlayerManual={handleAssignPlayerManual}
              onChangePlayerPosition={handleChangePlayerPosition}
              onClearTeams={handleClearTeams}
              onAutoCompleteRemaining={handleAutoCompleteRemaining}
              onGoToMatchup={() => setActiveTab("matchup")}
              onOpenNewPlayerModal={() => {
                setEditingPlayer(null);
                setIsModalOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 3: VISUALIZAÇÃO DO CONFRONTO & WHATSAPP */}
        {activeTab === "matchup" && (
          <div className="animate-fadeIn">
            <MatchupView
              teamA={teamA}
              teamB={teamB}
              reserves={reserves}
              config={config}
              lastSortedAt={lastSortedAt}
              onReSort={handleRunAutoSort}
              onReshufflePositionsOnly={handleReshufflePositionsOnly}
              onChangePlayerPosition={handleChangePlayerPosition}
              onSwapTeam={(player, target) =>
                handleAssignPlayerManual(player, target)
              }
              onBackToBuilder={() => setActiveTab("builder")}
              onGoToStats={() => setActiveTab("stats")}
            />
          </div>
        )}

        {/* TAB 4: SÚMULA AO VIVO, ESTATÍSTICAS & HISTÓRICO */}
        {activeTab === "stats" && (
          <MatchStatsView
            players={players}
            teamA={teamA}
            teamB={teamB}
            reserves={reserves}
            config={config}
            currentStats={currentStats}
            mvpPlayerId={mvpPlayerId}
            matchNotes={matchNotes}
            matchFinished={matchFinished}
            elapsedSeconds={elapsedSeconds}
            timerRunning={timerRunning}
            matchHistory={matchHistory}
            onToggleTimer={() => setTimerRunning((prev) => !prev)}
            onResetTimer={() => {
              setTimerRunning(false);
              setElapsedSeconds(0);
            }}
            onUpdatePlayerStat={handleUpdatePlayerStat}
            onSelectMvp={setMvpPlayerId}
            onChangeNotes={setMatchNotes}
            onFinishMatch={handleFinishMatch}
            onResetCurrentSheet={handleResetCurrentSheet}
            onDeleteMatchRecord={handleDeleteMatchRecord}
            onResetCareerStats={handleResetCareerStats}
            onGoToBuilder={() => setActiveTab("builder")}
          />
        )}
      </main>

      {/* Floating Toast Notification (Positioned above the mobile bottom bar on smartphones) */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-5 left-3 right-3 sm:left-auto sm:right-5 z-50 sm:max-w-sm px-4 py-3 rounded-2xl bg-slate-900 dark:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-xl border border-slate-700 dark:border-orange-400 text-center sm:text-left animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Add / Edit Player Modal */}
      <PlayerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlayer(null);
        }}
        onSave={handleSaveModalPlayer}
        editingPlayer={editingPlayer}
      />

      {/* Footer (Hidden on small mobile screens to keep focus on the fixed bottom navigation) */}
      <footer className="hidden md:block border-t border-slate-200/70 dark:border-slate-800/80 py-4 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong className="text-slate-800 dark:text-slate-200">
              Futebol<span className="text-orange-500">Sorter</span>
            </strong>{" "}
            • Gerenciador e Sorteador de Times e Posições para Rachas (5x5, 7x7,
            11x11)
          </div>
          <div>
            Desenvolvido por{" "}
            <strong className="text-slate-800 dark:text-slate-200">NKSGG</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
