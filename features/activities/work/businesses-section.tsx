"use client"

import React from "react"
import { OpportunityCard } from "../ui/opportunity-card"
import { BusinessDetailCard } from "../ui/business-detail-card"
import { BusinessDetailDialog, BUSINESS_REQUIREMENTS } from "./business-detail-dialog"
import { Store } from "lucide-react"
import { Button } from "@/shared/ui/button"

import type { StatEffect } from "@/core/types/stats.types"

interface BusinessesSectionProps {
  playerCash: number
  onOpenBusiness: (
    name: string,
    type: 'retail' | 'service' | 'cafe' | 'tech' | 'manufacturing',
    description: string,
    totalCost: number,
    upfrontCost: number,
    creationCost: StatEffect,
    openingQuarters: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    maxEmployees: number,
    minWorkers: number,
    taxRate: number
  ) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function BusinessesSection({
  playerCash,
  onOpenBusiness,
  onSuccess,
  onError
}: BusinessesSectionProps) {
  const handleOpenBusiness = (
    name: string,
    type: 'retail' | 'service' | 'cafe' | 'tech' | 'manufacturing',
    description: string,
    cost: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    maxEmployees: number,
    energyCost: number,
    stressImpact: number
  ) => {
    if (playerCash >= cost) {
      onOpenBusiness(
        name,
        type,
        description,
        cost, // totalCost
        cost, // upfrontCost (assuming full payment for now)
        { energy: -energyCost, sanity: -stressImpact }, // creationCost
        0, // openingQuarters
        monthlyIncome,
        monthlyExpenses,
        maxEmployees,
        1, // minWorkers
        0.15 // taxRate
      )
      onSuccess(`Бизнес "${name}" успешно открыт!`)
    } else {
      onError('Недостаточно средств для открытия бизнеса')
    }
  }

  return (
    <OpportunityCard
      title="Открыть бизнес"
      description="Инвестируйте в реальный сектор экономики. Магазины, сервисы, производство - стабильный доход при грамотном управлении."
      icon={<Store className="w-6 h-6 text-[#004d00]" />}
      image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
      actionLabel="Выбрать бизнес"
    >
      <div className="space-y-4">
        <p className="text-white/60 mb-4">
          Открытие бизнеса требует начального капитала и отнимает много энергии на старте. Будьте готовы к расходам и стрессу!
        </p>

        <BusinessDetailCard
          title="Магазин гаджетов"
          type="Малый бизнес"
          description="Розничная точка продажи смартфонов и аксессуаров в торговом центре. Требует закупки товара и найма продавцов."
          cost={50000}
          income="$9,000 - $24,000/кв"
          expenses="$7,500/кв"
          energyCost={15}
          stressImpact="+2"
          image="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop"
          detailDialog={
            <BusinessDetailDialog
              title="Магазин гаджетов"
              type="Малый бизнес"
              description="Розничная точка продажи смартфонов и аксессуаров в торговом центре. Требует закупки товара и найма продавцов."
              cost={50000}
              income="$9,000 - $24,000/кв"
              expenses="$7,500/кв"
              energyCost={15}
              stressImpact="+2"
              image="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop"
              requirements={BUSINESS_REQUIREMENTS.gadget_store}
              trigger={
                <Button variant="outline" className="flex-1 text-xs h-9 border-white/20 text-white hover:bg-white/10">
                  Подробнее
                </Button>
              }
              onBuy={() => handleOpenBusiness(
                "Магазин гаджетов",
                "retail",
                "Розничная точка продажи смартфонов и аксессуаров в торговом центре",
                50000,
                5500,
                2500,
                5,
                15,
                2
              )}
            />
          }
          onBuy={() => handleOpenBusiness(
            "Магазин гаджетов",
            "retail",
            "Розничная точка продажи смартфонов и аксессуаров в торговом центре",
            50000,
            5500,
            2500,
            5,
            15,
            2
          )}
        />

        <BusinessDetailCard
          title="Автомойка"
          type="Средний бизнес"
          description="Комплекс по обслуживанию автомобилей. Стабильный поток клиентов, но требует контроля качества и обслуживания оборудования."
          cost={120000}
          income="$24,000 - $45,000/кв"
          expenses="$15,000/кв"
          energyCost={25}
          stressImpact="+4"
          image="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop"
          detailDialog={
            <BusinessDetailDialog
              title="Автомойка"
              type="Средний бизнес"
              description="Комплекс по обслуживанию автомобилей. Стабильный поток клиентов, но требует контроля качества и обслуживания оборудования."
              cost={120000}
              income="$24,000 - $45,000/кв"
              expenses="$15,000/кв"
              energyCost={25}
              stressImpact="+4"
              image="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop"
              requirements={BUSINESS_REQUIREMENTS.car_wash}
              trigger={
                <Button variant="outline" className="flex-1 text-xs h-9 border-white/20 text-white hover:bg-white/10">
                  Подробнее
                </Button>
              }
              onBuy={() => handleOpenBusiness(
                "Автомойка",
                "service",
                "Комплекс по обслуживанию автомобилей",
                120000,
                11500,
                5000,
                8,
                25,
                4
              )}
            />
          }
          onBuy={() => handleOpenBusiness(
            "Автомойка",
            "service",
            "Комплекс по обслуживанию автомобилей",
            120000,
            11500,
            5000,
            8,
            25,
            4
          )}
        />

        <BusinessDetailCard
          title="Кофейня"
          type="Малый бизнес"
          description="Уютное место с качественным кофе и выпечкой. Важна локация и атмосфера."
          cost={35000}
          income="$6,000 - $15,000/кв"
          expenses="$4,500/кв"
          energyCost={10}
          stressImpact="+1"
          image="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop"
          detailDialog={
            <BusinessDetailDialog
              title="Кофейня"
              type="Малый бизнес"
              description="Уютное место с качественным кофе и выпечкой. Важна локация и атмосфера."
              cost={35000}
              income="$6,000 - $15,000/кв"
              expenses="$4,500/кв"
              energyCost={10}
              stressImpact="+1"
              image="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop"
              requirements={BUSINESS_REQUIREMENTS.cafe}
              trigger={
                <Button variant="outline" className="flex-1 text-xs h-9 border-white/20 text-white hover:bg-white/10">
                  Подробнее
                </Button>
              }
              onBuy={() => handleOpenBusiness(
                "Кофейня",
                "cafe",
                "Уютное место с качественным кофе и выпечкой",
                35000,
                3500,
                1500,
                4,
                10,
                1
              )}
            />
          }
          onBuy={() => handleOpenBusiness(
            "Кофейня",
            "cafe",
            "Уютное место с качественным кофе и выпечкой",
            35000,
            3500,
            1500,
            4,
            10,
            1
          )}
        />
      </div>
    </OpportunityCard>
  )
}
