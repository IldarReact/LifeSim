"use client"

import { useGameStore } from "@/core/model/game-store"
import { Button } from "@/shared/ui/button"
import { User, Users } from "lucide-react"

export function MainMenu() {
  const { startSinglePlayer } = useGameStore()

  const handleCreateLobby = () => {
    const roomId = Math.random().toString(36).slice(2, 10);
    window.location.href = `/lobby?room=${roomId}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-2 tracking-tighter">LifeSim</h1>
          <p className="text-white/60 text-xl">Симулятор жизни и карьеры</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={startSinglePlayer}
            className="w-full h-20 text-xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all group"
          >
            <User className="w-8 h-8 mr-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="font-bold text-white">Одиночная игра</div>
              <div className="text-sm text-white/60 font-normal">Начать новую карьеру</div>
            </div>
          </Button>

          <Button
            onClick={handleCreateLobby}
            className="w-full h-20 text-xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all group"
          >
            <Users className="w-8 h-8 mr-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="font-bold text-white">Мультиплеер</div>
              <div className="text-sm text-white/60 font-normal">Создать лобби и играть с друзьями</div>
            </div>
          </Button>
        </div>

        <div className="text-center text-white/20 text-sm">
          v0.1.0 Alpha
        </div>
      </div>
    </div>
  )
}
