"use client";

import React, { useState, useMemo } from "react";
import {
  MatchRecord,
  Player,
  PlayerMatchStats,
  TeamConfig,
} from "@/types/soccer";
import { MATCH_FORMATS } from "@/data/mockPlayers";
import {
  formatDuration,
  formatWhatsAppMatchSummary,
  getEmptyCareerStats,
} from "@/utils/teamSorter";
import { PositionBadge } from "./PositionBadge";
import {
  Trophy,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Star,
  Award,
  BarChart3,
  History,
  ClipboardList,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Shuffle,
  ShieldAlert,
  Sparkles,
  Flame,
} from "lucide-react";

type StatField =
  | "goals"
  | "assists"
  | "fouls"
  | "yellowCards"
  | "redCards"
  | "saves";

type StatsSubTab = "sheet" | "leaderboard" | "history";

interface MatchStatsViewProps {
  players: Player[];
  teamA: Player[];
  teamB: Player[];
  reserves: Player[];
  config: TeamConfig;
  currentStats: Record<string, PlayerMatchStats>;
  mvpPlayerId: string | null;
  matchNotes: string;
  matchFinished: boolean;
  elapsedSeconds: number;
  timerRunning: boolean;
  matchHistory: MatchRecord[];
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onUpdatePlayerStat: (
    playerId: string,
    field: StatField,
    delta: number
  ) => void;
  onSelectMvp: (playerId: string | null) => void;
  onChangeNotes: (notes: string) => void;
  onFinishMatch: () => void;
  onResetCurrentSheet: () => void;
  onDeleteMatchRecord: (matchId: string) => void;
  onResetCareerStats: () => void;
  onGoToBuilder: () => void;
}

const STAT_COLUMNS: {
  key: StatField;
  label: string;
  shortLabel: string;
  emoji: string;
  activeBg: string;
  activeText: string;
}[] = [
  {
    key: "goals",
    label: "Gols",
    shortLabel: "GOL",
    emoji: "⚽",
    activeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
    activeText: "text-emerald-700 dark:text-emerald-300",
  },
  {
    key: "assists",
    label: "Assist.",
    shortLabel: "ASS",
    emoji: "🎯",
    activeBg: "bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800",
    activeText: "text-sky-700 dark:text-sky-300",
  },
  {
    key: "fouls",
    label: "Faltas",
    shortLabel: "FAL",
    emoji: "🛑",
    activeBg: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700",
    activeText: "text-slate-800 dark:text-slate-200",
  },
  {
    key: "yellowCards",
    label: "Amarelo",
    shortLabel: "CA",
    emoji: "🟨",
    activeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
    activeText: "text-amber-700 dark:text-amber-300",
  },
  {
    key: "redCards",
    label: "Vermelho",
    shortLabel: "CV",
    emoji: "🟥",
    activeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
    activeText: "text-rose-700 dark:text-rose-300",
  },
  {
    key: "saves",
    label: "Defesas",
    shortLabel: "DEF",
    emoji: "🧤",
    activeBg: "bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800",
    activeText: "text-violet-700 dark:text-violet-300",
  },
];

