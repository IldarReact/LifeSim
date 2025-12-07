"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, User, DollarSign, Home, CreditCard, PieChart, ArrowLeft, X } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { cn } from "@/shared/utils/utils"
import { useGameStore } from "@/core/model/game-store"
import { createInitialPlayer } from "@/core/lib/initialState"
import { getCharactersForCountry } from "@/core/lib/data-loaders/characters-loader"
import { getJobById } from "@/core/lib/data-loaders/jobs-loader"
import type {
  CategoryCardProps,
  DetailCardProps,
  CharacterDetailedInfo,
  ModalView
} from "../types"


const getCharacterImage = (archetypeId: string): string => {
  switch (archetypeId) {
    case "entrepreneur":
      return "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop"
    case "worker":
      return "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2670&auto=format&fit=crop"
    case "investor":
      return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2671&auto=format&fit=crop"
    case "specialist":
      return "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2580&auto=format&fit=crop"
    case "indebted":
      return "https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=2580&auto=format&fit=crop"
    default:
      return "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop"
  }
}

// Mock detailed info for UI demo purposes
const getDetailedInfo = (archetypeId: string): CharacterDetailedInfo => {
  return {
    family: {
      spouse: { name: "Елена", age: 28, job: "Дизайнер" },
      children: [
        { name: "Максим", age: 5 },
        { name: "Алиса", age: 2 },
      ],
      pet: { name: "Бобик", type: "Собака" },
    },
    assets: [],
    debts: [],
    savings: [],
    investments: [],
  }
}

export interface CharacterSelectUIProps {
  setupCountryId: string
  onSelect: (archetype: string) => void
  onBack?: () => void
}

