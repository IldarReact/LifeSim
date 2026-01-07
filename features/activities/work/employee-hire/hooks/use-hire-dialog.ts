import { useState, useEffect, useMemo } from 'react'

import { SALARY_CONFIG, KPI_CONFIG } from '../../shared-constants'
import { createPlayerCandidate } from '../utils/employee-utils'

import { generateCandidates } from '@/core/lib/business/employee-generator'
import { getInflatedBaseSalary } from '@/core/lib/calculations/price-helpers'
import { getOnlinePlayers } from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import type { EmployeeCandidate } from '@/core/types'

export function useHireDialog(isOpen: boolean, initialCandidates: EmployeeCandidate[]) {
  const { countries, player } = useGameStore()
  const country = player ? countries[player.countryId] : undefined

  // Применяем инфляцию к минимальной зарплате
  const inflatedMinSalary = useMemo(() => {
    return country ? getInflatedBaseSalary(SALARY_CONFIG.MIN, country) : SALARY_CONFIG.MIN
  }, [country])

  const inflatedDefaultSalary = useMemo(() => {
    return country ? getInflatedBaseSalary(SALARY_CONFIG.DEFAULT, country) : SALARY_CONFIG.DEFAULT
  }, [country])

  const [npcCandidates, setNpcCandidates] = useState<EmployeeCandidate[]>(initialCandidates)
  const [selectedCandidate, setSelectedCandidate] = useState<EmployeeCandidate | null>(null)
  const [activeTab, setActiveTab] = useState<'npc' | 'players'>('npc')
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([])
  const [customSalary, setCustomSalary] = useState<number>(inflatedDefaultSalary)
  const [customKPI, setCustomKPI] = useState<number>(KPI_CONFIG.DEFAULT)

  useEffect(() => {
    if (isOpen) {
      // Если кандидаты не переданы извне, генерируем их здесь
      if ((!initialCandidates || initialCandidates.length === 0) && player) {
        // Берем дефолтную роль, если список пуст (обычно это не должно случаться)
        const role = 'worker'
        const generated = generateCandidates(role, 5, country, player.countryId)
        setNpcCandidates(generated)
      } else {
        setNpcCandidates(initialCandidates)
      }

      if (activeTab === 'players') {
        setOnlinePlayers(getOnlinePlayers())
      }
      setSelectedCandidate(null)
      setCustomSalary(inflatedDefaultSalary)
    }
  }, [isOpen, activeTab, initialCandidates, player, country, inflatedDefaultSalary]) // Добавлены зависимости

  const displayCandidates = useMemo(() => {
    if (activeTab === 'npc') return npcCandidates

    // Создаем список кандидатов-игроков
    const playerCandidates = onlinePlayers.map((p) =>
      createPlayerCandidate(
        p,
        npcCandidates[0]?.role || 'worker',
        customSalary,
        p.isLocal ? player || undefined : undefined,
      ),
    )

    // Проверяем, есть ли локальный игрок в списке. Если нет (например, оффлайн) - добавляем его принудительно
    const hasLocalPlayer = onlinePlayers.some((p) => p.isLocal)

    if (!hasLocalPlayer && player) {
      const playerClientId = player.id || 'local'
      playerCandidates.unshift(
        createPlayerCandidate(
          { clientId: playerClientId, name: player.name, isLocal: true },
          npcCandidates[0]?.role || 'worker',
          customSalary,
          player,
        ),
      )
    }

    return playerCandidates
  }, [activeTab, npcCandidates, onlinePlayers, player, customSalary])

  return {
    selectedCandidate,
    setSelectedCandidate,
    activeTab,
    setActiveTab,
    displayCandidates,
    customSalary,
    setCustomSalary,
    customKPI,
    setCustomKPI,
    inflatedMinSalary,
  }
}
