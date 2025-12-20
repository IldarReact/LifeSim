import { useState, useEffect, useMemo } from "react"

import { SALARY_CONFIG, KPI_CONFIG } from "../../shared-constants"
import { createPlayerCandidate } from "../utils/employee-utils"

import { getInflatedBaseSalary } from "@/core/lib/calculations/price-helpers"
import { getOnlinePlayers } from "@/core/lib/multiplayer"
import { useGameStore } from "@/core/model/game-store"
import type { EmployeeCandidate } from "@/core/types"

export function useHireDialog(isOpen: boolean, candidates: EmployeeCandidate[]) {
  const { countries, player } = useGameStore()
  const country = player ? countries[player.countryId] : undefined
  
  // Применяем инфляцию к минимальной зарплате
  const inflatedMinSalary = useMemo(() => {
    return country ? getInflatedBaseSalary(SALARY_CONFIG.MIN, country) : SALARY_CONFIG.MIN
  }, [country])
  
  const inflatedDefaultSalary = useMemo(() => {
    return country ? getInflatedBaseSalary(SALARY_CONFIG.DEFAULT, country) : SALARY_CONFIG.DEFAULT
  }, [country])
  
  const [selectedCandidate, setSelectedCandidate] = useState<EmployeeCandidate | null>(null)
  const [activeTab, setActiveTab] = useState<'npc' | 'players'>('npc')
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([])
  const [customSalary, setCustomSalary] = useState<number>(inflatedDefaultSalary)
  const [customKPI, setCustomKPI] = useState<number>(KPI_CONFIG.DEFAULT)

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'players') {
        setOnlinePlayers(getOnlinePlayers().filter(p => !p.isLocal))
      }
      setSelectedCandidate(null)
      setCustomSalary(inflatedDefaultSalary)
    }
  }, [isOpen, activeTab, inflatedDefaultSalary])

  const displayCandidates = activeTab === 'npc'
    ? candidates
    : onlinePlayers.map(player => 
        createPlayerCandidate(player, candidates[0]?.role || 'worker', customSalary)
      )

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
    inflatedMinSalary
  }
}
