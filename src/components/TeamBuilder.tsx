"use client";

import React, { useState, useMemo } from "react";
import {
  BuilderMode,
  Player,
  Position,
  TeamConfig,
} from "@/types/soccer";
import { MATCH_FORMATS } from "@/data/mockPlayers";
import { getTeamStats } from "@/utils/teamSorter";
import { PositionBadge } from "./PositionBadge";
import {
  Shuffle,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  Trash2,
  ArrowRight,
  Users,
  Hand,
  Sparkles,
  RotateCcw,
  Search,
  GripVertical,
  Trophy,
  Star,
  Dices,
} from "lucide-react";

interface TeamBuilderProps {
  availablePlayers: Player[];
  config: TeamConfig;
  builderMode: BuilderMode;
  teamA: Player[];
  teamB: Player[];
  reserves: Player[];
  warnings: string[];
  onRunAutoSort: () => void;
  onReshufflePositionsOnly: () => void;
  onAssignPlayerManual: (
    player: Player,
    destination: "teamA" | "teamB" | "reserves" | "pool"
  ) => void;
  onChangePlayerPosition: (playerId: string, newPosition: Position) => void;
  onClearTeams: () => void;
  onAutoCompleteRemaining: () => void;
  onGoToMatchup: () => void;
  onOpenNewPlayerModal: () => void;
}

const ALL_POSITIONS: Position[] = [
  "Goleiro",
  "Zagueiro",
  "Meio-campista",
  "Atacante",
];

type MobileDraftPanel = "pool" | "teams" | "all";

