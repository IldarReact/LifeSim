import React from "react"
import { Slider } from "@/shared/ui/slider"
import { Input } from "@/shared/ui/input"
import { DollarSign } from "lucide-react"
import { SALARY_CONFIG, KPI_CONFIG } from "../../shared-constants"
import { calculateMonthlySalary, calculateKPIBonus, calculateMaxSalaryWithKPI } from "../utils/employee-utils"

interface SalarySettingsProps {
  salary: number
  kpiBonus: number
  onSalaryChange: (value: number) => void
  onKPIChange: (value: number) => void
}

export function SalarySettings({ salary, kpiBonus, onSalaryChange, onKPIChange }: SalarySettingsProps) {
  return (
    <div className="mt-6 p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-purple-400" />
        Условия найма
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-white/80 flex items-center justify-between">
            <span>Зарплата (квартал)</span>
            <span className="text-2xl font-bold text-green-400">${salary.toLocaleString()}</span>
          </label>

          <div className="flex gap-4 items-center">
            <Slider
              value={[salary]}
              min={SALARY_CONFIG.MIN}
              max={SALARY_CONFIG.MAX}
              step={SALARY_CONFIG.STEP}
              onValueChange={(val) => onSalaryChange(val[0])}
              className="flex-1"
            />
            <Input
              type="number"
              value={salary}
              onChange={(e) => onSalaryChange(Number(e.target.value))}
              className="w-24 bg-white/5 border-white/10 text-white h-9"
            />
          </div>

          <div className="flex justify-between text-xs text-white/40">
            <span>${SALARY_CONFIG.MIN.toLocaleString()}</span>
            <span>${SALARY_CONFIG.MAX.toLocaleString()}</span>
          </div>

          <p className="text-sm text-white/60">
            Месячная зарплата: <span className="text-green-400 font-bold">${calculateMonthlySalary(salary).toLocaleString()}</span>
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-white/80 flex items-center justify-between">
            <span>KPI Бонус</span>
            <span className="text-2xl font-bold text-amber-400">{kpiBonus}%</span>
          </label>
          <input
            type="range"
            min={KPI_CONFIG.MIN}
            max={KPI_CONFIG.MAX}
            step={KPI_CONFIG.STEP}
            value={kpiBonus}
            onChange={(e) => onKPIChange(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-xs text-white/40">
            <span>{KPI_CONFIG.MIN}%</span>
            <span>{KPI_CONFIG.MAX}%</span>
          </div>
          <p className="text-xs text-white/60">
            Бонус при высокой продуктивности (≥{KPI_CONFIG.THRESHOLD}%): <span className="text-amber-400 font-bold">+${calculateKPIBonus(salary, kpiBonus).toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Максимальная стоимость (с KPI):</span>
          <span className="text-xl font-bold text-white">
            ${calculateMaxSalaryWithKPI(salary, kpiBonus).toLocaleString()}/квартал
          </span>
        </div>
      </div>
    </div>
  )
}
