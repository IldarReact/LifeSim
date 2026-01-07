import React from 'react'

import { getInflatedEducationPrice } from '@/core/lib/calculations/price-helpers'
import { getAllCoursesForCountry } from '@/core/lib/data-loaders/courses-loader'
import { useGameStore } from '@/core/model/store'

export function useEducation() {
  const { player, countries, studyCourse, applyToUniversity } = useGameStore()
  const [feedback, setFeedback] = React.useState<{
    show: boolean
    success: boolean
    message: string
  }>({
    show: false,
    success: false,
    message: '',
  })

  if (!player) {
    return {
      player: null,
      feedback,
      setFeedback,
    }
  }

  const currentCountry = countries[player.countryId]
  const countryId = player.countryId || 'us'
  const availableCourses = getAllCoursesForCountry(countryId)

  const getInflatedCoursePrice = (basePrice: number): number => {
    if (!currentCountry) return basePrice
    return getInflatedEducationPrice(basePrice, currentCountry)
  }

  const skills = (player.personal.skills || []).filter((s) => s.level > 0)
  const activeCourses = player.personal.activeCourses || []
  const activeUniversity = player.personal.activeUniversity || []
  const hasSkills = skills.length > 0
  const hasActiveEducation = activeCourses.length > 0 || activeUniversity.length > 0

  const parseDuration = (duration: string): number => {
    if (duration.includes('год')) {
      const years = parseInt(duration)
      return years * 4
    }
    if (duration.includes('месяц')) {
      const months = parseInt(duration)
      return Math.ceil(months / 3)
    }
    if (duration.includes('недел')) {
      return 1
    }
    return 1
  }

  const calculateCurrentEnergyCost = () => {
    return (
      activeCourses.reduce((acc, c) => acc + (c.costPerTurn?.energy || 0), 0) +
      activeUniversity.reduce((acc, c) => acc + (c.costPerTurn?.energy || 0), 0) +
      player.jobs.reduce((acc, j) => acc + (j.cost?.energy || 0), 0)
    )
  }

  const handleCourseEnroll = (
    courseName: string,
    baseCost: number,
    energyCost: number,
    skillBonus: string,
    durationStr: string,
  ) => {
    const duration = parseDuration(durationStr)
    const inflatedCost = getInflatedCoursePrice(baseCost)
    const currentEnergyCost = calculateCurrentEnergyCost()

    if (100 - currentEnergyCost < energyCost) {
      setFeedback({
        show: true,
        success: false,
        message: 'Недостаточно свободной энергии. Завершите другие дела.',
      })
      return
    }

    if ((player.stats?.money ?? 0) < inflatedCost) {
      setFeedback({ show: true, success: false, message: 'Недостаточно денег для оплаты курса' })
      return
    }

    studyCourse(courseName, inflatedCost, { energy: energyCost }, skillBonus, duration)
    setFeedback({ show: true, success: true, message: `Вы записались на курс "${courseName}"` })
  }

  const handleUniversityApply = (
    programName: string,
    baseCost: number,
    energyCost: number,
    skillBonus: string,
    durationStr: string,
  ) => {
    const duration = parseDuration(durationStr)
    const inflatedCost = getInflatedCoursePrice(baseCost)
    const currentEnergyCost = calculateCurrentEnergyCost()

    if (100 - currentEnergyCost < energyCost) {
      setFeedback({
        show: true,
        success: false,
        message: 'Недостаточно свободной энергии. Завершите другие дела.',
      })
      return
    }

    if ((player.stats?.money ?? 0) < inflatedCost) {
      setFeedback({ show: true, success: false, message: 'Недостаточно денег для оплаты обучения' })
      return
    }

    applyToUniversity(programName, inflatedCost, { energy: energyCost }, skillBonus, duration)
    setFeedback({ show: true, success: true, message: `Документы на "${programName}" поданы` })
  }

  return {
    player,
    currentCountry,
    skills,
    activeCourses,
    activeUniversity,
    hasSkills,
    hasActiveEducation,
    availableCourses,
    getInflatedCoursePrice,
    handleCourseEnroll,
    handleUniversityApply,
    feedback,
    setFeedback,
  }
}
