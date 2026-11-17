"use client";

import React, { useState, useMemo } from "react";
import { MatchFormatId, Player } from "@/types/soccer";
import { MATCH_FORMATS } from "@/data/mockPlayers";
import { PositionBadge } from "./PositionBadge";
import {
  Search,
  UserPlus,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Star,
  Users,
  ArrowRight,
  RotateCcw,
  CheckCheck,
  Sparkles,
} from "lucide-react";

interface PlayerManagementProps {
  players: Player[];
  selectedFormat: MatchFormatId;
  onToggleStatus: (id: string) => void;
  onQuickAddPlayer: (name: string) => void;
  onOpenModalForEdit: (player: Player) => void;
  onOpenModalForNew: () => void;
  onDeletePlayer: (id: string) => void;
  onSetAllAvailable: () => void;
  onResetMockData: () => void;
  onGoToBuilder: () => void;
}

export function PlayerManagement({
  players,
  selectedFormat,
  onToggleStatus,
  onQuickAddPlayer,
  onOpenModalForEdit,
  onOpenModalForNew,
  onDeletePlayer,
  onSetAllAvailable,
  onResetMockData,
  onGoToBuilder,
}: PlayerManagementProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "unavailable"
  >("all");

  // Quick Inline Add State (somente nome — posição será sorteada depois!)
  const [quickName, setQuickName] = useState("");

  const format = MATCH_FORMATS[selectedFormat];

  const stats = useMemo(() => {
    const available = players.filter((p) => p.status === "available");
    return {
      total: players.length,
      available: available.length,
      unavailable: players.length - available.length,
    };
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [players, search, statusFilter]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    onQuickAddPlayer(quickName.trim());
    setQuickName("");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top KPI Summary Cards (2x2 on mobile, 4 cols on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Elenco
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {stats.unavailable} fora hoje
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Disponíveis
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.available}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              / {format.totalStarters}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {stats.available >= format.totalStarters
              ? `+${stats.available - format.totalStarters} reserva(s)`
              : `Faltam ${format.totalStarters - stats.available} p/ ${format.shortName}`}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Posições
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
            No Sorteio
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            GOL, ZAG, MEI e ATA
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20 flex flex-col justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange-100">
              Partida {format.shortName}
            </span>
            <h3 className="text-sm sm:text-lg font-extrabold leading-tight mt-0.5">
              Sortear Times
            </h3>
          </div>
          <button
            onClick={onGoToBuilder}
            className="mt-2 sm:mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 active:scale-95 font-extrabold text-[11px] sm:text-xs shadow-xs transition-all"
          >
            <span>Ir p/ Sorteio</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Quick Inline Add Bar (Mobile-optimized with 16px input to prevent iOS zoom) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Cadastro Rápido de Jogador</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Digite o nome do atleta para confirmar presença. A posição será definida no sorteio!
            </p>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              type="button"
              onClick={onSetAllAvailable}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 active:scale-95 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Confirmar Todos</span>
            </button>
            <button
              type="button"
              onClick={onResetMockData}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
              title="Restaurar jogadores iniciais de demonstração"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleQuickSubmit}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <input
            type="text"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Nome ou apelido (ex: Neymar Jr, Cadu)..."
            className="flex-1 px-4 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={!quickName.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm shadow-sm shadow-orange-500/20 transition-all min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar Jogador</span>
          </button>
        </form>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jogador por nome..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Status Filters (Full-width 3-col segmented control on mobile) */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          {(
            [
              { id: "all", label: `Todos (${stats.total})` },
              { id: "available", label: `Prontos (${stats.available})` },
              { id: "unavailable", label: `Fora (${stats.unavailable})` },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center truncate ${
                statusFilter === st.id
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Nenhum jogador encontrado com esses filtros
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Tente limpar a busca ou cadastre um novo atleta para o racha.
          </p>
          <button
            onClick={onOpenModalForNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Jogador</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {filteredPlayers.map((player) => {
            const isAvailable = player.status === "available";
            return (
              <div
                key={player.id}
                className={`group relative rounded-2xl p-3.5 sm:p-4 border transition-all flex flex-col justify-between gap-3 ${
                  isAvailable
                    ? "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700/70 shadow-xs"
                    : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar Initial */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                        isAvailable
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60"
                          : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                      }`}
                    >
                      {player.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3
                        className={`text-sm font-bold truncate ${
                          isAvailable
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 dark:text-slate-400 line-through"
                        }`}
                      >
                        {player.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {player.assignedPosition ? (
                          <PositionBadge
                            position={player.assignedPosition}
                            size="sm"
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            <Sparkles className="w-2.5 h-2.5 text-orange-500 shrink-0" />
                            <span>Posição no sorteio</span>
                          </span>
                        )}
                        <div
                          className="flex items-center gap-0.5 text-amber-400"
                          title={`Nível ${player.skillLevel}/5`}
                        >
                          {Array.from({ length: player.skillLevel || 3 }).map(
                            (_, idx) => (
                              <Star
                                key={idx}
                                className="w-3 h-3 fill-amber-400 text-amber-400"
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit / Delete Icons (Always visible & touch-sized on mobile) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenModalForEdit(player)}
                      title="Editar jogador"
                      className="p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-orange-500 active:bg-orange-50 dark:active:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePlayer(player.id)}
                      title="Remover jogador"
                      className="p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-500 active:bg-rose-50 dark:active:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Toggle Bar (Full touch area on mobile) */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Presença no Racha:
                  </span>
                  <button
                    onClick={() => onToggleStatus(player.id)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] active:scale-95 ${
                      isAvailable
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                        : "bg-slate-200/80 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Disponível</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Indisponível</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
