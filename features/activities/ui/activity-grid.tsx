"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, X, Heart, TrendingUp, Wallet, Briefcase } from "lucide-react"
import { useState } from "react"

import type { ActivityCard, ActivityGridProps } from "../types"

import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent } from "@/shared/ui/dialog"

export function ActivityGrid({ cards }: ActivityGridProps): React.JSX.Element {
  const [selectedCard, setSelectedCard] = useState<ActivityCard | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-2 sm:p-4">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative h-[350px] sm:h-[400px] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-black shadow-2xl transition-all hover:scale-[1.02] hover:shadow-primary/20"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={card.image || "/placeholder.svg"}
                alt={card.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{card.title}</h3>
                <p className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-widest">
                  {card.subtitle}
                </p>

                <div className="flex gap-2 mt-2 flex-wrap">
                  {card.stats.slice(0, 2).map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white/10 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full text-xs text-white border border-white/10"
                    >
                      <span className="opacity-70 mr-1">{stat.label}:</span>
                      <span className="font-semibold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-white/5 border-white/20 hover:bg-white/20 hover:text-white text-white backdrop-blur-sm transition-all text-xs sm:text-sm"
                  onClick={() => setSelectedCard(card)}
                >
                  Подробнее
                </Button>
                {card.actions[0] && (
                  <Button
                    size="sm"
                    className="w-full bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all font-bold text-xs sm:text-sm"
                    onClick={card.actions[0].onClick}
                  >
                    {card.actions[0].label}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] w-full h-[90vh] sm:h-[85vh] p-0 border-none bg-transparent shadow-none overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10"
              >
                {/* Blurred Background */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl" />
                <img
                  src={selectedCard.image || "/placeholder.svg"}
                  className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl"
                  alt="bg"
                />

                <div className="relative z-10 flex flex-col sm:flex-row h-full overflow-y-auto">
                  {/* Sidebar info */}
                  <div className="w-full sm:w-1/3 p-4 sm:p-8 sm:border-r border-white/10 flex flex-col bg-black/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 sm:top-4 right-2 sm:left-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full z-50"
                      onClick={() => setSelectedCard(null)}
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>

                    <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
                      <div className="aspect-[3/2] w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        <img
                          src={selectedCard.image || "/placeholder.svg"}
                          alt={selectedCard.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">{selectedCard.title}</h2>
                        <p className="text-lg sm:text-xl text-white/60">{selectedCard.subtitle}</p>
                      </div>

                      <p className="text-white/80 leading-relaxed text-sm sm:text-lg">{selectedCard.description}</p>

                      <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                        {selectedCard.stats.map((stat, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5"
                          >
                            <span className="text-white/60 text-sm sm:text-base">{stat.label}</span>
                            <span className="text-white font-bold text-base sm:text-lg">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Content Area */}
                  <div className="flex-1 p-4 sm:p-8 bg-black/10 overflow-y-auto">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <span className="p-1.5 sm:p-2 rounded-lg bg-white/10">
                        <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                      Подробная информация
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Mock sub-cards */}
                      <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm sm:text-base">Статистика</h4>
                            <p className="text-xs text-white/50">История изменений</p>
                          </div>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[70%]" />
                          </div>
                          <p className="text-xs text-white/60 text-right">Рост +12%</p>
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm sm:text-base">Финансы</h4>
                            <p className="text-xs text-white/50">Доходы и расходы</p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-white/80">
                          Ежемесячный баланс положителен. Рекомендуется увеличить инвестиции.
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-6 sm:mt-8 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <span className="p-1.5 sm:p-2 rounded-lg bg-white/10">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                      Доступные действия
                    </h3>

                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {selectedCard.actions.map((action, i) => (
                        <Button
                          key={i}
                          size="lg"
                          className="w-full justify-start h-12 sm:h-16 text-base sm:text-lg bg-white/5 hover:bg-white/20 border border-white/10"
                          onClick={() => {
                            action.onClick()
                            setSelectedCard(null)
                          }}
                        >
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 mr-3 sm:mr-4 flex items-center justify-center text-sm sm:text-base">
                            {i + 1}
                          </div>
                          <span className="text-sm sm:text-base">{action.label}</span>
                          <ChevronRight className="ml-auto w-4 h-4 sm:w-5 sm:h-5 opacity-50" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
