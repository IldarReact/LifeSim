import { Award, TrendingUp, DollarSign, Star, Activity, Users, Scale, UserCheck } from "lucide-react"

import type { EmployeeRole } from "@/core/types"

// Role labels
export const ROLE_LABELS: Record<EmployeeRole, string> = {
  manager: 'Управляющий',
  salesperson: 'Продавец',
  accountant: 'Бухгалтер',
  marketer: 'Маркетолог',
  technician: 'Техник',
  worker: 'Рабочий',
  lawyer: 'Юрист',
  hr: 'HR-менеджер',
}

// Role icons
export const ROLE_ICONS: Record<EmployeeRole, React.ReactNode> = {
  manager: <Award className="w-4 h-4" />,
  salesperson: <TrendingUp className="w-4 h-4" />,
  accountant: <DollarSign className="w-4 h-4" />,
  marketer: <Star className="w-4 h-4" />,
  technician: <Activity className="w-4 h-4" />,
  worker: <Users className="w-4 h-4" />,
  lawyer: <Scale className="w-4 h-4" />,
  hr: <UserCheck className="w-4 h-4" />,
}

// Base salaries (multiplied by country salaryModifier)
export const BASE_SALARIES: Record<EmployeeRole, number> = {
  manager: 4500,
  salesperson: 3000,
  accountant: 4000,
  marketer: 3500,
  technician: 3000,
  worker: 2200,
  lawyer: 5000,
  hr: 3200,
}

export const ROLE_DESCRIPTIONS: Record<EmployeeRole, string> = {
  manager: 'Управление бизнесом',
  salesperson: 'Продажи и работа с клиентами',
  accountant: 'Бухгалтерия и финансы',
  marketer: 'Маркетинг и реклама',
  technician: 'Техническая поддержка',
  worker: 'Работа в бизнесе',
  lawyer: 'Юридическое сопровождение',
  hr: 'Управление персоналом',
}

export const DEFAULT_CANDIDATES_COUNT = 3
export const CONTROL_THRESHOLD = 50
