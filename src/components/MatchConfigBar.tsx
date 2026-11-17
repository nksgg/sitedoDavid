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
} from "lucide-react";

interface MatchConfigBarProps {
  config: TeamConfig;
  onUpdateConfig: (partial: Partial<TeamConfig>) => void;
  builderMode: BuilderMode;
  onChangeBuilderMode: (mode: BuilderMode) => void;
  availableCount: number;
}

const FORMAT_IDS: MatchFormatId[] = ["5x5", "7x7", "11x11"];

export function MatchConfigBar({
  config,
  onUpdateConfig,
  builderMode,
  onChangeBuilderMode,
  availableCount,
}: MatchConfigBarProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
      {/* Top Row: Format Selection & Mode Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Match Format Cards (Side-by-side 3 cols even on mobile!) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>1. Formato da Partida</span>
            </label>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              {availableCount} disponíveis
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {FORMAT_IDS.map((fId) => {
              const fmt = MATCH_FORMATS[fId];
              const isSelected = config.format === fId;
              const hasEnough = availableCount >= fmt.totalStarters;

              return (
                <button
                  key={fId}
                  type="button"
                  onClick={() => onUpdateConfig({ format: fId })}
                  className={`relative p-2.5 sm:p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? "border-orange-500 bg-orange-50/80 dark:bg-orange-950/30 ring-2 ring-orange-500/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-sm sm:text-base font-extrabold ${
                        isSelected
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {fmt.shortName}
                    </span>
                    <span
                      className={`self-start sm:self-auto text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
                        hasEnough
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                      }`}
                    >
                      {fmt.totalStarters} tit.
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {fmt.name}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden xs:block">
                    {fmt.playersPerTeam} por time
                  </div>
                </button>
              );
            })}
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
                  ? "border-orange-500 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-orange-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Sparkles
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    builderMode === "auto" ? "text-white" : "text-orange-500"
                  }`}
                />
                {builderMode === "auto" && (
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white">
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
                      ? "text-orange-100"
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
                  ? "border-orange-500 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-orange-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <MousePointerClick
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    builderMode === "manual" ? "text-white" : "text-orange-500"
                  }`}
                />
                {builderMode === "manual" && (
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white">
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
                      ? "text-orange-100"
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
