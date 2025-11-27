"use client"

import React from "react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Progress } from "@/shared/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import type { Business, EmployeeRole, EmployeeCandidate } from "@/core/types"
import {
  Store, TrendingUp, TrendingDown, Users, DollarSign,
  Star, Zap, Brain, UserPlus, Trash2, Award, Activity, Info
} from "lucide-react"
import { EmployeeHireDialog } from "./employee-hire-dialog"
import { calculateBusinessFinancials } from "@/core/lib/business-utils"

import { generateCandidates } from "@/core/lib/business-utils"

interface BusinessManagementDialogProps {
  business: Business
  playerCash: number
  onHireEmployee: (businessId: string, candidate: EmployeeCandidate) => void
  onFireEmployee: (businessId: string, employeeId: string) => void
  trigger?: React.ReactNode
}

const ROLE_LABELS: Record<EmployeeRole, string> = {
  manager: "Управляющий",
  salesperson: "Продавец",
  accountant: "Бухгалтер",
  marketer: "Маркетолог",
  technician: "Техник",
  worker: "Рабочий"
}

const ROLE_ICONS: Record<EmployeeRole, React.ReactNode> = {
  manager: <Award className="w-4 h-4" />,
  salesperson: <TrendingUp className="w-4 h-4" />,
  accountant: <DollarSign className="w-4 h-4" />,
  marketer: <Star className="w-4 h-4" />,
  technician: <Activity className="w-4 h-4" />,
  worker: <Users className="w-4 h-4" />
}

export function BusinessManagementDialog({
  business,
  playerCash,
  onHireEmployee,
  onFireEmployee,
  trigger
}: BusinessManagementDialogProps) {
  const [hireDialogOpen, setHireDialogOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<EmployeeRole | null>(null)
  const [candidates, setCandidates] = React.useState<EmployeeCandidate[]>([])

  const { income, expenses } = calculateBusinessFinancials(business)
  const availableBudget = playerCash
  const canHireMore = business.employees.length < business.maxEmployees

  const openHireDialog = (role: EmployeeRole) => {
    setSelectedRole(role)
    setCandidates(generateCandidates(role, 3))
    setHireDialogOpen(true)
  }

  const handleHire = (candidate: EmployeeCandidate) => {
    onHireEmployee(business.id, candidate)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Info className="w-4 h-4 mr-2" />
            Управление
          </Button>
        )}
      </DialogTrigger>

      {/* <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[85vw] max-w-[1400px] max-h-[90vh] overflow-y-auto"> */}
      <DialogContent maxWidth="6xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl flex items-center gap-3 text-white">
            <Store className="w-7 h-7 text-emerald-400" />
            Управление бизнесом - {business.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Доход</span>
              </div>
              <p className="text-2xl font-bold text-green-400">${income.toLocaleString()}</p>
              <p className="text-xs text-white/40">в квартал</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Расходы</span>
              </div>
              <p className="text-2xl font-bold text-red-400">${expenses.toLocaleString()}</p>
              <p className="text-xs text-white/40">в квартал (вкл. зарплаты)</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <Star className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Репутация</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={business.reputation} className="h-2 flex-1" />
                <span className="text-lg font-bold text-white">{business.reputation}%</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <Activity className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Эффективность</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={business.efficiency} className="h-2 flex-1" />
                <span className="text-lg font-bold text-white">{business.efficiency}%</span>
              </div>
            </div>
          </div>

          {/* Energy & Stress Info */}
          <div className="flex gap-6 text-sm bg-white/5 rounded-lg p-3 border border-white/10 w-fit">
            <div className="flex items-center gap-2 text-amber-400">
              <Zap className="w-4 h-4" />
              <span>Энергия: -{business.energyCostPerTurn}/кв</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Brain className="w-4 h-4" />
              <span>Рассудок: -{business.stressImpact}/кв</span>
            </div>
          </div>

          {/* Employees Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">
                  Сотрудники ({business.employees.length}/{business.maxEmployees})
                </h3>
              </div>
              {canHireMore && (
                <p className="text-sm text-white/60">
                  Бюджет: <span className="text-green-400 font-bold">${availableBudget.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Employee List */}
            {business.employees.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {business.employees.map((employee) => (
                  <div key={employee.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/20">
                          {ROLE_ICONS[employee.role]}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">{employee.name}</h4>
                          <p className="text-xs text-white/60 uppercase tracking-wide">{ROLE_LABELS[employee.role]} • {employee.level}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFireEmployee(business.id, employee.id)}
                        className="border-red-500/20 hover:bg-red-500/20 text-red-300 h-9 px-3"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Уволить
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-xs text-white/50 mb-1">Зарплата</p>
                        <p className="text-base font-bold text-green-400">${employee.salary}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-xs text-white/50 mb-1">Опыт</p>
                        <p className="text-base font-bold text-white">{Math.floor(employee.experience / 12)}г {employee.experience % 12}м</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-white/60">Продуктивность</span>
                          <span className="text-white font-bold">{employee.productivity}%</span>
                        </div>
                        <Progress value={employee.productivity} className="h-1.5 bg-white/10" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-white/60">Удовлетворенность</span>
                          <span className="text-white font-bold">{employee.satisfaction}%</span>
                        </div>
                        <Progress value={employee.satisfaction} className="h-1.5 bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mb-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/50 text-lg">Нет сотрудников</p>
                <p className="text-white/30 text-sm">Наймите персонал для развития бизнеса</p>
              </div>
            )}

            {/* Hire Buttons */}
            {canHireMore ? (
              <div>
                <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Нанять сотрудника:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-">
                  {(['manager', 'salesperson', 'accountant', 'marketer', 'technician', 'worker'] as EmployeeRole[]).map((role) => (
                    <Button
                      key={role}
                      onClick={() => openHireDialog(role)}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-3 flex flex-col gap-2"
                    >
                      <div className="text-blue-400">
                        {ROLE_ICONS[role]}
                      </div>
                      <span className="text-xs">{ROLE_LABELS[role]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <p className="text-amber-300 font-medium">
                  Достигнут лимит сотрудников ({business.maxEmployees})
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Hire Dialog (Nested) */}
      {selectedRole && (
        <EmployeeHireDialog
          isOpen={hireDialogOpen}
          onClose={() => setHireDialogOpen(false)}
          candidates={candidates}
          onHire={handleHire}
          availableBudget={availableBudget}
        />
      )}
    </Dialog>
  )
}
