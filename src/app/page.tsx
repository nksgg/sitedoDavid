"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ActiveTab,
  BuilderMode,
  Player,
  Position,
  TeamConfig,
} from "@/types/soccer";
import { INITIAL_PLAYERS, MATCH_FORMATS } from "@/data/mockPlayers";
import {
  assignPositionsToTeam,
  generateBalancedTeams,
  getNextTacticalPosition,
  sortPlayersByPosition,
} from "@/utils/teamSorter";
import { Header } from "@/components/Header";
import { PlayerManagement } from "@/components/PlayerManagement";
import { MatchConfigBar } from "@/components/MatchConfigBar";
import { TeamBuilder } from "@/components/TeamBuilder";
import { MatchupView } from "@/components/MatchupView";
import { PlayerModal } from "@/components/PlayerModal";

const STORAGE_KEY_PLAYERS = "futebolsorter_players_v2";
const STORAGE_KEY_THEME = "futebolsorter_dark_v1";

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
    } catch {
      // Ignore storage errors
    }
  }, []);

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
    showToast("🧹 Escalações limpas.");
  };

  const hasTeamsFormed = teamA.length > 0 || teamB.length > 0;

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
            />
          </div>
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
            Desenvolvido com Next.js App Router, React & Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}
