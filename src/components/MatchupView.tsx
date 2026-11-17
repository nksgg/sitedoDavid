"use client";

import React, { useState, useMemo } from "react";
import { Player, Position, TeamConfig } from "@/types/soccer";
import { MATCH_FORMATS } from "@/data/mockPlayers";
import {
  formatWhatsAppLineup,
  getTeamStats,
  sortPlayersByPosition,
} from "@/utils/teamSorter";
import { PositionBadge } from "./PositionBadge";
import {
  Copy,
  Check,
  Shuffle,
  ArrowLeft,
  Share2,
  Trophy,
  Star,
  Hand,
  Users,
  LayoutGrid,
  MapPin,
  ArrowLeftRight,
  Dices,
} from "lucide-react";

interface MatchupViewProps {
  teamA: Player[];
  teamB: Player[];
  reserves: Player[];
  config: TeamConfig;
  lastSortedAt: string | null;
  onReSort: () => void;
  onReshufflePositionsOnly: () => void;
  onChangePlayerPosition: (playerId: string, newPosition: Position) => void;
  onSwapTeam: (player: Player, target: "teamA" | "teamB" | "reserves") => void;
  onBackToBuilder: () => void;
}

const POSITIONS_ORDER: Position[] = [
  "Goleiro",
  "Zagueiro",
  "Meio-campista",
  "Atacante",
];

