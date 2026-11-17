"use client";

import React, { useState, useEffect } from "react";
import { Player, PlayerStatus } from "@/types/soccer";
import {
  X,
  UserPlus,
  Star,
  CheckCircle2,
  XCircle,
  Save,
  Sparkles,
} from "lucide-react";

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerData: Omit<Player, "id">, editingId?: string) => void;
  editingPlayer?: Player | null;
}

export function PlayerModal({
  isOpen,
  onClose,
  onSave,
  editingPlayer,
}: PlayerModalProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<PlayerStatus>("available");
  const [skillLevel, setSkillLevel] = useState<number>(4);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingPlayer) {
      setName(editingPlayer.name);
      setStatus(editingPlayer.status);
      setSkillLevel(editingPlayer.skillLevel || 4);
      setError("");
    } else {
      setName("");
      setStatus("available");
      setSkillLevel(4);
      setError("");
    }
  }, [editingPlayer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Por favor, informe o nome ou apelido do jogador.");
      return;
    }
    onSave(
      {
        name: trimmed,
        status,
        skillLevel,
        assignedPosition: editingPlayer?.assignedPosition,
      },
      editingPlayer?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle Indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-orange-500">
          <div className="w-10 h-1 rounded-full bg-white/40" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15 shrink-0">
              {editingPlayer ? (
                <Save className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold">
                {editingPlayer ? "Editar Jogador" : "Cadastrar Novo Jogador"}
              </h2>
              <p className="text-xs text-orange-100">
                A posição em campo será sorteada na montagem dos times
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-5"
        >
          {/* Info Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60 text-xs text-orange-800 dark:text-orange-200">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <span>
              <strong>Sem posição fixa no cadastro:</strong> onde cada atleta
              vai jogar (Goleiro, Zagueiro, Meia ou Atacante) é definido quando
              sortear ou montar o time!
            </span>
          </div>

          {/* Name Input (text-base on mobile prevents iOS auto-zoom) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Nome / Apelido do Atleta *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ex: Diego Ribas, Cadu, Paulinho..."
              autoFocus
              className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base sm:text-sm transition-all"
            />
            {error && (
              <p className="mt-1.5 text-xs font-medium text-rose-500">
                {error}
              </p>
            )}
          </div>

          {/* Skill Rating */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Nível Geral (Opcional)
              </label>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                {skillLevel} {skillLevel === 1 ? "Estrela" : "Estrelas"}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSkillLevel(star)}
                  className={`flex-1 py-2.5 sm:py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-all min-h-[40px] sm:min-h-0 ${
                    star <= skillLevel
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-slate-200/70 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      star <= skillLevel ? "fill-white" : ""
                    }`}
                  />
                  <span>{star}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Status para a Partida
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus("available")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                  status === "available"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Disponível</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus("unavailable")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                  status === "unavailable"
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Indisponível</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 sm:py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 sm:bg-transparent dark:bg-slate-800 sm:dark:bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white shadow-md shadow-orange-500/25 transition-all min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {editingPlayer ? "Salvar Alterações" : "Adicionar ao Elenco"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
