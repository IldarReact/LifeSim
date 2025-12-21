'use client'

import {
  User,
  Award,
  DollarSign,
  CheckCircle,
  XCircle,
  Activity,
  Star,
  Zap,
  Heart,
  Brain,
  Clock,
  Trash2,
  TrendingUp,
  Briefcase,
  ChevronRight,
  UserPlus,
  Smile,
  Building,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react'
import React from 'react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Progress } from '@/shared/ui/progress'
import type { EmployeeRole, EmployeeStars, EmployeeSkills } from '@/core/types'
import { calculateStarsFromSkills, formatExperience } from '@/shared/lib/business/employee-utils'
import { getRoleConfig } from '@/core/lib/business/employee-roles.config'

// Мы можем импортировать константы из существующего места,
// но для shared компонента лучше иметь свои или прокидывать их.
// Пока будем использовать пропсы для гибкости.

export interface EmployeeCardProps {
  name: string
  role: EmployeeRole
  roleLabel: string
  roleIcon?: React.ReactNode
  stars?: number // Опционально, если есть skills - рассчитаем
  experience?: number // в месяцах
  salary: number
  salaryLabel?: string // "/мес" или "/кв"
  avatar?: string
  id: string

  // Состояния
  isSelected?: boolean
  isPlayer?: boolean
  isMe?: boolean
  canAfford?: boolean

  // Навыки и статы (для кандидатов/вакансий)
  skills?: EmployeeSkills
  requirements?: Array<{ skill: string; level: number }>
  cost?: Record<string, number>
  company?: string
  isApplied?: boolean

  traits?: Array<{
    name: string
    type: 'positive' | 'negative' | 'medical' | 'default'
    icon: any
    color: string
    description?: string
  }>

  // Рабочие показатели (для текущих сотрудников)
  productivity?: number
  effortPercent?: number
  isPartialAllowed?: boolean // Разрешена ли частичная занятость (50/100%)

  // Рост навыков (для игрока)
  skillGrowth?: {
    name: string
    progress: number
    progressPerQuarter?: number
  }

  impact?: {
    efficiencyBonus?: number
    expenseReduction?: number
    salesBonus?: number
    reputationBonus?: number
    taxReduction?: number
    legalProtection?: number
    staffProductivityBonus?: number
    marketingBonus?: number
  }

  // Затраты (энергия, рассудок и т.д.)
  costs?: {
    energy?: number
    sanity?: number
    happiness?: number
    health?: number
  }

  // Управление
  onAction?: () => void
  actionLabel?: string
  actionIcon?: React.ReactNode
  actionVariant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'

  onEffortChange?: (value: number) => void
  onSecondaryAction?: () => void
  secondaryActionLabel?: string
  secondaryActionIcon?: React.ReactNode

  // Дополнительно
  className?: string
  footer?: React.ReactNode
  showDetails?: boolean
  onShowDetails?: () => void
  isVacancy?: boolean
}

export function EmployeeCard({
  name,
  role,
  roleLabel,
  roleIcon,
  stars: providedStars,
  experience,
  salary,
  salaryLabel = '/мес',
  avatar,
  id,
  isSelected,
  isPlayer,
  isMe,
  canAfford = true,
  skills,
  requirements,
  cost,
  company,
  isApplied,
  traits,
  productivity,
  effortPercent,
  isPartialAllowed,
  skillGrowth,
  impact,
  costs,
  onAction,
  actionLabel,
  actionIcon,
  actionVariant = 'default',
  onEffortChange,
  onSecondaryAction,
  secondaryActionLabel,
  secondaryActionIcon,
  className = '',
  footer,
  showDetails,
  onShowDetails,
  isVacancy,
}: EmployeeCardProps) {
  // Рассчитываем звезды на лету, если они не переданы явно
  const stars = providedStars ?? calculateStarsFromSkills(skills)
  const getEffectIcon = (key: string) => {
    switch (key) {
      case 'energy':
        return <Zap className="w-2.5 h-2.5" />
      case 'sanity':
        return <Brain className="w-2.5 h-2.5" />
      case 'health':
        return <Heart className="w-2.5 h-2.5" />
      case 'marketingBonus':
        return <TrendingUp className="w-2.5 h-2.5" />
      case 'revenue':
        return <DollarSign className="w-2.5 h-2.5" />
      case 'loyalty':
        return <ShieldCheck className="w-2.5 h-2.5" />
      default:
        return <Activity className="w-2.5 h-2.5" />
    }
  }

  const getEffectColor = (key: string) => {
    switch (key.toLowerCase()) {
      case 'health':
        return 'text-rose-400'
      case 'energy':
        return 'text-amber-400'
      case 'sanity':
        return 'text-indigo-400'
      case 'happiness':
        return 'text-pink-400'
      case 'intelligence':
        return 'text-blue-400'
      case 'marketingbonus':
      case 'revenue':
        return 'text-emerald-400'
      case 'loyalty':
        return 'text-blue-400'
      default:
        return 'text-white/60'
    }
  }

  const getImpactLabel = (key: string, value: number) => {
    const plus = value > 0 ? '+' : ''
    switch (key) {
      case 'efficiencyBonus':
        return {
          label: `${plus}${value}% Эффективность`,
          title: 'Повышает общую производительность бизнеса и качество работы',
        }
      case 'expenseReduction':
        return {
          label: `${plus}${value}% Экономия`,
          title: 'Снижает операционные расходы за счет оптимизации',
        }
      case 'salesBonus':
        return {
          label: `${plus}${value}% Продажи`,
          title: 'Увеличивает объем продаж и привлекает больше клиентов',
        }
      case 'reputationBonus':
        return {
          label: `${plus}${value}% Репутация`,
          title: 'Повышает узнаваемость бренда и доверие клиентов',
        }
      case 'taxReduction':
        return {
          label: `${plus}${value}% Налоги`,
          title: 'Снижает налоговую нагрузку законными методами',
        }
      case 'legalProtection':
        return {
          label: `${plus}${value}% Защита`,
          title: 'Снижает риск проверок и юридических проблем',
        }
      case 'staffProductivityBonus':
        return {
          label: `${plus}${value}% Команда`,
          title: 'Повышает продуктивность остальных сотрудников',
        }
      case 'marketingBonus':
        return {
          label: `${plus}${value}% Маркетинг`,
          title: 'Повышает эффективность рекламных кампаний',
        }
      default:
        return { label: `${plus}${value}%`, title: '' }
    }
  }

  const renderStars = (count: number, max: number = 5, size: string = 'w-2.5 h-2.5') => {
    const starDescriptions = [
      'Новичок (1★): Требуется обучение и контроль',
      'Стажер (2★): Базовые навыки, может работать под присмотром',
      'Специалист (3★): Уверенно выполняет свои задачи',
      'Профессионал (4★): Высокая квалификация и опыт',
      'Мастер (5★): Эксперт, может обучать других',
    ]

    return (
      <div className="flex gap-0.5" title={starDescriptions[Math.min(count - 1, 4)] || ''}>
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            className={`${size} ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
          />
        ))}
      </div>
    )
  }

  const getSkillIcon = (skillName: string) => {
    switch (skillName.toLowerCase()) {
      case 'efficiency':
        return <Zap className="w-3 h-3 text-amber-400" />
      case 'loyalty':
        return <Heart className="w-3 h-3 text-red-400" />
      case 'stressresistance':
        return <Brain className="w-3 h-3 text-purple-400" />
      case 'management':
        return <Award className="w-3 h-3 text-blue-400" />
      case 'sales':
        return <DollarSign className="w-3 h-3 text-emerald-400" />
      case 'marketing':
        return <TrendingUp className="w-3 h-3 text-pink-400" />
      case 'law':
        return <ShieldCheck className="w-3 h-3 text-indigo-400" />
      case 'finance':
      case 'accounting':
        return <DollarSign className="w-3 h-3 text-yellow-400" />
      default:
        return <Activity className="w-3 h-3 text-blue-400" />
    }
  }

  const getSkillLabel = (skillName: string) => {
    switch (skillName.toLowerCase()) {
      case 'efficiency':
        return 'Эффективность'
      case 'loyalty':
        return 'Лояльность'
      case 'stressresistance':
        return 'Стрессоустойчивость'
      case 'management':
        return 'Менеджмент'
      case 'sales':
        return 'Продажи'
      case 'marketing':
        return 'Маркетинг'
      case 'law':
        return 'Право'
      case 'finance':
      case 'accounting':
        return 'Финансы'
      default:
        return skillName
    }
  }

  const formatExperience = (months?: number) => {
    if (months === undefined) return null
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    let result = ''
    if (years > 0) result += `${years}г `
    result += `${remainingMonths}м`
    return result
  }

  // В реальном приложении здесь будет импорт или поиск по справочнику ролей
  const roleCfg = role ? getRoleConfig(role) : null
  const roleDescription = roleCfg?.description || ''

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-300 group
        ${
          isSelected
            ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20'
            : isVacancy
              ? 'bg-amber-500/10 border-amber-500/30 border-dashed hover:bg-amber-500/20'
              : 'bg-zinc-900/40 border-white/10 hover:border-white/20'
        }
        ${!canAfford ? 'opacity-60' : ''}
        ${className}
      `}
    >
      {/* Header Image/Avatar Area */}
      <div className="relative h-24">
        <img
          src={avatar || `https://i.pravatar.cc/150?u=${id}`}
          alt={name}
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-900/40 to-transparent" />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isMe && (
            <Badge className="bg-purple-500/80 text-white backdrop-blur-md border-purple-500/30 text-[10px] py-0 px-1.5">
              ВЫ
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="backdrop-blur-md border-white/10 bg-black/60 text-white text-[10px] py-0 px-1.5"
          >
            {isApplied
              ? '✓ Заявка отправлена'
              : isPlayer
                ? 'Онлайн игрок'
                : isVacancy || company
                  ? 'Вакансия'
                  : 'Сотрудник'}
          </Badge>
          {effortPercent !== undefined && (
            <Badge
              variant="outline"
              className={`backdrop-blur-md text-[10px] py-0 px-1.5 ${
                effortPercent === 100
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {effortPercent === 100 ? 'Полный день' : 'Частично'}
            </Badge>
          )}
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-inner">
            {roleIcon || <Briefcase className="w-3.5 h-3.5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-sm leading-tight tracking-tight">{name}</h3>
              {renderStars(stars)}
            </div>
            <div className="flex flex-col">
              <p
                className="text-[9px] font-bold text-white/50 uppercase tracking-widest cursor-help"
                title={roleDescription}
              >
                {roleLabel}
              </p>
              {company && (
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                  <Building className="w-2.5 h-2.5" />
                  {company}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5 space-y-3.5">
        {/* Salary and Main Stats */}
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            {experience !== undefined && (
              <div className="flex items-center gap-1.5 text-white/40">
                <Clock className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  Опыт: {formatExperience(experience) || '—'}
                </span>
              </div>
            )}
            {productivity !== undefined && (
              <div className="flex items-center gap-1.5 text-white/40">
                <Activity className="w-3 h-3 text-blue-400" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  Продуктивность: {productivity}%
                </span>
              </div>
            )}
            {/* Skill Growth (for player) */}
            {skillGrowth && (
              <div className="space-y-1.5 mt-2 bg-blue-500/5 p-2.5 rounded-xl border border-blue-500/10 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[9px] font-bold text-blue-500/50 uppercase tracking-[0.2em]">
                    Прогресс навыка
                  </p>
                  {skillGrowth.progressPerQuarter !== undefined && (
                    <span className="text-[9px] font-bold text-emerald-400">
                      +{skillGrowth.progressPerQuarter}%/кв
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white/70 whitespace-nowrap">
                    {skillGrowth.name}
                  </span>
                  <div className="flex-1 relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${skillGrowth.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 w-8 text-right">
                    {Math.round(skillGrowth.progress)}%
                  </span>
                </div>
              </div>
            )}
            {/* Impacts/Bonuses */}
            {impact && Object.values(impact).some((v) => v !== 0) && (
              <div className="space-y-1.5 mt-2 bg-green-500/5 p-2.5 rounded-xl border border-green-500/10 shadow-sm">
                <p className="text-[9px] font-bold text-green-500/50 uppercase tracking-[0.2em] mb-1">
                  Эффекты влияния
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(impact).map(([key, value]) => {
                    if (!value || value === 0) return null
                    const color = getEffectColor(key)
                    return (
                      <div key={key} className={`flex items-center gap-1.5 ${color} text-[10px]`}>
                        <div className="p-1 rounded-md bg-green-500/10 border border-green-500/10">
                          {getEffectIcon(key)}
                        </div>
                        <span className="font-bold tracking-tight">
                          {value > 0 ? '+' : ''}
                          {value}
                          {key === 'marketingBonus' || key === 'loyalty' ? '%' : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {costs && Object.values(costs).some((v) => v !== 0) && (
              <div className="space-y-1.5 bg-red-500/5 p-2.5 rounded-xl border border-red-500/10 shadow-sm">
                <p className="text-[9px] font-bold text-red-500/50 uppercase tracking-[0.2em] mb-1">
                  Затраты ресурсов
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(costs).map(([key, value]) => {
                    if (!value || value === 0) return null
                    const color = getEffectColor(key)
                    return (
                      <div key={key} className={`flex items-center gap-1.5 ${color} text-[10px]`}>
                        <div className="p-1 rounded-md bg-red-500/10 border border-red-500/10">
                          {getEffectIcon(key)}
                        </div>
                        <span className="font-bold tracking-tight">
                          {value > 0 ? '-' : ''}
                          {Math.abs(value)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {cost && (
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(cost).map(([key, value]) => {
                  if (!value || value === 0) return null
                  const color = getEffectColor(key)
                  return (
                    <div key={key} className={`flex items-center gap-0.5 ${color} text-[10px]`}>
                      {getEffectIcon(key)}
                      <span>
                        {value > 0 ? '+' : ''}
                        {value}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className={`text-right ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
            <div className="font-black text-xl tracking-tighter">${salary.toLocaleString()}</div>
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
              {salaryLabel}
            </div>
          </div>
        </div>

        {/* Productivity Progress (if applicable) */}
        {productivity !== undefined && (
          <div className="space-y-1">
            <Progress value={productivity} className="h-1 bg-white/5" />
          </div>
        )}

        {/* Skills Grid (for candidates) */}
        {skills && (
          <div className="space-y-2">
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
              Навыки и компетенции
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(skills).map(([skillName, value]) => (
                <div
                  key={skillName}
                  className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-[10px] font-bold text-white/70 flex items-center gap-2">
                    {getSkillIcon(skillName)}
                    {getSkillLabel(skillName)}
                  </span>
                  {renderStars(Math.round((value as number) / 20))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements Grid (for vacancies) */}
        {requirements && (
          <div className="space-y-2">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Требования</p>
            <div className="grid grid-cols-1 gap-1.5">
              {requirements.map((req, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-white/5 px-2 py-1 rounded-lg border border-white/5"
                >
                  <span className="text-[11px] text-white/70">{req.skill}</span>
                  {renderStars(req.level)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traits (if applicable) */}
        {traits && traits.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Особенности</p>
            <div className="flex flex-wrap gap-1.5">
              {traits.map((trait, idx) => {
                const Icon = trait.icon
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg text-[10px] border border-white/5"
                    title={trait.description}
                  >
                    <Icon className={`w-3 h-3 ${trait.color}`} />
                    <span className={trait.color}>{trait.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Effort Toggle or Slider */}
        {onEffortChange && effortPercent !== undefined && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Занятость</p>
              <span className="text-xs font-bold text-blue-400">{effortPercent}%</span>
            </div>

            {isPartialAllowed ? (
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => onEffortChange(effortPercent === 100 ? 50 : 100)}
              >
                <div
                  className={`
                  relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out
                  ${effortPercent === 100 ? 'bg-blue-600' : 'bg-white/10'}
                `}
                >
                  <div
                    className={`
                    absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ease-in-out
                    ${effortPercent === 100 ? 'translate-x-5' : 'translate-x-0'}
                  `}
                  />
                </div>
                <span className="text-[10px] text-white/60 group-hover:text-white transition-colors">
                  {effortPercent === 100 ? 'Полная ставка' : 'Половина ставки (50%)'}
                </span>
              </div>
            ) : (
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={effortPercent}
                onChange={(e) => onEffortChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(onAction || onSecondaryAction) && (
        <div className="p-4 pt-0 flex gap-2">
          {onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              className="flex-1 text-xs h-9 border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              {secondaryActionIcon || <ChevronRight className="w-3.5 h-3.5 mr-1.5" />}
              {secondaryActionLabel || 'Подробнее'}
            </Button>
          )}

          {onAction && (
            <Button
              onClick={onAction}
              variant={actionVariant}
              className={`flex-1 text-xs h-9 font-bold transition-all shadow-lg active:scale-95 ${
                actionVariant === 'default'
                  ? 'bg-white text-black hover:bg-white/90 shadow-white/10'
                  : ''
              }`}
            >
              {actionIcon}
              {actionLabel}
            </Button>
          )}
        </div>
      )}

      {footer && <div className="px-4 pb-4">{footer}</div>}
    </div>
  )
}
