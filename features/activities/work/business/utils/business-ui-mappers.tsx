import { TrendingUp, Users, CheckCircle, Star, AlertCircle } from 'lucide-react'
import React from 'react'

export const getRoleIcon = (role: string, priority: string) => {
  const colorClass =
    priority === 'required'
      ? 'text-red-400'
      : priority === 'recommended'
        ? 'text-blue-400'
        : 'text-green-400'

  const iconClass = `w-5 h-5 ${colorClass}`

  switch (role.toLowerCase()) {
    case 'salesperson':
    case 'продавец':
      return <TrendingUp className={iconClass} />
    case 'worker':
    case 'рабочий':
      return <Users className={iconClass} />
    case 'technician':
    case 'техник':
      return <CheckCircle className={iconClass} />
    case 'marketer':
    case 'маркетолог':
      return <Star className={iconClass} />
    case 'manager':
    case 'управляющий':
      return <AlertCircle className={iconClass} />
    default:
      return <CheckCircle className={iconClass} />
  }
}

export const getBusinessTypeLabel = (initialCost: number) => {
  if (initialCost < 50000) return 'Малый бизнес'
  if (initialCost < 100000) return 'Средний бизнес'
  return 'Крупный бизнес'
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
