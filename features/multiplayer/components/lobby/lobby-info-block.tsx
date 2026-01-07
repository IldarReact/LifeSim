'use client'

export function LobbyInfoBlock() {
  return (
    <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 text-center">
      <h3 className="text-lg font-medium text-white mb-2">Ожидание игроков</h3>
      <p className="text-slate-400 max-w-md mx-auto">
        Выберите страну и персонажа, затем нажмите "Готов". Игра начнется, когда хост запустит сессию.
      </p>
    </div>
  )
}
