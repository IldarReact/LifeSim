import { Users, DollarSign, Zap, CheckCircle, AlertCircle, Store } from 'lucide-react'
import React from 'react'

import { getBusinessTypeLabel, getRoleIcon } from '../../utils/business-ui-mappers'

import { getRoleConfig } from '@/core/lib/business/employee-roles.config'
import { BusinessTemplate } from '@/core/lib/data-loaders/businesses-loader'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

interface BusinessCardProps {
  template: BusinessTemplate
  upfrontCost: number
  canAfford: boolean
  isSelected: boolean
  incomeRange: string
  expenses: string
  onSelect: () => void
  onOpen: (template: BusinessTemplate) => void
  onOpenWithPartner?: (template: BusinessTemplate) => void
  showPartnerButton: boolean
}

export function BusinessCard({
  template,
  upfrontCost,
  canAfford,
  isSelected,
  incomeRange,
  expenses,
  onSelect,
  onOpen,
  onOpenWithPartner,
  showPartnerButton,
}: BusinessCardProps) {
  const typeLabel = getBusinessTypeLabel(template.initialCost)

  return (
    <div
      className={`
        bg-white/5 border rounded-2xl overflow-hidden transition-all cursor-pointer
        ${isSelected ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}
        ${!canAfford && 'opacity-60'}
      `}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative h-48">
        <img
          src={
            template.imageUrl ||
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
          }
          alt={template.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/70 backdrop-blur-md text-white border-white/20">
            {typeLabel}
          </Badge>
        </div>
        {isSelected && (
          <div className="absolute top-3 right-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-white">{template.name}</h3>
          <div
            className={`text-xl font-bold flex flex-col items-end ${canAfford ? 'text-green-400' : 'text-red-400'}`}
          >
            <div className="flex items-center gap-1">
              <DollarSign className="w-5 h-5" />
              {upfrontCost.toLocaleString()}
            </div>
          </div>
        </div>

        <p className="text-white/80 text-sm mb-4 leading-relaxed line-clamp-2">
          {template.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-xs text-white/60 block mb-1">Доход</span>
            <span className="text-green-400 font-bold text-sm">{incomeRange}</span>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-xs text-white/60 block mb-1">Расходы</span>
            <span className="text-rose-400 font-bold text-sm">{expenses}</span>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-xs text-white/60 block mb-1">Сотрудников</span>
            <span className="text-white font-bold text-sm flex items-center gap-1">
              <Users className="w-3 h-3" /> до {template.maxEmployees || 5}
            </span>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <span className="text-xs text-white/60 block mb-1">Энергия</span>
            <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
              <Zap className="w-3 h-3" /> -{template.energyCost || 15}/кв
            </span>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white/5 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Рекомендуемые сотрудники
          </h4>
          <div className="space-y-2">
            {(template.employeeRoles || []).map((req, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="mt-0.5">{getRoleIcon(req.role, req.priority)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/90 font-medium">
                      {getRoleConfig(req.role)?.name || req.role}
                    </span>
                    {req.priority === 'required' && (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs px-1.5 py-0">
                        Обязательно
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-white/70 mt-0.5 line-clamp-1">
                    {req.description || getRoleConfig(req.role)?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onOpen(template)
            }}
            disabled={!canAfford}
            className={`
              w-full h-12 font-bold text-base
              ${
                canAfford
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-white/5 text-white/40 cursor-not-allowed'
              }
            `}
          >
            {canAfford ? (
              <>
                <Store className="w-5 h-5 mr-2" />
                Открыть за ${upfrontCost.toLocaleString()}
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 mr-2" />
                Недостаточно средств
              </>
            )}
          </Button>

          {showPartnerButton && onOpenWithPartner && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onOpenWithPartner(template)
              }}
              variant="outline"
              className="w-full h-12 border-purple-500/30 hover:bg-purple-500/10 text-white font-bold text-base"
            >
              <Store className="w-5 h-5 mr-2 text-purple-400" />
              Открыть с партнером
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