export function CharacterSelectUI({ setupCountryId, onSelect, onBack }: CharacterSelectUIProps): React.JSX.Element | null {
  const characters = getCharactersForCountry(setupCountryId || 'us')
  const archetypes = characters.map(c => c.archetype)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalView, setModalView] = useState<ModalView>("main")

  const handleNext = (): void => {
    setCurrentIndex((prev) => (prev + 1) % archetypes.length)
  }

  const handlePrev = (): void => {
    setCurrentIndex((prev) => (prev - 1 + archetypes.length) % archetypes.length)
  }

  const currentArchetype = archetypes[currentIndex]
  const currentCharacter = characters[currentIndex]
  const character = createInitialPlayer(currentArchetype, setupCountryId || 'us')
  const detailedInfo = getDetailedInfo(currentArchetype)

  const getVisibleIndices = (): number[] => {
    const prev = (currentIndex - 1 + archetypes.length) % archetypes.length
    const next = (currentIndex + 1) % archetypes.length
    return [prev, currentIndex, next]
  }

  const visibleIndices = getVisibleIndices()

  const handleSelect = (): void => {
    onSelect(currentArchetype)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90">
      {/* Background with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-md opacity-30 transition-all duration-700"
        style={{ backgroundImage: `url(${getCharacterImage(currentArchetype)})` }}
      />

      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-8 left-8 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 md:left-10 z-20 p-4 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md transition-all text-white/70 hover:text-white"
        aria-label="Previous character"
      >
        <ChevronLeft size={40} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 md:right-10 z-20 p-4 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md transition-all text-white/70 hover:text-white"
        aria-label="Next character"
      >
        <ChevronRight size={40} />
      </button>

      {/* Cards Container */}
      <div className="flex items-center justify-center gap-4 md:gap-8 w-full max-w-7xl h-[80vh] perspective-1000">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleIndices.map((idx, i) => {
            const isCenter = i === 1
            const archetype = archetypes[idx]
            const charData = characters[idx]
            const charPreview = createInitialPlayer(archetype, setupCountryId || 'us')

            return (
              <motion.div
                key={`${archetype}-${idx}`}
                layoutId={archetype}
                initial={{ opacity: 0, scale: 0.8, x: isCenter ? 0 : i === 0 ? -100 : 100 }}
                animate={{
                  opacity: isCenter ? 1 : 0.4,
                  scale: isCenter ? 1 : 0.85,
                  x: 0,
                  zIndex: isCenter ? 10 : 1,
                  filter: isCenter ? "blur(0px)" : "blur(4px) brightness(0.6)",
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                  "relative h-[70vh] aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500",
                  "border border-white/10 bg-black/40 backdrop-blur-sm",
                )}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={getCharacterImage(archetype) || "/placeholder.svg"}
                    alt={archetype}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 text-white">
                  <div className="text-center mt-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-2 uppercase tracking-wide drop-shadow-lg">
                      {charData.name}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4 items-center mb-4">
                    {/* Stats Pill */}
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 w-full border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-white/70">Доход:</span>
                        <span className="font-bold text-green-400">
                          ${(() => {
                            const startingJob = getJobById(charData.startingJobId, setupCountryId || 'us')
                            const quarterlySalary = startingJob ? startingJob.salary * 3 : 0
                            return quarterlySalary.toLocaleString()
                          })()}/кв
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-white/70">Капитал:</span>
                        <span className={cn("font-bold", charPreview.stats.money >= 0 ? "text-white" : "text-red-400")}>
                          ${charPreview.stats.money.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-white/70">Счастье:</span>
                        <span className="font-bold text-yellow-400">
                          {(charPreview.happinessMultiplier * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons - Only Visible for Center Card */}
                    {isCenter && (
                      <div className="flex flex-col gap-3 w-full mt-2">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm h-14 text-lg font-medium rounded-xl"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Подробнее...
                        </Button>
                        <Button
                          size="lg"
                          className="w-full bg-white text-black hover:bg-white/90 h-14 text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                          onClick={handleSelect}
                        >
                          Выбрать
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zinc-900/90 border border-white/10 w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white/50 hover:text-white"
                onClick={() => {
                  setIsModalOpen(false)
                  setModalView("main")
                }}
              >
                <X className="h-8 w-8" />
              </Button>

              {/* Header */}
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                  {modalView !== "main" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setModalView("main")}
                      className="text-white hover:bg-white/10"
                    >
                      <ArrowLeft />
                    </Button>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {modalView === "main"
                        ? `Личное дело: ${currentCharacter.name}`
                        : modalView === "family"
                          ? "Семья"
                          : modalView === "assets"
                            ? "Имущество"
                            : modalView === "debts"
                              ? "Долги"
                              : modalView === "savings"
                                ? "Сбережения"
                                : "Инвестиции"}
                    </h2>
                    <p className="text-white/50">
                      {modalView === "main" ? "Полная информация о персонаже" : "Детальный обзор категории"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
                {/* Main View - Grid of Categories */}
                {modalView === "main" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <CategoryCard
                      title="Семья"
                      icon={<User className="w-8 h-8 text-blue-400" />}
                      count={`${detailedInfo.family.children.length + 1} чел.`}
                      onClick={() => setModalView("family")}
                      image="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2670&auto=format&fit=crop"
                    />
                    <CategoryCard
                      title="Имущество"
                      icon={<Home className="w-8 h-8 text-green-400" />}
                      count={`${detailedInfo.assets.length} объектов`}
                      onClick={() => setModalView("assets")}
                      image="https://images.unsplash.com/photo-1560518883-ce09059ee971?q=80&w=2573&auto=format&fit=crop"
                    />
                    <CategoryCard
                      title="Долги"
                      icon={<CreditCard className="w-8 h-8 text-red-400" />}
                      count={`-${detailedInfo.debts.reduce((acc, d) => acc + d.remainingAmount, 0).toLocaleString()}$`}
                      onClick={() => setModalView("debts")}
                      image="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2671&auto=format&fit=crop"
                    />
                    <CategoryCard
                      title="Сбережения"
                      icon={<DollarSign className="w-8 h-8 text-yellow-400" />}
                      count={`${detailedInfo.savings.reduce((acc, s) => acc + s.amount, 0).toLocaleString()}$`}
                      onClick={() => setModalView("savings")}
                      image="https://images.unsplash.com/photo-1565514020176-db79238b6d87?q=80&w=2670&auto=format&fit=crop"
                    />
                    <CategoryCard
                      title="Инвестиции"
                      icon={<PieChart className="w-8 h-8 text-purple-400" />}
                      count={`${detailedInfo.investments.length} активов`}
                      onClick={() => setModalView("investments")}
                      image="https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=2574&auto=format&fit=crop"
                    />
                  </div>
                )}

                {/* Sub-views */}
                {modalView === "family" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailCard
                      title={`Жена: ${detailedInfo.family.spouse.name}`}
                      subtitle={`${detailedInfo.family.spouse.age} лет, ${detailedInfo.family.spouse.job}`}
                      image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop"
                      tags={["Отношения: 100%", "Счастье: Высокое"]}
                    />
                    {detailedInfo.family.children.map((child, idx) => (
                      <DetailCard
                        key={idx}
                        title={`Ребенок: ${child.name}`}
                        subtitle={`${child.age} лет`}
                        image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2670&auto=format&fit=crop"
                        tags={["Образование: Начальное", "Здоровье: 100%"]}
                      />
                    ))}
                    <DetailCard
                      title={`Питомец: ${detailedInfo.family.pet.name}`}
                      subtitle={detailedInfo.family.pet.type}
                      image="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=2574&auto=format&fit=crop"
                      tags={["Лояльность: 100%"]}
                    />
                  </div>
                )}

                {/* Other views are empty for now in this mock */}
              </div>

              {/* Footer Actions in Modal */}
              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10 h-12 px-8"
                  onClick={() => {
                    setIsModalOpen(false)
                    setModalView("main")
                  }}
                >
                  Отмена
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 px-8 h-12 text-lg font-bold rounded-xl shadow-lg"
                  onClick={() => {
                    setIsModalOpen(false)
                    handleSelect()
                  }}
                >
                  Выбрать этого персонажа
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CharacterSelect(): React.JSX.Element | null {
  const { gameStatus, initializeGame, setupCountryId } = useGameStore()

  if (gameStatus !== "select_character") return null

  return (
    <CharacterSelectUI
      setupCountryId={setupCountryId || 'us' || 'ge' || 'br'}
      onSelect={(archetype) => {
        if (setupCountryId) {
          initializeGame(setupCountryId, archetype)
        }
      }}
    />
  )
}

function CategoryCard({ title, icon, count, onClick, image }: CategoryCardProps): React.JSX.Element {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group relative h-48 rounded-2xl overflow-hidden border border-white/10 bg-black/40"
    >
      <div className="absolute inset-0">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent transition-colors" />
      </div>
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="bg-white/10 w-fit p-3 rounded-xl backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{title}</h3>
          <p className="text-white/60 font-medium">{count}</p>
        </div>
      </div>
    </motion.div>
  )
}

function DetailCard({ title, subtitle, image, tags = [], details = [], isRed = false }: DetailCardProps): React.JSX.Element {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row h-full group hover:border-white/20 transition-colors">
      <div className="w-full md:w-40 h-48 md:h-auto relative flex-shrink-0 overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center">
        <h3 className={cn("text-xl font-bold mb-1", isRed ? "text-red-400" : "text-white")}>{title}</h3>
        <p className="text-white/50 mb-4 text-sm">{subtitle}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="bg-white/10 text-white/80 hover:bg-white/20 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {details.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-white/5">
            {details.map((d, i) => (
              <div key={i}>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">{d.label}</p>
                <p className="text-sm font-medium text-white/90">{d.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
