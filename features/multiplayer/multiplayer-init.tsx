"use client";

import { useEffect } from "react";

import { enableMultiplayerSync } from "@/core/model/game-store";

export function MultiplayerInit() {
  useEffect(() => {
    enableMultiplayerSync();
  }, []);

  // Ничего не рендерится — только запускает синхронизацию
  return null;
}