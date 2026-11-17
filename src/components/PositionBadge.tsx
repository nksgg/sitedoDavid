"use client";

import React from "react";
import { POSITION_META } from "@/data/mockPlayers";
import { Position } from "@/types/soccer";
import { Shield, Hand, Compass, Flame } from "lucide-react";

interface PositionBadgeProps {
  position: Position;
  size?: "sm" | "md" | "lg";
  short?: boolean;
}

export function PositionBadge({
  position,
  size = "md",
  short = false,
}: PositionBadgeProps) {
  const meta = POSITION_META[position];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  }[size];

  const Icon = {
    Goleiro: Hand,
    Zagueiro: Shield,
    "Meio-campista": Compass,
    Atacante: Flame,
  }[position];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-colors ${sizeClasses} ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder} ${meta.darkBadgeBg} ${meta.darkBadgeText} ${meta.darkBadgeBorder}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{short ? meta.shortLabel : position}</span>
    </span>
  );
}