export function MatchupView({
  teamA,
  teamB,
  reserves,
  config,
  lastSortedAt,
  onReSort,
  onReshufflePositionsOnly,
  onChangePlayerPosition,
  onSwapTeam,
  onBackToBuilder,
}: MatchupViewProps) {
  const [copied, setCopied] = useState(false);
  const [viewStyle, setViewStyle] = useState<"cards" | "pitch">("cards");
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);

  const format = MATCH_FORMATS[config.format];
  const statsA = useMemo(() => getTeamStats(teamA), [teamA]);
  const statsB = useMemo(() => getTeamStats(teamB), [teamB]);

  const whatsAppText = useMemo(
    () => formatWhatsAppLineup(teamA, teamB, reserves, config),
    [teamA, teamB, reserves, config]
  );

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = whatsAppText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (teamA.length === 0 && teamB.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
          <Trophy className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            Nenhum Confronto Formado Ainda
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Realize o sorteio automático de times e posições agora mesmo ou
            volte para a aba de montagem.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2 max-w-sm sm:max-w-none mx-auto">
          <button
            onClick={onReSort}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/25 transition-all min-h-[44px]"
          >
            <Shuffle className="w-4 h-4" />
            <span>Sortear Times e Posições</span>
          </button>
          <button
            onClick={onBackToBuilder}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold hover:bg-slate-200 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ir para Montagem</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Confrontation Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950 text-white p-4 sm:p-6 border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs font-bold text-orange-400 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>
              Escalação • {format.name} ({format.shortName})
            </span>
            {lastSortedAt && (
              <span className="text-slate-400 font-normal">
                • {lastSortedAt}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold">
            {config.teamAName}{" "}
            <span className="text-orange-500 px-1">VS</span>{" "}
            {config.teamBName}
          </h2>
          <p className="text-xs text-slate-300">
            Confira onde cada atleta vai jogar, ajuste se desejar e copie para o
            WhatsApp.
          </p>
        </div>

        {/* Mobile-Optimized Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
          {/* Primary CTA on Mobile: Copy WhatsApp */}
          <button
            onClick={handleCopyWhatsApp}
            className={`sm:order-4 inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-lg transition-all cursor-pointer min-h-[46px] active:scale-[0.98] ${
              copied
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>Escalação Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" />
                <span>Copiar Escalação (WhatsApp)</span>
              </>
            )}
          </button>

          {/* Secondary Controls Row */}
          <div className="grid grid-cols-3 sm:flex items-center gap-2">
            {/* View Toggle */}
            <div className="col-span-3 sm:col-span-1 grid grid-cols-2 sm:flex items-center bg-white/10 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewStyle("cards")}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewStyle === "cards"
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewStyle("pitch")}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewStyle === "pitch"
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Campinho</span>
              </button>
            </div>

            <button
              onClick={onReshufflePositionsOnly}
              title="Mantém os times e sorteia novamente apenas as posições dentro de cada equipe"
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/15 transition-all"
            >
              <Dices className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Sortear Posições</span>
            </button>

            <button
              onClick={onReSort}
              className="col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/15 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Re-Sortear</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: CLEAN LINEUP CARDS BY POSITION */}
      {viewStyle === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <LineupCard
            teamName={config.teamAName}
            subtitle="Time A • Coletes Laranja"
            accent="orange"
            players={teamA}
            limit={format.playersPerTeam}
            stats={statsA}
            onChangePlayerPosition={onChangePlayerPosition}
            onSwapOtherTeam={(p) => onSwapTeam(p, "teamB")}
          />

          <LineupCard
            teamName={config.teamBName}
            subtitle="Time B • Sem Colete"
            accent="slate"
            players={teamB}
            limit={format.playersPerTeam}
            stats={statsB}
            onChangePlayerPosition={onChangePlayerPosition}
            onSwapOtherTeam={(p) => onSwapTeam(p, "teamA")}
          />
        </div>
      ) : (
        /* VIEW 2: TACTICAL PITCH VISUALIZATION */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TacticalPitchCard
            teamName={config.teamAName}
            accent="orange"
            players={teamA}
          />
          <TacticalPitchCard
            teamName={config.teamBName}
            accent="slate"
            players={teamB}
          />
        </div>
      )}

      {/* RESERVES / NEXT UP SECTION */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 sm:mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Lista de Reservas / De Próxima ({reserves.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Jogadores aguardando rodízio ou substituição
              </p>
            </div>
          </div>
        </div>

        {reserves.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400 text-center">
            Não há jogadores excedentes na reserva para esta partida.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {reserves.map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                    R{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {player.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onSwapTeam(player, "teamA")}
                    title={`Mover para ${config.teamAName}`}
                    className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[10px] font-bold hover:bg-orange-200 active:scale-95"
                  >
                    → Time A
                  </button>
                  <button
                    onClick={() => onSwapTeam(player, "teamB")}
                    title={`Mover para ${config.teamBName}`}
                    className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold hover:bg-slate-300 active:scale-95"
                  >
                    → Time B
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WHATSAPP TEXT PREVIEW & SHARE CARD */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Texto Formatado para Grupo do WhatsApp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inclui os times e a posição sorteada de cada jogador
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              onClick={() => setShowWhatsAppPreview(!showWhatsAppPreview)}
              className="px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
            >
              {showWhatsAppPreview ? "Ocultar Prévia" : "Ver Prévia"}
            </button>
            <button
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showWhatsAppPreview && (
          <pre className="p-3.5 sm:p-4 rounded-xl bg-slate-950 text-slate-100 text-[11px] sm:text-xs font-mono whitespace-pre-wrap overflow-x-auto border border-slate-800 leading-relaxed">
            {whatsAppText}
          </pre>
        )}
      </div>
    </div>
  );
}

interface LineupCardProps {
  teamName: string;
  subtitle: string;
  accent: "orange" | "slate";
  players: Player[];
  limit: number;
  stats: ReturnType<typeof getTeamStats>;
  onChangePlayerPosition: (playerId: string, newPosition: Position) => void;
  onSwapOtherTeam: (player: Player) => void;
}

function LineupCard({
  teamName,
  subtitle,
  accent,
  players,
  limit,
  stats,
  onChangePlayerPosition,
  onSwapOtherTeam,
}: LineupCardProps) {
  const isOrange = accent === "orange";
  const sorted = sortPlayersByPosition(players);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Team Banner */}
      <div
        className={`p-4 sm:p-5 text-white flex items-center justify-between gap-2 ${
          isOrange
            ? "bg-gradient-to-r from-orange-500 to-orange-600"
            : "bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950"
        }`}
      >
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider opacity-85 block truncate">
            {subtitle}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold mt-0.5 truncate">
            {teamName}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-[11px] sm:text-xs font-extrabold">
            <span>
              {players.length}/{limit} Titulares
            </span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[11px] sm:text-xs mt-1 opacity-90">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Média: {stats.avgSkill}</span>
          </div>
        </div>
      </div>

      {/* Position Summary Strip */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="font-bold text-slate-600 dark:text-slate-300">
            GOL: {stats.counts.Goleiro}
          </span>
          <span className="font-bold text-slate-600 dark:text-slate-300">
            ZAG: {stats.counts.Zagueiro}
          </span>
          <span className="font-bold text-slate-600 dark:text-slate-300">
            MEI: {stats.counts["Meio-campista"]}
          </span>
          <span className="font-bold text-slate-600 dark:text-slate-300">
            ATA: {stats.counts.Atacante}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1 font-bold ${
            stats.hasGoalkeeper
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          <Hand className="w-3.5 h-3.5 shrink-0" />
          {stats.hasGoalkeeper ? "Com Goleiro" : "Sem Goleiro"}
        </span>
      </div>

      {/* Grouped by Assigned Position */}
      <div className="p-3.5 sm:p-5 space-y-4 flex-1">
        {POSITIONS_ORDER.map((pos) => {
          const group = sorted.filter(
            (p) => (p.assignedPosition || "Meio-campista") === pos
          );
          if (group.length === 0) return null;

          return (
            <div key={pos} className="space-y-2">
              <div className="flex items-center justify-between">
                <PositionBadge position={pos} size="sm" />
                <span className="text-[11px] font-semibold text-slate-400">
                  {group.length} {group.length === 1 ? "atleta" : "atletas"}
                </span>
              </div>
              <div className="space-y-1.5">
                {group.map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                          isOrange
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {player.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {player.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 shrink-0">
                      <select
                        value={player.assignedPosition || "Meio-campista"}
                        onChange={(e) =>
                          onChangePlayerPosition(
                            player.id,
                            e.target.value as Position
                          )
                        }
                        title="Alterar posição onde este jogador vai atuar"
                        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                      >
                        {POSITIONS_ORDER.map((pOpt) => (
                          <option key={pOpt} value={pOpt}>
                            {pOpt}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => onSwapOtherTeam(player)}
                        title="Trocar jogador para o outro time"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white sm:bg-transparent dark:bg-slate-900 sm:dark:bg-transparent border sm:border-0 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>Trocar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TacticalPitchCard({
  teamName,
  accent,
  players,
}: {
  teamName: string;
  accent: "orange" | "slate";
  players: Player[];
}) {
  const isOrange = accent === "orange";
  const gks = players.filter((p) => p.assignedPosition === "Goleiro");
  const defs = players.filter((p) => p.assignedPosition === "Zagueiro");
  const mids = players.filter(
    (p) => (p.assignedPosition || "Meio-campista") === "Meio-campista"
  );
  const atts = players.filter((p) => p.assignedPosition === "Atacante");

  const renderRow = (rowPlayers: Player[], roleLabel: string) => (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-1.5 sm:py-2">
      {rowPlayers.length === 0 ? (
        <span className="text-[10px] sm:text-[11px] text-emerald-100/60 italic">
          Sem {roleLabel}
        </span>
      ) : (
        rowPlayers.map((p) => (
          <div
            key={p.id}
            className="flex flex-col items-center text-center max-w-[78px] sm:max-w-[110px]"
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-[11px] sm:text-xs shadow-md border-2 border-white ${
                p.assignedPosition === "Goleiro"
                  ? "bg-amber-500 text-slate-950"
                  : isOrange
                  ? "bg-orange-500 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              {p.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="mt-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] sm:text-[11px] font-bold truncate max-w-full shadow-xs">
              {p.name}
            </span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div
        className={`px-4 py-3 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between ${
          isOrange ? "bg-orange-500" : "bg-slate-800"
        }`}
      >
        <span className="truncate">Campinho Tático • {teamName}</span>
        <span className="text-[11px] sm:text-xs opacity-85 shrink-0">
          {players.length} em campo
        </span>
      </div>

      {/* Soccer Field Container */}
      <div className="relative bg-gradient-to-b from-emerald-700 via-emerald-600 to-emerald-700 p-3 sm:p-5 min-h-[320px] sm:min-h-[380px] flex flex-col justify-between border-4 border-emerald-800">
        {/* Field Markings */}
        <div className="pointer-events-none absolute inset-3 sm:inset-4 border-2 border-white/25 rounded-lg" />
        <div className="pointer-events-none absolute left-3 right-3 sm:left-4 sm:right-4 top-1/2 h-0.5 bg-white/25" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/25" />

        {/* Attackers Top */}
        <div className="relative z-10">{renderRow(atts, "Atacante")}</div>
        {/* Midfielders */}
        <div className="relative z-10">{renderRow(mids, "Meio-campista")}</div>
        {/* Defenders */}
        <div className="relative z-10">{renderRow(defs, "Zagueiro")}</div>
        {/* Goalkeeper Bottom */}
        <div className="relative z-10">{renderRow(gks, "Goleiro")}</div>
      </div>
    </div>
  );
}
