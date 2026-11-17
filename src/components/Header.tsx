"use client";

import React from "react";
import { ActiveTab, MatchFormatId } from "@/types/soccer";
import { MATCH_FORMATS } from "@/data/mockPlayers";
import {
  Users,
  Shuffle,
  Trophy,
  Sun,
  Moon,
  Plus,
  Flame,
} from "lucide-react";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  availableCount: number;
  totalCount: number;
  selectedFormat: MatchFormatId;
  hasTeamsFormed: boolean;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenNewPlayerModal: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  availableCount,
  totalCount,
  selectedFormat,
  hasTeamsFormed,
  darkMode,
  setDarkMode,
  onOpenNewPlayerModal,
}: HeaderProps) {
  const format = MATCH_FORMATS[selectedFormat];
  const isReady = availableCount >= format.totalStarters;

  const tabs: {
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    badge?: string | number;
    highlight?: boolean;
  }[] = [
    {
      id: "roster",
      label: "1. Gestão de Jogadores",
      shortLabel: "Elenco",
      icon: Users,
      badge: `${availableCount}/${totalCount}`,
    },
    {
      id: "builder",
      label: "2. Montar / Sortear Times",
      shortLabel: "Sortear",
      icon: Shuffle,
      badge: format.shortName,
    },
    {
      id: "matchup",
      label: "3. Confronto & WhatsApp",
      shortLabel: "Confronto",
      icon: Trophy,
      highlight: hasTeamsFormed,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Brand Logo */}
            <div
              onClick={() => setActiveTab("roster")}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 shrink-0 group-active:scale-95 transition-transform">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                    Futebol<span className="text-orange-500">Sorter</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
                    PRO Racha
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                  Gerenciador e Sorteador Inteligente de Partidas
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                    {tab.highlight && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile/Desktop Status Pill */}
              <div
                onClick={() => setActiveTab("builder")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border cursor-pointer ${
                  isReady
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
                }`}
                title={`Confirmados: ${availableCount} de ${format.totalStarters} titulares para ${format.name}`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isReady ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span>
                  {availableCount}/{format.totalStarters}{" "}
                  <span className="hidden xs:inline">({format.shortName})</span>
                </span>
              </div>

              {/* Quick Add Player Button */}
              <button
                onClick={onOpenNewPlayerModal}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-sm shadow-orange-500/20 transition-all min-h-[38px]"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Novo Jogador</span>
                <span className="sm:hidden">Atleta</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Alternar tema claro/escuro"
                className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Navigation Bar for Mobile Devices (< md) */}
      <nav
        aria-label="Navegação principal mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800/90 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-3 gap-1.5 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-h-[52px] ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                    : "text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {tab.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  )}
                </div>
                <span className="text-[11px] font-extrabold mt-0.5 tracking-tight">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
