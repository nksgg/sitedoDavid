"use client";

import React from "react";
import { BuilderMode, MatchFormatId, TeamConfig } from "@/types/soccer";
import { MATCH_FORMATS } from "@/data/mockPlayers";
import {
  ShieldCheck,
  Sparkles,
  Hand,
  SlidersHorizontal,
  Users,
  MousePointerClick,
  Minus,
  Plus,
} from "lucide-react";

interface MatchConfigBarProps {
  config: TeamConfig;
  onUpdateConfig: (partial: Partial<TeamConfig>) => void;
  builderMode: BuilderMode;
  onChangeBuilderMode: (mode: BuilderMode) => void;
  availableCount: number;
}

const FORMAT_IDS: MatchFormatId[] = [
  "1x1",
  "2x2",
  "3x3",
  "4x4",
  "5x5",
  "6x6",
  "7x7",
  "8x8",
  "9x9",
  "10x10",
  "11x11",
];

export function MatchConfigBar({
  config,
  onUpdateConfig,
  builderMode,
  onChangeBuilderMode,
  availableCount,
}: MatchConfigBarProps) {
  const currentFormat = MATCH_FORMATS[config.format] ?? MATCH_FORMATS["5x5"];
  const currentPlayersPerTeam = currentFormat.playersPerTeam;
  const hasEnough = availableCount >= currentFormat.totalStarters;

  const handlePlayersPerTeamChange = (count: number) => {
    const clamped = Math.max(1, Math.min(11, count));
    onUpdateConfig({ format: `${clamped}x${clamped}` as MatchFormatId });
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
      {/* Top Row: Format Selection & Mode Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Match Format Selector (1x1 to 11x11) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="match-format-select"
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>1. Formato da Partida</span>
            </label>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              {availableCount} disponíveis
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl border border-orange-500/70 bg-orange-50/60 dark:bg-orange-950/25 space-y-3">
            {/* Top info + Stepper & Select */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg sm:text-xl font-extrabold text-orange-600 dark:text-orange-400 shrink-0">
                  {currentFormat.shortName}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentFormat.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        hasEnough
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                      }`}
                    >
                      {currentFormat.totalStarters} tit.
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentFormat.playersPerTeam}{" "}
                    {currentFormat.playersPerTeam === 1 ? "jogador" : "jogadores"}{" "}
                    por time
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handlePlayersPerTeamChange(currentPlayersPerTeam - 1)
                  }
                  disabled={currentPlayersPerTeam <= 1}
                  aria-label="Diminuir jogadores por time"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <select
                  id="match-format-select"
                  value={config.format}
                  onChange={(e) =>
                    onUpdateConfig({ format: e.target.value as MatchFormatId })
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 cursor-pointer"
                >
                  {FORMAT_IDS.map((fId) => {
                    const fmt = MATCH_FORMATS[fId];
                    return (
                      <option key={fId} value={fId}>
                        {fmt.shortName} — {fmt.name}
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    handlePlayersPerTeamChange(currentPlayersPerTeam + 1)
                  }
                  disabled={currentPlayersPerTeam >= 11}
                  aria-label="Aumentar jogadores por time"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Range Slider 1x1 to 11x11 */}
            <div className="space-y-1">
              <input
                type="range"
                min={1}
                max={11}
                step={1}
                value={currentPlayersPerTeam}
                onChange={(e) =>
                  handlePlayersPerTeamChange(Number(e.target.value))
                }
                aria-label="Selecionar formato de 1x1 até 11x11"
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => handlePlayersPerTeamChange(1)}
                  className={`hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${
                    currentPlayersPerTeam === 1
                      ? "text-orange-600 dark:text-orange-400 font-bold"
                      : ""
                  }`}
                >
                  1x1
                </button>
                <button
                  type="button"
                  onClick={() => handlePlayersPerTeamChange(5)}
                  className={`hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${
                    currentPlayersPerTeam === 5
                      ? "text-orange-600 dark:text-orange-400 font-bold"
                      : ""
                  }`}
                >
                  5x5
                </button>
                <button
                  type="button"
                  onClick={() => handlePlayersPerTeamChange(7)}
                  className={`hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${
                    currentPlayersPerTeam === 7
                      ? "text-orange-600 dark:text-orange-400 font-bold"
                      : ""
                  }`}
                >
                  7x7
                </button>
                <button
                  type="button"
                  onClick={() => handlePlayersPerTeamChange(11)}
                  className={`hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${
                    currentPlayersPerTeam === 11
                      ? "text-orange-600 dark:text-orange-400 font-bold"
                      : ""
                  }`}
                >
                  11x11 Tradicional
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Builder Mode Switcher (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>2. Modo de Montagem</span>
          </label>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => onChangeBuilderMode("auto")}
              className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between ${
                builderMode === "auto"
                  ? "border-slate-900 dark:border-orange-500 bg-slate-900 dark:bg-slate-800 text-white shadow-md shadow-slate-900/15"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Sparkles
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    builderMode === "auto" ? "text-orange-400" : "text-orange-500"
                  }`}
                />
                {builderMode === "auto" && (
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                    Ativo
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold leading-tight">
                  Sorteio Automático
                </div>
                <div
                  className={`text-[10px] sm:text-[11px] mt-0.5 leading-tight ${
                    builderMode === "auto"
                      ? "text-slate-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Sorteia times e posições
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeBuilderMode("manual")}
              className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between ${
                builderMode === "manual"
                  ? "border-slate-900 dark:border-orange-500 bg-slate-900 dark:bg-slate-800 text-white shadow-md shadow-slate-900/15"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <MousePointerClick
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    builderMode === "manual" ? "text-orange-400" : "text-orange-500"
                  }`}
                />
                {builderMode === "manual" && (
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                    Ativo
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold leading-tight">
                  Manual (Draft)
                </div>
                <div
                  className={`text-[10px] sm:text-[11px] mt-0.5 leading-tight ${
                    builderMode === "manual"
                      ? "text-slate-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Escale 1 a 1 nos times
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Goalkeeper Rule, Position Balancing & Team Names */}
      <div className="pt-3.5 sm:pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Goalkeeper Lock Toggle */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:border-orange-300 transition-colors">
          <input
            type="checkbox"
            checked={config.balanceGoalkeepers}
            onChange={(e) =>
              onUpdateConfig({ balanceGoalkeepers: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
          />
          <div className="text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Garantir 1 Goleiro por Time</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Define 1 Goleiro fixo no Time A e 1 no Time B ao sortear.
            </p>
          </div>
        </label>

        {/* Positional / Skill Balance Toggle */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:border-orange-300 transition-colors">
          <input
            type="checkbox"
            checked={config.balancePositions}
            onChange={(e) =>
              onUpdateConfig({ balancePositions: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
          />
          <div className="text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Formação & Força Equilibrada</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Distribui ZAG, MEI e ATA na proporção certa do {config.format}.
            </p>
          </div>
        </label>

        {/* Team Names Inputs */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <label className="block text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400 mb-1">
              Nome Time A
            </label>
            <input
              type="text"
              value={config.teamAName}
              onChange={(e) => onUpdateConfig({ teamAName: e.target.value })}
              className="w-full px-2.5 py-1.5 sm:py-1 rounded-lg text-sm sm:text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Nome Time B
            </label>
            <input
              type="text"
              value={config.teamBName}
              onChange={(e) => onUpdateConfig({ teamBName: e.target.value })}
              className="w-full px-2.5 py-1.5 sm:py-1 rounded-lg text-sm sm:text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
