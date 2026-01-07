'use client'

import { Globe, User } from 'lucide-react'

import { Button } from '@/shared/ui/button'

interface LobbySettingsProps {
  selectedCountryName: string
  selectedArchetypeName: string
  selectedArchetype: string | null
  onOpenCountryModal: () => void
  onOpenArchetypeModal: () => void
}

export function LobbySettings({
  selectedCountryName,
  selectedArchetypeName,
  selectedArchetype,
  onOpenCountryModal,
  onOpenArchetypeModal,
}: LobbySettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Карточка выбора страны */}
      <div
        onClick={onOpenCountryModal}
        className="bg-slate-900 rounded-xl p-6 border border-slate-800 cursor-pointer hover:border-slate-600 transition-colors group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <Globe className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400">Страна</h3>
              <p className="text-lg font-bold text-white">{selectedCountryName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 group-hover:text-white">
            Изменить
          </Button>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-full" />
        </div>
      </div>

      {/* Карточка выбора персонажа */}
      <div
        onClick={onOpenArchetypeModal}
        className="bg-slate-900 rounded-xl p-6 border border-slate-800 cursor-pointer hover:border-slate-600 transition-colors group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <User className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400">Персонаж</h3>
              <p className="text-lg font-bold text-white">{selectedArchetypeName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 group-hover:text-white">
            Изменить
          </Button>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full w-full transition-all ${selectedArchetype ? 'bg-purple-500' : 'bg-transparent'}`}
          />
        </div>
      </div>
    </div>
  )
}
