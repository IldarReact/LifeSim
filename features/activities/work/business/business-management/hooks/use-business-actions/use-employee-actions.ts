import { ROLE_LABELS } from '../../constants'

import { useBusinessActionExecutor } from './action-executor'

import { canMakeDirectChanges } from '@/core/lib/business/partnership-permissions'
import { useGameStore } from '@/core/model/store'
import type { Business, EmployeeCandidate, EmployeeRole } from '@/core/types'
import { EmployeeStars } from '@/core/types/business.types'

export function useEmployeeActions(business: Business) {
  const { updateEmployeeInBusiness, pushNotification } = useGameStore()
  const { executeAction, player } = useBusinessActionExecutor(business)

  const handleHire = (
    candidate: EmployeeCandidate,
    onJoinAsEmployee: (
      businessId: string,
      role: EmployeeRole,
      salary: number,
      productivity: number,
      effortPercent: number,
    ) => void,
    onHireEmployee: (businessId: string, candidate: EmployeeCandidate) => void,
    setHireDialogOpen: (isOpen: boolean) => void,
  ) => {
    const isMe =
      candidate.id.startsWith('player_') ||
      candidate.id === `player_${player?.id || 'local'}` ||
      candidate.id === player?.id

    const isManagerial = ['manager', 'accountant', 'marketer', 'lawyer', 'hr'].includes(
      candidate.role,
    )

    executeAction({
      directAction: () => {
        if (isMe) {
          onJoinAsEmployee(
            business.id,
            candidate.role,
            candidate.requestedSalary,
            100,
            isManagerial ? 50 : 100,
          )
        } else {
          onHireEmployee(business.id, candidate)
        }
      },
      proposalType: isMe ? 'change_role' : 'hire_employee',
      proposalData: {
        employeeName: candidate.name,
        employeeRole: candidate.role,
        employeeSalary: candidate.requestedSalary,
        employeeStars: candidate.stars,
        isMe: isMe,
        employeeId: isMe ? player?.id : undefined,
        skills: candidate.skills,
        experience: candidate.experience,
        humanTraits: candidate.humanTraits,
      },
      notificationTitle: 'Предложение отправлено',
      notificationMessage: isMe
        ? `Предложение о вашем вступлении в роль ${ROLE_LABELS[candidate.role]} отправлено партнёру`
        : `Предложение о найме ${candidate.name} отправлено партнёру`,
      errorMessage:
        'У вас недостаточно доли в бизнесе для управления персоналом (требуется минимум 50%)',
    })

    if (!business.partners.length || canMakeDirectChanges(business, player?.id || '')) {
      setHireDialogOpen(false)
    }
  }

  const handleFireEmployee = (
    employeeId: string,
    employeeName: string,
    onFireEmployee: (businessId: string, employeeId: string) => void,
  ) => {
    executeAction({
      directAction: () => onFireEmployee(business.id, employeeId),
      proposalType: 'fire_employee',
      proposalData: {
        fireEmployeeId: employeeId,
        fireEmployeeName: employeeName,
      },
      notificationTitle: 'Предложение отправлено',
      notificationMessage: `Предложение об увольнении ${employeeName} отправлено партнёру`,
      errorMessage:
        'У вас недостаточно доли в бизнесе для увольнения сотрудников (требуется минимум 50%)',
    })
  }

  const handlePromoteEmployee = (
    employeeId: string,
    employeeName: string,
    currentSalary: number,
    currentStars: number,
    experience: number,
    onPromoteEmployee?: (
      businessId: string,
      employeeId: string,
      newSalary: number,
      newStars: EmployeeStars,
    ) => void,
  ) => {
    const newSalary = Math.round(currentSalary * 1.15)
    let newStars = currentStars
    if (currentStars < 5 && experience >= 4) {
      newStars = currentStars + 1
    }

    executeAction({
      directAction: () => {
        if (onPromoteEmployee) {
          onPromoteEmployee(business.id, employeeId, newSalary, newStars as EmployeeStars)
        } else {
          updateEmployeeInBusiness(business.id, employeeId, {
            salary: newSalary,
            stars: newStars as EmployeeStars,
          })
        }
        pushNotification?.({
          type: 'success',
          title: 'Повышение',
          message: `${employeeName} повышен до ${newStars} звёзд!`,
        })
      },
      proposalType: 'promote_employee',
      proposalData: {
        promoteEmployeeId: employeeId,
        promoteEmployeeName: employeeName,
        newSalary,
        newStars: newStars as EmployeeStars,
      },
      notificationTitle: 'Предложение отправлено',
      notificationMessage: `Предложение о повышении ${employeeName} отправлено партнёру`,
      errorMessage:
        'У вас недостаточно доли в бизнесе для повышения сотрудников (требуется минимум 50%)',
    })
  }

  const handleDemoteEmployee = (
    employeeId: string,
    employeeName: string,
    currentSalary: number,
    currentStars: number,
    onDemoteEmployee?: (
      businessId: string,
      employeeId: string,
      newSalary: number,
      newStars: EmployeeStars,
    ) => void,
  ) => {
    const newSalary = Math.round(currentSalary * 0.85)
    const newStars = Math.max(1, currentStars - 1)

    executeAction({
      directAction: () => {
        if (onDemoteEmployee) {
          onDemoteEmployee(business.id, employeeId, newSalary, newStars as EmployeeStars)
        } else {
          updateEmployeeInBusiness(business.id, employeeId, {
            salary: newSalary,
            stars: newStars as EmployeeStars,
          })
        }
        pushNotification?.({
          type: 'info',
          title: 'Понижение',
          message: `${employeeName} понижен до ${newStars} звёзд.`,
        })
      },
      proposalType: 'demote_employee',
      proposalData: {
        demoteEmployeeId: employeeId,
        demoteEmployeeName: employeeName,
        newSalary,
        newStars: newStars as EmployeeStars,
      },
      notificationTitle: 'Предложение отправлено',
      notificationMessage: `Предложение о понижении ${employeeName} отправлено партнёру`,
      errorMessage:
        'У вас недостаточно доли в бизнесе для понижения сотрудников (требуется минимум 50%)',
    })
  }

  const handleSetSalary = (
    employeeId: string,
    employeeName: string,
    newSalary: number,
    onSetSalary: (businessId: string, employeeId: string, salary: number) => void,
  ) => {
    executeAction({
      directAction: () => onSetSalary(business.id, employeeId, newSalary),
      proposalType: 'set_salary',
      proposalData: {
        salaryEmployeeId: employeeId,
        salaryEmployeeName: employeeName,
        newSalary,
      },
      notificationTitle: 'Предложение отправлено',
      notificationMessage: `Предложение об изменении зарплаты ${employeeName} отправлено партнёру`,
      errorMessage:
        'У вас недостаточно доли в бизнесе для изменения зарплат (требуется минимум 50%)',
    })
  }

  const handleUpdateEmployee = (
    employeeId: string,
    data: Partial<{
      salary: number
      stars: EmployeeStars
      effortPercent: number
    }>,
  ) => {
    updateEmployeeInBusiness(business.id, employeeId, data)
  }

  const handleUnassignRole = (
    role: EmployeeRole,
    onUnassignRole: (businessId: string, role: EmployeeRole) => void,
  ) => {
    executeAction({
      directAction: () => onUnassignRole(business.id, role),
      proposalType: 'fire_employee',
      proposalData: {
        fireEmployeeId: `player_${player?.id}`,
        fireEmployeeName: player?.name,
        isMe: true,
      },
      notificationTitle: 'Предложение отправлено',
      notificationMessage: `Предложение о вашем уходе из роли ${ROLE_LABELS[role]} отправлено партнёру`,
      errorMessage: 'У вас недостаточно доли в бизнесе для изменения состава персонала',
    })
  }

  return {
    handleHire,
    handleFireEmployee,
    handlePromoteEmployee,
    handleDemoteEmployee,
    handleSetSalary,
    handleUpdateEmployee,
    handleUnassignRole,
  }
}