export function TeamBuilder({
  availablePlayers,
  config,
  builderMode,
  teamA,
  teamB,
  reserves,
  warnings,
  onRunAutoSort,
  onReshufflePositionsOnly,
  onAssignPlayerManual,
  onChangePlayerPosition,
  onClearTeams,
  onAutoCompleteRemaining,
  onGoToMatchup,
  onOpenNewPlayerModal,
}: TeamBuilderProps) {
  const [poolSearch, setPoolSearch] = useState("");
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [isSortingAnim, setIsSortingAnim] = useState(false);
  const [mobileDraftPanel, setMobileDraftPanel] =
    useState<MobileDraftPanel>("all");

  const format = MATCH_FORMATS[config.format];
  const limitPerTeam = format.playersPerTeam;

  // Jogadores disponíveis que ainda não estão alocados em Time A, Time B ou Reservas
  const assignedIds = useMemo(() => {
    const set = new Set<string>();
    teamA.forEach((p) => set.add(p.id));
    teamB.forEach((p) => set.add(p.id));
    reserves.forEach((p) => set.add(p.id));
    return set;
  }, [teamA, teamB, reserves]);

  const unassignedPlayers = useMemo(() => {
    return availablePlayers
      .filter((p) => !assignedIds.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [availablePlayers, assignedIds]);

  const filteredPool = useMemo(() => {
    return unassignedPlayers.filter((p) =>
      p.name.toLowerCase().includes(poolSearch.trim().toLowerCase())
    );
  }, [unassignedPlayers, poolSearch]);

  const statsA = useMemo(() => getTeamStats(teamA), [teamA]);
  const statsB = useMemo(() => getTeamStats(teamB), [teamB]);

  const handleSortClick = () => {
    setIsSortingAnim(true);
    onRunAutoSort();
    setTimeout(() => setIsSortingAnim(false), 350);
  };

  // Drag & Drop handlers
  const handleDragStart = (player: Player) => {
    setDraggedPlayer(player);
  };

  const handleDropOn = (
    destination: "teamA" | "teamB" | "reserves" | "pool"
  ) => {
    if (!draggedPlayer) return;
    onAssignPlayerManual(draggedPlayer, destination);
    setDraggedPlayer(null);
  };

  const hasTeamsFormed = teamA.length > 0 || teamB.length > 0;
  const notEnoughPlayers = availablePlayers.length < format.totalStarters;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Validation & Info Alerts */}
      {(notEnoughPlayers || warnings.length > 0) && (
        <div className="space-y-2">
          {notEnoughPlayers && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-amber-800 dark:text-amber-200">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <span className="font-bold">
                    Atenção ao número de jogadores:{" "}
                  </span>
                  O formato <strong>{format.name}</strong> pede{" "}
                  <strong>{format.totalStarters} titulares</strong> (
                  {format.playersPerTeam} por time), mas há{" "}
                  <strong>{availablePlayers.length} disponíveis</strong>. Você
                  ainda pode sortear os times e posições com quem está presente!
                </div>
              </div>
              <button
                onClick={onOpenNewPlayerModal}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors min-h-[40px] sm:min-h-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Adicionar Jogador</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 1: AUTOMATIC DRAW */}
      {builderMode === "auto" && (
        <div className="space-y-5 sm:space-y-6">
          {/* Hero Action Banner for Auto Draw */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950 dark:from-slate-900 dark:to-orange-950/80 text-white p-5 sm:p-8 border border-slate-800 shadow-lg">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-[11px] sm:text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Sorteador de Equipes + Posições em Campo</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                  Sorteio Automático • {format.name} ({format.shortName})
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Os{" "}
                  <strong className="text-white">
                    {availablePlayers.length} jogadores disponíveis
                  </strong>{" "}
                  são divididos entre{" "}
                  <strong className="text-orange-400">{config.teamAName}</strong>{" "}
                  e{" "}
                  <strong className="text-orange-400">{config.teamBName}</strong>{" "}
                  e{" "}
                  <strong className="text-white">
                    cada atleta recebe sua posição sorteada na hora
                  </strong>{" "}
                  (1 GOL, {format.recommendedPositions.Zagueiro} ZAG,{" "}
                  {format.recommendedPositions["Meio-campista"]} MEI e{" "}
                  {format.recommendedPositions.Atacante} ATA).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
                <button
                  onClick={handleSortClick}
                  disabled={availablePlayers.length === 0}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-500/30 transition-all cursor-pointer min-h-[52px]"
                >
                  <Shuffle
                    className={`w-5 h-5 shrink-0 ${
                      isSortingAnim ? "animate-spin" : ""
                    }`}
                  />
                  <span>
                    {hasTeamsFormed
                      ? "Sortear Times e Posições"
                      : "Sortear Times Agora"}
                  </span>
                </button>

                {hasTeamsFormed && (
                  <button
                    onClick={onGoToMatchup}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all min-h-[48px]"
                  >
                    <Trophy className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Ver Confronto & WhatsApp</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Preview or Available Pool Overview */}
          {hasTeamsFormed ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Times e Posições Sorteadas ({format.shortName})
                  </span>
                </h3>
                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                  <button
                    onClick={onReshufflePositionsOnly}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 hover:bg-orange-100 active:scale-95 transition-all"
                    title="Mantém os jogadores de cada time, mas sorteia novamente quem vai no gol e na linha"
                  >
                    <Dices className="w-3.5 h-3.5 shrink-0" />
                    <span>Sortear Posições</span>
                  </button>
                  <button
                    onClick={onClearTeams}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:text-rose-600 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>Limpar</span>
                  </button>
                  <button
                    onClick={onGoToMatchup}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xs transition-all"
                  >
                    <span>Confronto & WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Team A Preview Card */}
                <TeamPanelCard
                  title={config.teamAName}
                  accent="orange"
                  players={teamA}
                  limit={limitPerTeam}
                  stats={statsA}
                  onChangePlayerPosition={onChangePlayerPosition}
                  onRemovePlayer={(p) => onAssignPlayerManual(p, "pool")}
                  onMoveOtherTeam={(p) => onAssignPlayerManual(p, "teamB")}
                />

                {/* Team B Preview Card */}
                <TeamPanelCard
                  title={config.teamBName}
                  accent="slate"
                  players={teamB}
                  limit={limitPerTeam}
                  stats={statsB}
                  onChangePlayerPosition={onChangePlayerPosition}
                  onRemovePlayer={(p) => onAssignPlayerManual(p, "pool")}
                  onMoveOtherTeam={(p) => onAssignPlayerManual(p, "teamA")}
                />
              </div>

              {/* Reserves Preview if any */}
              {reserves.length > 0 && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      🔄 Banco de Reservas / Próximos ({reserves.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Entram na próxima ou substituem durante o racha
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reserves.map((p) => (
                      <div
                        key={p.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <span>{p.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                          Reserva
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Jogadores Confirmados para o Sorteio ({availablePlayers.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Toque em &ldquo;Sortear Times Agora&rdquo; acima para formar as equipes e sortear onde cada um vai jogar!
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {availablePlayers.map((p) => (
                  <div
                    key={p.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <span>{p.name}</span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {p.skillLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: MANUAL DRAFT (SPLIT SCREEN ON DESKTOP + SMART TABS ON MOBILE) */}
      {builderMode === "manual" && (
        <div className="space-y-4">
          {/* Manual Mode Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">
                Modo Draft Manual:{" "}
              </strong>
              Toque em{" "}
              <span className="text-orange-500 font-bold">+ Time A</span> ou{" "}
              <span className="font-bold">+ Time B</span> para escalar. A posição
              é atribuída na entrada e pode ser alterada no time!
            </div>
            <div className="grid grid-cols-2 sm:flex flex-wrap items-center gap-2">
              {unassignedPlayers.length > 0 && (
                <button
                  onClick={onAutoCompleteRemaining}
                  className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 hover:bg-orange-100 active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Sortear Restantes</span>
                </button>
              )}
              {hasTeamsFormed && (
                <>
                  <button
                    onClick={onReshufflePositionsOnly}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    <Dices className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Sortear Posições</span>
                  </button>
                  <button
                    onClick={onClearTeams}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Esvaziar</span>
                  </button>
                  <button
                    onClick={onGoToMatchup}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 transition-all"
                  >
                    <span>Finalizar & Ver Confronto</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile View Filter Switcher (Visible only < lg so mobile users don't scroll endlessly) */}
          <div className="lg:hidden grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/90">
            <button
              type="button"
              onClick={() => setMobileDraftPanel("all")}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all ${
                mobileDraftPanel === "all"
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Tudo
            </button>
            <button
              type="button"
              onClick={() => setMobileDraftPanel("pool")}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all ${
                mobileDraftPanel === "pool"
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Livres ({unassignedPlayers.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileDraftPanel("teams")}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all ${
                mobileDraftPanel === "teams"
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Times ({teamA.length}/{limitPerTeam} • {teamB.length}/{limitPerTeam})
            </button>
          </div>

          {/* Split Screen Grid: Left = Available Pool (5 cols) | Right = Team A & Team B (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
            {/* LEFT PANEL: Available Unassigned Players */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOn("pool")}
              className={`lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs space-y-3 ${
                mobileDraftPanel === "teams" ? "hidden lg:block" : "block"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500 shrink-0" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Jogadores Disponíveis
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300">
                  {unassignedPlayers.length} livres
                </span>
              </div>

              {/* Search inside Pool */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={poolSearch}
                  onChange={(e) => setPoolSearch(e.target.value)}
                  placeholder="Buscar jogador disponível..."
                  className="w-full pl-9 pr-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-base sm:text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Unassigned Player List */}
              <div className="space-y-2 max-h-[380px] sm:max-h-[520px] overflow-y-auto pr-0.5">
                {filteredPool.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    {unassignedPlayers.length === 0
                      ? "Todos os jogadores disponíveis já foram escalados!"
                      : "Nenhum jogador livre com este nome."}
                  </div>
                ) : (
                  filteredPool.map((player) => {
                    const aFull = teamA.length >= limitPerTeam;
                    const bFull = teamB.length >= limitPerTeam;

                    return (
                      <div
                        key={player.id}
                        draggable
                        onDragStart={() => handleDragStart(player)}
                        className="group p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-orange-400 dark:hover:border-orange-600 transition-all flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {player.name}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>Nível:</span>
                              <span className="inline-flex items-center text-amber-500 font-bold">
                                ★ {player.skillLevel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={aFull}
                            onClick={() =>
                              onAssignPlayerManual(player, "teamA")
                            }
                            title={
                              aFull
                                ? `${config.teamAName} já está completo (${limitPerTeam}/${limitPerTeam})`
                                : `Escalar no ${config.teamAName}`
                            }
                            className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[11px] font-extrabold bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-40 text-white shadow-2xs transition-all min-h-[36px] sm:min-h-0"
                          >
                            + Time A
                          </button>
                          <button
                            type="button"
                            disabled={bFull}
                            onClick={() =>
                              onAssignPlayerManual(player, "teamB")
                            }
                            title={
                              bFull
                                ? `${config.teamBName} já está completo (${limitPerTeam}/${limitPerTeam})`
                                : `Escalar no ${config.teamBName}`
                            }
                            className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[11px] font-extrabold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-95 disabled:opacity-40 text-white shadow-2xs transition-all min-h-[36px] sm:min-h-0"
                          >
                            + Time B
                          </button>
                          {aFull && bFull && (
                            <button
                              type="button"
                              onClick={() =>
                                onAssignPlayerManual(player, "reserves")
                              }
                              className="px-2.5 py-2 sm:py-1.5 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all min-h-[36px] sm:min-h-0"
                            >
                              + Res.
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT PANELS: Team A & Team B + Reserves */}
            <div
              className={`lg:col-span-7 space-y-4 ${
                mobileDraftPanel === "pool" ? "hidden lg:block" : "block"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team A Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOn("teamA")}
                >
                  <TeamPanelCard
                    title={config.teamAName}
                    accent="orange"
                    players={teamA}
                    limit={limitPerTeam}
                    stats={statsA}
                    onChangePlayerPosition={onChangePlayerPosition}
                    onRemovePlayer={(p) => onAssignPlayerManual(p, "pool")}
                    onMoveOtherTeam={(p) => onAssignPlayerManual(p, "teamB")}
                  />
                </div>

                {/* Team B Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOn("teamB")}
                >
                  <TeamPanelCard
                    title={config.teamBName}
                    accent="slate"
                    players={teamB}
                    limit={limitPerTeam}
                    stats={statsB}
                    onChangePlayerPosition={onChangePlayerPosition}
                    onRemovePlayer={(p) => onAssignPlayerManual(p, "pool")}
                    onMoveOtherTeam={(p) => onAssignPlayerManual(p, "teamA")}
                  />
                </div>
              </div>

              {/* Reserves Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOn("reserves")}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    🔄 Lista de Reservas / De Próxima ({reserves.length})
                  </span>
                </div>
                {reserves.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">
                    Nenhum jogador na reserva. Quando os dois times atingirem{" "}
                    {limitPerTeam} atletas, os próximos vão para a reserva.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {reserves.map((p) => (
                      <div
                        key={p.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <span>{p.name}</span>
                        <button
                          onClick={() => onAssignPlayerManual(p, "pool")}
                          className="text-slate-400 hover:text-rose-500 ml-1 p-0.5"
                          title="Devolver para disponíveis"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TeamPanelCardProps {
  title: string;
  accent: "orange" | "slate";
  players: Player[];
  limit: number;
  stats: ReturnType<typeof getTeamStats>;
  onChangePlayerPosition: (playerId: string, newPosition: Position) => void;
  onRemovePlayer: (player: Player) => void;
  onMoveOtherTeam: (player: Player) => void;
}

function TeamPanelCard({
  title,
  accent,
  players,
  limit,
  stats,
  onChangePlayerPosition,
  onRemovePlayer,
  onMoveOtherTeam,
}: TeamPanelCardProps) {
  const isOrange = accent === "orange";
  const progressPct = Math.min(100, Math.round((players.length / limit) * 100));

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col h-full">
      {/* Header */}
      <div
        className={`px-4 py-3.5 text-white flex items-center justify-between ${
          isOrange
            ? "bg-gradient-to-r from-orange-500 to-orange-600"
            : "bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950"
        }`}
      >
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
            {isOrange ? "Time A (Coletes)" : "Time B (Sem Colete)"}
          </span>
          <h4 className="text-base font-extrabold leading-tight truncate">
            {title}
          </h4>
        </div>
        <div className="text-right shrink-0">
          <span className="text-lg font-extrabold">
            {players.length}/{limit}
          </span>
          <div className="text-[10px] opacity-85">Média ★ {stats.avgSkill}</div>
        </div>
      </div>

      {/* Progress & Goalkeeper Status Bar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Hand
            className={`w-3.5 h-3.5 shrink-0 ${
              stats.hasGoalkeeper ? "text-emerald-500" : "text-amber-500"
            }`}
          />
          <span
            className={`font-semibold ${
              stats.hasGoalkeeper
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {stats.hasGoalkeeper
              ? "1 Goleiro definido"
              : "Sem goleiro definido"}
          </span>
        </div>

        <div className="w-20 sm:w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
          <div
            className={`h-full transition-all ${
              isOrange ? "bg-orange-500" : "bg-slate-700 dark:bg-orange-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Players List with Mobile-Friendly Position Selector */}
      <div className="p-3 sm:p-3.5 space-y-2 flex-1">
        {players.length === 0 ? (
          <div className="py-8 sm:py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Nenhum jogador escalado no {title}.
          </div>
        ) : (
          players.map((p, idx) => {
            const currentPos: Position = p.assignedPosition || "Meio-campista";
            return (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-orange-300 transition-colors"
              >
                {/* Top/Left: Number + Full Name + Badge */}
                <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {p.name}
                    </span>
                  </div>
                  <div className="sm:hidden shrink-0">
                    <PositionBadge position={currentPos} size="sm" short />
                  </div>
                </div>

                {/* Bottom/Right: Controls (Position Dropdown, Swap Team, Remove) */}
                <div className="flex items-center justify-end gap-1.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700/50 shrink-0">
                  <div className="hidden sm:block">
                    <PositionBadge position={currentPos} size="sm" short />
                  </div>

                  {/* Quick Position Changer on the Team */}
                  <select
                    value={currentPos}
                    onChange={(e) =>
                      onChangePlayerPosition(p.id, e.target.value as Position)
                    }
                    title="Mudar posição deste jogador no time"
                    className="flex-1 sm:flex-initial px-2 py-1.5 sm:py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    {ALL_POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => onMoveOtherTeam(p)}
                    title="Trocar de time"
                    className="px-2.5 sm:px-2 py-1.5 sm:py-1 rounded-lg text-[11px] font-bold bg-white sm:bg-transparent dark:bg-slate-900 sm:dark:bg-transparent border sm:border-0 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    ⇄
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemovePlayer(p)}
                    title="Remover do time"
                    className="px-2.5 sm:px-2 py-1.5 sm:py-1 rounded-lg text-xs font-bold bg-white sm:bg-transparent dark:bg-slate-900 sm:dark:bg-transparent border sm:border-0 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