export function MatchStatsView({
  players,
  teamA,
  teamB,
  reserves,
  config,
  currentStats,
  mvpPlayerId,
  matchNotes,
  matchFinished,
  elapsedSeconds,
  timerRunning,
  matchHistory,
  onToggleTimer,
  onResetTimer,
  onUpdatePlayerStat,
  onSelectMvp,
  onChangeNotes,
  onFinishMatch,
  onResetCurrentSheet,
  onDeleteMatchRecord,
  onResetCareerStats,
  onGoToBuilder,
}: MatchStatsViewProps) {
  const [subTab, setSubTab] = useState<StatsSubTab>("sheet");
  const [onlyWithEvents, setOnlyWithEvents] = useState(false);
  const [showReserves, setShowReserves] = useState(false);
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [leaderboardSort, setLeaderboardSort] = useState<
    "goals" | "assists" | "mvps" | "fouls" | "matches"
  >("goals");

  const hasTeamsFormed = teamA.length > 0 || teamB.length > 0;
  const format = MATCH_FORMATS[config.format];

  // Calculate live team scores from player goals
  const { scoreA, scoreB, totalFouls, totalCards, allMatchStats } =
    useMemo(() => {
      const list = Object.values(currentStats);
      let sA = 0;
      let sB = 0;
      let fouls = 0;
      let cards = 0;
      for (const item of list) {
        if (item.team === "teamA") sA += item.goals;
        if (item.team === "teamB") sB += item.goals;
        fouls += item.fouls;
        cards += item.yellowCards + item.redCards;
      }
      return {
        scoreA: sA,
        scoreB: sB,
        totalFouls: fouls,
        totalCards: cards,
        allMatchStats: list,
      };
    }, [currentStats]);

  const mvpPlayer = useMemo(
    () =>
      mvpPlayerId
        ? players.find((p) => p.id === mvpPlayerId) ||
          [...teamA, ...teamB, ...reserves].find((p) => p.id === mvpPlayerId) ||
          null
        : null,
    [mvpPlayerId, players, teamA, teamB, reserves]
  );

  const liveWhatsAppText = useMemo(
    () =>
      formatWhatsAppMatchSummary({
        format: config.format,
        teamAName: config.teamAName,
        teamBName: config.teamBName,
        scoreA,
        scoreB,
        durationSeconds: elapsedSeconds,
        mvpPlayerId: mvpPlayer?.id,
        mvpPlayerName: mvpPlayer?.name,
        notes: matchNotes,
        playerStats: allMatchStats,
      }),
    [
      config,
      scoreA,
      scoreB,
      elapsedSeconds,
      mvpPlayer,
      matchNotes,
      allMatchStats,
    ]
  );

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2800);
  };

  // Career leaderboard sorted list
  const leaderboardPlayers = useMemo(() => {
    return players
      .map((p) => ({
        ...p,
        career: p.stats || getEmptyCareerStats(),
      }))
      .filter(
        (p) =>
          p.career.matches > 0 ||
          p.career.goals > 0 ||
          p.career.assists > 0 ||
          p.career.fouls > 0 ||
          p.career.mvps > 0
      )
      .sort((a, b) => {
        if (leaderboardSort === "goals") {
          if (b.career.goals !== a.career.goals)
            return b.career.goals - a.career.goals;
          return b.career.assists - a.career.assists;
        }
        if (leaderboardSort === "assists") {
          if (b.career.assists !== a.career.assists)
            return b.career.assists - a.career.assists;
          return b.career.goals - a.career.goals;
        }
        if (leaderboardSort === "mvps") {
          if (b.career.mvps !== a.career.mvps)
            return b.career.mvps - a.career.mvps;
          return b.career.goals - a.career.goals;
        }
        if (leaderboardSort === "fouls") {
          const scoreB =
            b.career.redCards * 5 + b.career.yellowCards * 2 + b.career.fouls;
          const scoreA =
            a.career.redCards * 5 + a.career.yellowCards * 2 + a.career.fouls;
          return scoreB - scoreA;
        }
        return b.career.matches - a.career.matches;
      });
  }, [players, leaderboardSort]);

  const seasonTotals = useMemo(() => {
    let goals = 0;
    let fouls = 0;
    let cards = 0;
    for (const m of matchHistory) {
      goals += m.scoreA + m.scoreB;
      for (const ps of m.playerStats) {
        fouls += ps.fouls;
        cards += ps.yellowCards + ps.redCards;
      }
    }
    return {
      matches: matchHistory.length,
      goals,
      avgGoals:
        matchHistory.length > 0
          ? (goals / matchHistory.length).toFixed(1)
          : "0.0",
      fouls,
      cards,
    };
  }, [matchHistory]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Sub-navigation Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-500" />
            <span>Súmula &amp; Estatísticas do Racha</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Registre gols, assistências, faltas, cartões e acompanhe o ranking
            da galera.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:inline-flex p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setSubTab("sheet")}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "sheet"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 shrink-0" />
            <span>Súmula</span>
          </button>
          <button
            onClick={() => setSubTab("leaderboard")}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "leaderboard"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>Ranking</span>
          </button>
          <button
            onClick={() => setSubTab("history")}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "history"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>Histórico ({matchHistory.length})</span>
          </button>
        </div>
      </div>

      {/* ==================== SUB-TAB 1: SÚMULA DA PARTIDA ==================== */}
      {subTab === "sheet" && (
        <>
          {!hasTeamsFormed ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Sorteie os times para abrir a súmula
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Assim que o Time A e o Time B estiverem definidos, você poderá
                  marcar gols, faltas, cartões e salvar o resultado no histórico.
                </p>
              </div>
              <button
                onClick={onGoToBuilder}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/25 transition-all"
              >
                <Shuffle className="w-4 h-4" />
                <span>Ir para Montagem / Sorteio</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {/* SCOREBOARD BANNER */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4">
                {/* Top Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        matchFinished
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          matchFinished
                            ? "bg-emerald-400"
                            : "bg-orange-400 animate-pulse"
                        }`}
                      />
                      {matchFinished ? "Partida Finalizada" : "Súmula Aberta"}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {format.shortName} • {totalFouls} faltas • {totalCards}{" "}
                      cartões
                    </span>
                  </div>

                  {/* Match Timer */}
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-xl px-2.5 py-1">
                    <span className="font-mono tabular-nums text-sm sm:text-base font-extrabold text-white px-1">
                      {formatDuration(elapsedSeconds)}
                    </span>
                    <button
                      onClick={onToggleTimer}
                      title={timerRunning ? "Pausar cronômetro" : "Iniciar cronômetro"}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-orange-500 text-white transition-colors"
                    >
                      {timerRunning ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={onResetTimer}
                      title="Zerar cronômetro"
                      className="p-1.5 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Score Display */}
                <div className="grid grid-cols-11 items-center gap-2 py-2">
                  <div className="col-span-4 text-right">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-400 block">
                      Time A
                    </span>
                    <h3 className="text-sm sm:text-xl font-extrabold truncate">
                      {config.teamAName}
                    </h3>
                  </div>

                  <div className="col-span-3 flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-5xl font-black tabular-nums text-orange-400">
                      {scoreA}
                    </span>
                    <span className="text-base sm:text-xl font-bold text-slate-500">
                      ×
                    </span>
                    <span className="text-3xl sm:text-5xl font-black tabular-nums text-white">
                      {scoreB}
                    </span>
                  </div>

                  <div className="col-span-4 text-left">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Time B
                    </span>
                    <h3 className="text-sm sm:text-xl font-extrabold truncate">
                      {config.teamBName}
                    </h3>
                  </div>
                </div>

                {/* Quick Controls & MVP Selector */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-300 shrink-0">
                      Craque do Jogo:
                    </span>
                    <select
                      value={mvpPlayerId || ""}
                      onChange={(e) =>
                        onSelectMvp(e.target.value ? e.target.value : null)
                      }
                      className="flex-1 sm:w-52 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Selecionar MVP...</option>
                      {teamA.map((p) => (
                        <option key={p.id} value={p.id}>
                          🟠 {p.name}
                        </option>
                      ))}
                      {teamB.map((p) => (
                        <option key={p.id} value={p.id}>
                          ⚫ {p.name}
                        </option>
                      ))}
                      {reserves.map((p) => (
                        <option key={p.id} value={p.id}>
                          🔄 {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setOnlyWithEvents(!onlyWithEvents)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        onlyWithEvents
                          ? "bg-orange-500 border-orange-400 text-white"
                          : "bg-white/10 border-white/15 text-slate-200 hover:bg-white/15"
                      }`}
                    >
                      {onlyWithEvents
                        ? "Mostrando só quem pontuou"
                        : "Filtrar: Só quem pontuou"}
                    </button>
                  </div>
                </div>
              </div>

              {/* TEAM A & TEAM B STAT SHEETS */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
                <TeamStatSheet
                  teamName={config.teamAName}
                  subtitle="Time A • Coletes Laranja"
                  accent="orange"
                  players={teamA}
                  currentStats={currentStats}
                  mvpPlayerId={mvpPlayerId}
                  onlyWithEvents={onlyWithEvents}
                  onUpdateStat={onUpdatePlayerStat}
                  onSelectMvp={onSelectMvp}
                />

                <TeamStatSheet
                  teamName={config.teamBName}
                  subtitle="Time B • Sem Colete"
                  accent="slate"
                  players={teamB}
                  currentStats={currentStats}
                  mvpPlayerId={mvpPlayerId}
                  onlyWithEvents={onlyWithEvents}
                  onUpdateStat={onUpdatePlayerStat}
                  onSelectMvp={onSelectMvp}
                />
              </div>

              {/* RESERVES STAT SHEET (COLLAPSIBLE) */}
              {reserves.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                  <button
                    onClick={() => setShowReserves(!showReserves)}
                    className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Reservas que entraram no jogo ({reserves.length})
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                        • Clique para registrar estatísticas dos reservas
                      </span>
                    </div>
                    {showReserves ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {showReserves && (
                    <div className="p-3.5 sm:p-5 pt-0 space-y-2.5 border-t border-slate-100 dark:border-slate-800">
                      {reserves.map((player) => (
                        <PlayerStatRow
                          key={player.id}
                          player={player}
                          stat={currentStats[player.id]}
                          isMvp={mvpPlayerId === player.id}
                          onUpdateStat={onUpdatePlayerStat}
                          onToggleMvp={() =>
                            onSelectMvp(
                              mvpPlayerId === player.id ? null : player.id
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NATURAL SUMMARY & FINALIZE CARD */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      Resumo Final da Partida
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ao finalizar, as estatísticas vão para o Ranking Geral e
                    Histórico
                  </span>
                </div>

                {/* Natural Narrative Feed */}
                <MatchNarrativeSummary
                  stats={allMatchStats}
                  teamAName={config.teamAName}
                  teamBName={config.teamBName}
                  scoreA={scoreA}
                  scoreB={scoreB}
                  mvpName={mvpPlayer?.name}
                />

                {/* Optional Match Notes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Observações do Racha (opcional)
                  </label>
                  <input
                    type="text"
                    value={matchNotes}
                    onChange={(e) => onChangeNotes(e.target.value)}
                    placeholder="Ex: Jogo muito disputado, gol da vitória no último lance..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2.5 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={onFinishMatch}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-md transition-all active:scale-[0.98] ${
                        matchFinished
                          ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                          : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/25"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        {matchFinished
                          ? "Salvar Nova Cópia no Histórico"
                          : "Finalizar Partida & Salvar Stats"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleCopyText(liveWhatsAppText, "live")}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all"
                    >
                      {copiedId === "live" ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Súmula Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Súmula (WhatsApp)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setShowWhatsAppPreview(!showWhatsAppPreview)
                      }
                      className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                    >
                      {showWhatsAppPreview ? "Ocultar Prévia" : "Ver Prévia"}
                    </button>
                    <button
                      onClick={onResetCurrentSheet}
                      className="px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors"
                    >
                      Zerar Súmula
                    </button>
                  </div>
                </div>

                {showWhatsAppPreview && (
                  <pre className="p-3.5 sm:p-4 rounded-xl bg-slate-950 text-slate-100 text-[11px] sm:text-xs font-mono whitespace-pre-wrap overflow-x-auto border border-slate-800 leading-relaxed">
                    {liveWhatsAppText}
                  </pre>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================== SUB-TAB 2: RANKING GERAL ==================== */}
      {subTab === "leaderboard" && (
        <div className="space-y-4 sm:space-y-5">
          {/* Season KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Jogos Salvos
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                {seasonTotals.matches}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Gols Totais
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {seasonTotals.goals}
                </span>
                <span className="text-xs text-slate-500">
                  ({seasonTotals.avgGoals}/jogo)
                </span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Cartões Aplicados
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                {seasonTotals.cards}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Faltas Marcadas
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                {seasonTotals.fouls}
              </div>
            </div>
          </div>

          {/* Sort Controls & Leaderboard Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span>Ranking Acumulado dos Jogadores</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estatísticas somadas de todas as partidas finalizadas
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: "goals", label: "⚽ Artilharia" },
                    { id: "assists", label: "🎯 Assistências" },
                    { id: "mvps", label: "⭐ Craques" },
                    { id: "fouls", label: "🟨 Disciplina" },
                    { id: "matches", label: "🏃 Presença" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setLeaderboardSort(opt.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      leaderboardSort === opt.id
                        ? "bg-orange-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {leaderboardPlayers.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Flame className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nenhuma estatística acumulada ainda
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Finalize uma partida na aba &ldquo;Súmula&rdquo; para
                  inaugurar o ranking do racha!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-3">Jogador</th>
                      <th className="py-3 px-2.5 text-center">J</th>
                      <th className="py-3 px-2.5 text-center">⚽ Gols</th>
                      <th className="py-3 px-2.5 text-center">🎯 Ass.</th>
                      <th className="py-3 px-2.5 text-center">🛑 Faltas</th>
                      <th className="py-3 px-2.5 text-center">🟨</th>
                      <th className="py-3 px-2.5 text-center">🟥</th>
                      <th className="py-3 px-2.5 text-center">🧤 Def.</th>
                      <th className="py-3 px-4 text-center">⭐ MVP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm tabular-nums">
                    {leaderboardPlayers.map((p, idx) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-extrabold text-slate-400">
                          {idx === 0
                            ? "🥇"
                            : idx === 1
                            ? "🥈"
                            : idx === 2
                            ? "🥉"
                            : `${idx + 1}º`}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {p.name}
                        </td>
                        <td className="py-3 px-2.5 text-center font-semibold text-slate-600 dark:text-slate-300">
                          {p.career.matches}
                        </td>
                        <td className="py-3 px-2.5 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                          {p.career.goals}
                        </td>
                        <td className="py-3 px-2.5 text-center font-bold text-sky-600 dark:text-sky-400">
                          {p.career.assists}
                        </td>
                        <td className="py-3 px-2.5 text-center text-slate-600 dark:text-slate-300">
                          {p.career.fouls}
                        </td>
                        <td className="py-3 px-2.5 text-center font-bold text-amber-600 dark:text-amber-400">
                          {p.career.yellowCards}
                        </td>
                        <td className="py-3 px-2.5 text-center font-bold text-rose-600 dark:text-rose-400">
                          {p.career.redCards}
                        </td>
                        <td className="py-3 px-2.5 text-center text-violet-600 dark:text-violet-400">
                          {p.career.saves}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-amber-500">
                          {p.career.mvps}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {leaderboardPlayers.length > 0 && (
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={onResetCareerStats}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Zerar Ranking da Temporada</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: HISTÓRICO DE PARTIDAS ==================== */}
      {subTab === "history" && (
        <div className="space-y-3">
          {matchHistory.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <History className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhuma partida registrada no histórico
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quando você clicar em &ldquo;Finalizar Partida&rdquo;, o placar
                e todas as estatísticas individuais ficam salvos aqui.
              </p>
            </div>
          ) : (
            matchHistory.map((match) => {
              const isExpanded = expandedMatchId === match.id;
              const dateFormatted = new Date(match.date).toLocaleDateString(
                "pt-BR",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );
              const matchText = formatWhatsAppMatchSummary(match);

              return (
                <div
                  key={match.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {match.format}
                        </span>
                        <span>{dateFormatted}</span>
                        {match.durationSeconds && match.durationSeconds > 0 ? (
                          <span>• ⏱️ {formatDuration(match.durationSeconds)}</span>
                        ) : null}
                        {match.mvpPlayerName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                            ⭐ MVP: {match.mvpPlayerName}
                          </span>
                        )}
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tabular-nums">
                        <span className="text-orange-600 dark:text-orange-400">
                          {match.teamAName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-sm">
                          {match.scoreA} × {match.scoreB}
                        </span>
                        <span>{match.teamBName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyText(matchText, match.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                      >
                        {copiedId === match.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() =>
                          setExpandedMatchId(isExpanded ? null : match.id)
                        }
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                      >
                        <span>Detalhes</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => onDeleteMatchRecord(match.id)}
                        title="Excluir registro da partida"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3">
                      <MatchNarrativeSummary
                        stats={match.playerStats}
                        teamAName={match.teamAName}
                        teamBName={match.teamBName}
                        scoreA={match.scoreA}
                        scoreB={match.scoreB}
                        mvpName={match.mvpPlayerName}
                      />
                      {match.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                          📝 {match.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function TeamStatSheet({
  teamName,
  subtitle,
  accent,
  players,
  currentStats,
  mvpPlayerId,
  onlyWithEvents,
  onUpdateStat,
  onSelectMvp,
}: {
  teamName: string;
  subtitle: string;
  accent: "orange" | "slate";
  players: Player[];
  currentStats: Record<string, PlayerMatchStats>;
  mvpPlayerId: string | null;
  onlyWithEvents: boolean;
  onUpdateStat: (playerId: string, field: StatField, delta: number) => void;
  onSelectMvp: (playerId: string | null) => void;
}) {
  const isOrange = accent === "orange";

  const visiblePlayers = useMemo(() => {
    if (!onlyWithEvents) return players;
    return players.filter((p) => {
      const s = currentStats[p.id];
      if (!s) return false;
      return (
        s.goals > 0 ||
        s.assists > 0 ||
        s.fouls > 0 ||
        s.yellowCards > 0 ||
        s.redCards > 0 ||
        s.saves > 0 ||
        mvpPlayerId === p.id
      );
    });
  }, [players, onlyWithEvents, currentStats, mvpPlayerId]);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
      <div
        className={`px-4 sm:px-5 py-3.5 text-white flex items-center justify-between ${
          isOrange
            ? "bg-gradient-to-r from-orange-500 to-orange-600"
            : "bg-gradient-to-r from-slate-800 to-slate-900"
        }`}
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 block">
            {subtitle}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold">{teamName}</h3>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/15">
          {players.length} atletas
        </span>
      </div>

      <div className="p-3 sm:p-4 space-y-2.5">
        {visiblePlayers.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhum jogador deste time registrou eventos ainda.
          </div>
        ) : (
          visiblePlayers.map((player) => (
            <PlayerStatRow
              key={player.id}
              player={player}
              stat={currentStats[player.id]}
              isMvp={mvpPlayerId === player.id}
              onUpdateStat={onUpdateStat}
              onToggleMvp={() =>
                onSelectMvp(mvpPlayerId === player.id ? null : player.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function PlayerStatRow({
  player,
  stat,
  isMvp,
  onUpdateStat,
  onToggleMvp,
}: {
  player: Player;
  stat?: PlayerMatchStats;
  isMvp: boolean;
  onUpdateStat: (playerId: string, field: StatField, delta: number) => void;
  onToggleMvp: () => void;
}) {
  const safeStat = stat || {
    playerId: player.id,
    playerName: player.name,
    team: "teamA",
    goals: 0,
    assists: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
  };

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        isMvp
          ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/70"
          : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800"
      }`}
    >
      {/* Top Line: Player Name + Position + MVP Button */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
            {player.name}
          </span>
          {player.assignedPosition && (
            <PositionBadge position={player.assignedPosition} size="sm" short />
          )}
        </div>

        <button
          onClick={onToggleMvp}
          title="Marcar como Craque do Jogo (MVP)"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
            isMvp
              ? "bg-amber-400 text-slate-950 shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-400 hover:text-amber-500 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <Star className={`w-3 h-3 ${isMvp ? "fill-slate-950" : ""}`} />
          <span>MVP</span>
        </button>
      </div>

      {/* Stat Steppers Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {STAT_COLUMNS.map((col) => {
          const val = safeStat[col.key];
          const isPositive = val > 0;
          return (
            <div
              key={col.key}
              className={`flex flex-col items-center justify-between p-1.5 rounded-lg border transition-colors ${
                isPositive
                  ? col.activeBg
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/70"
              }`}
            >
              <span
                className={`text-[10px] font-bold flex items-center gap-0.5 ${
                  isPositive
                    ? col.activeText
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span>{col.emoji}</span>
                <span>{col.shortLabel}</span>
              </span>

              <div className="flex items-center justify-between w-full mt-1 gap-0.5">
                <button
                  type="button"
                  onClick={() => onUpdateStat(player.id, col.key, -1)}
                  disabled={val === 0}
                  aria-label={`Diminuir ${col.label} de ${player.name}`}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition-all"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span
                  className={`text-xs font-extrabold tabular-nums ${
                    isPositive
                      ? col.activeText
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {val}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateStat(player.id, col.key, 1)}
                  aria-label={`Adicionar ${col.label} para ${player.name}`}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-orange-100 dark:hover:bg-orange-950/60 hover:text-orange-600 active:scale-90 transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchNarrativeSummary({
  stats,
  teamAName,
  teamBName,
  scoreA,
  scoreB,
  mvpName,
}: {
  stats: PlayerMatchStats[];
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  mvpName?: string;
}) {
  const scorers = stats
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals);
  const assisters = stats
    .filter((s) => s.assists > 0)
    .sort((a, b) => b.assists - a.assists);
  const discipline = stats
    .filter((s) => s.fouls > 0 || s.yellowCards > 0 || s.redCards > 0)
    .sort(
      (a, b) =>
        b.redCards * 5 +
        b.yellowCards * 2 +
        b.fouls -
        (a.redCards * 5 + a.yellowCards * 2 + a.fouls)
    );
  const keepers = stats
    .filter((s) => s.saves > 0)
    .sort((a, b) => b.saves - a.saves);

  const hasAnyEvent =
    scorers.length > 0 ||
    assisters.length > 0 ||
    discipline.length > 0 ||
    keepers.length > 0 ||
    !!mvpName;

  if (!hasAnyEvent) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        Placar atual: <strong>{teamAName}</strong> {scoreA} × {scoreB}{" "}
        <strong>{teamBName}</strong>. Use os botões <strong>+</strong> nos
        jogadores acima para registrar gols, assistências, faltas e cartões.
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
      {scorers.length > 0 && (
        <div>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            ⚽ Gols:{" "}
          </span>
          {scorers
            .map(
              (s) =>
                `${s.playerName} (${s.goals} ${
                  s.goals === 1 ? "gol" : "gols"
                })`
            )
            .join(" • ")}
        </div>
      )}
      {assisters.length > 0 && (
        <div>
          <span className="font-extrabold text-sky-600 dark:text-sky-400">
            🎯 Assistências:{" "}
          </span>
          {assisters
            .map(
              (s) =>
                `${s.playerName} (${s.assists} ${
                  s.assists === 1 ? "assist." : "assists."
                })`
            )
            .join(" • ")}
        </div>
      )}
      {keepers.length > 0 && (
        <div>
          <span className="font-extrabold text-violet-600 dark:text-violet-400">
            🧤 Defesas:{" "}
          </span>
          {keepers.map((s) => `${s.playerName} (${s.saves})`).join(" • ")}
        </div>
      )}
      {discipline.length > 0 && (
        <div>
          <span className="font-extrabold text-amber-600 dark:text-amber-400">
            🟨 Faltas &amp; Cartões:{" "}
          </span>
          {discipline
            .map((s) => {
              const parts: string[] = [];
              if (s.fouls > 0)
                parts.push(`${s.fouls} ${s.fouls === 1 ? "falta" : "faltas"}`);
              if (s.yellowCards > 0) parts.push(`${s.yellowCards} amarelo`);
              if (s.redCards > 0) parts.push(`${s.redCards} vermelho`);
              return `${s.playerName} (${parts.join(", ")})`;
            })
            .join(" • ")}
        </div>
      )}
      {mvpName && (
        <div>
          <span className="font-extrabold text-amber-500">
            ⭐ Craque do Jogo:{" "}
          </span>
          <strong>{mvpName}</strong>
        </div>
      )}
    </div>
  );
}
