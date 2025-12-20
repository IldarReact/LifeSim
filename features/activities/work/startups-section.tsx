"use client"

import { Rocket, Brain, Zap } from "lucide-react"
import React from "react"

import { OpportunityCard } from "../ui/opportunity-card"

import { IdeaManagementDialog } from "./idea-management-dialog"

import { useGameStore } from "@/core/model/game-store"
import type { BusinessIdea } from "@/core/types/idea.types"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Progress } from "@/shared/ui/progress"



export function StartupsSection() {
  const {
    player,
    generateIdea,
    developIdea,
    launchBusinessFromIdea,
    discardIdea
  } = useGameStore()

  const [selectedIdea, setSelectedIdea] = React.useState<BusinessIdea | null>(null)

  if (!player) return null

  const handleGenerate = () => {
    if ((player.stats?.energy ?? 0) >= 20) {
      generateIdea()
    }
  }

  return (
    <>
      <OpportunityCard
        title="Стартапы и Идеи"
        description="Генерируйте идеи, создавайте прототипы и запускайте инновационные бизнесы."
        icon={<Rocket className="w-6 h-6 text-purple-400" />}
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop"
        actionLabel={player.businessIdeas?.length > 0 ? "Управление идеями" : "Найти идею"}
      >
        <div className="space-y-4">
          {/* Кнопка генерации */}
          <Button
            onClick={handleGenerate}
            disabled={(player.stats?.energy ?? 0) < 20}
            className="w-full bg-gradient-to-red from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg group"
          >
            <Brain className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Генерировать идею
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
              <Zap className="w-3 h-3 mr-1" /> -20
            </Badge>
          </Button>

          {/* Список идей */}
          {(player.businessIdeas?.length ?? 0) > 0 ? (
            <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {player.businessIdeas?.map(idea => (
                <div
                  key={idea.id}
                  onClick={() => setSelectedIdea(idea)}
                  className="bg-white/5 hover:bg-white/10 p-3 rounded-lg cursor-pointer transition-colors border border-white/5 hover:border-white/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-white text-sm">{idea.name}</h4>
                      <p className="text-xs text-white/40">{idea.type.toUpperCase()}</p>
                    </div>
                    <Badge className={
                      idea.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                        idea.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          idea.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                    }>
                      {idea.stage === 'launched' ? 'Запущен' : `${idea.developmentProgress.toFixed(0)}%`}
                    </Badge>
                  </div>

                  <Progress value={idea.developmentProgress} className="h-1.5 bg-white/10" />

                  <div className="flex justify-between mt-2 text-xs text-white/40">
                    <span>{idea.stage === 'idea' ? 'Концепция' : idea.stage === 'prototype' ? 'Прототип' : 'MVP'}</span>
                    <span>Потенциал: {(idea.potentialReturn * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-white/40 text-sm">
              <p>У вас пока нет бизнес-идей.</p>
              <p>Нажмите кнопку выше, чтобы придумать что-то новое!</p>
            </div>
          )}
        </div>
      </OpportunityCard>

      {selectedIdea && (
        <IdeaManagementDialog
          isOpen={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
          idea={selectedIdea}
          playerMoney={player.stats?.money ?? 0}
          playerSkills={player.personal.skills}
          onDevelop={developIdea}
          onLaunch={(id) => {
            launchBusinessFromIdea(id)
            setSelectedIdea(null)
          }}
          onDiscard={(id) => {
            discardIdea(id)
            setSelectedIdea(null)
          }}
        />
      )}
    </>
  )
}
