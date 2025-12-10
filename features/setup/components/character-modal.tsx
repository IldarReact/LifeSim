import { motion } from "framer-motion"
import { User, DollarSign, Home, CreditCard, PieChart, ArrowLeft, X } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { cn } from "@/shared/utils/utils"
import { CATEGORY_IMAGES, DETAIL_IMAGES } from "../shared-constants"
import { MOCK_DETAILED_INFO } from "../utils"
import type { ModalView, CategoryCardProps, DetailCardProps } from "../types"

interface CharacterModalProps {
  isOpen: boolean
  modalView: ModalView
  characterName: string
  onClose: () => void
  onBack: () => void
  onSelect: () => void
  setModalView: (view: ModalView) => void
}

export function CharacterModal({ isOpen, modalView, characterName, onClose, onBack, onSelect, setModalView }: CharacterModalProps) {
  if (!isOpen) return null

  const modalTitle = modalView === "main" ? `Личное дело: ${characterName}` :
    modalView === "family" ? "Семья" :
    modalView === "assets" ? "Имущество" :
    modalView === "debts" ? "Долги" :
    modalView === "savings" ? "Сбережения" : "Инвестиции"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-zinc-900/90 border border-white/10 w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
      >
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 text-white/50 hover:text-white" onClick={onClose}>
          <X className="h-8 w-8" />
        </Button>

        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            {modalView !== "main" && (
              <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10">
                <ArrowLeft />
              </Button>
            )}
            <div>
              <h2 className="text-3xl font-bold text-white">{modalTitle}</h2>
              <p className="text-white/50">
                {modalView === "main" ? "Полная информация о персонаже" : "Детальный обзор категории"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
          {modalView === "main" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CategoryCard title="Семья" icon={<User className="w-8 h-8 text-blue-400" />} count={`${MOCK_DETAILED_INFO.family.children.length + 1} чел.`} onClick={() => setModalView("family")} image={CATEGORY_IMAGES.family} />
              <CategoryCard title="Имущество" icon={<Home className="w-8 h-8 text-green-400" />} count={`${MOCK_DETAILED_INFO.assets.length} объектов`} onClick={() => setModalView("assets")} image={CATEGORY_IMAGES.assets} />
              <CategoryCard title="Долги" icon={<CreditCard className="w-8 h-8 text-red-400" />} count={`-${MOCK_DETAILED_INFO.debts.reduce((acc, d) => acc + d.remainingAmount, 0).toLocaleString()}$`} onClick={() => setModalView("debts")} image={CATEGORY_IMAGES.debts} />
              <CategoryCard title="Сбережения" icon={<DollarSign className="w-8 h-8 text-yellow-400" />} count={`${MOCK_DETAILED_INFO.savings.reduce((acc, s) => acc + s.amount, 0).toLocaleString()}$`} onClick={() => setModalView("savings")} image={CATEGORY_IMAGES.savings} />
              <CategoryCard title="Инвестиции" icon={<PieChart className="w-8 h-8 text-purple-400" />} count={`${MOCK_DETAILED_INFO.investments.length} активов`} onClick={() => setModalView("investments")} image={CATEGORY_IMAGES.investments} />
            </div>
          )}

          {modalView === "family" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard title={`Жена: ${MOCK_DETAILED_INFO.family.spouse.name}`} subtitle={`${MOCK_DETAILED_INFO.family.spouse.age} лет, ${MOCK_DETAILED_INFO.family.spouse.job}`} image={DETAIL_IMAGES.spouse} tags={["Отношения: 100%", "Счастье: Высокое"]} />
              {MOCK_DETAILED_INFO.family.children.map((child, idx) => (
                <DetailCard key={idx} title={`Ребенок: ${child.name}`} subtitle={`${child.age} лет`} image={DETAIL_IMAGES.child} tags={["Образование: Начальное", "Здоровье: 100%"]} />
              ))}
              <DetailCard title={`Питомец: ${MOCK_DETAILED_INFO.family.pet.name}`} subtitle={MOCK_DETAILED_INFO.family.pet.type} image={DETAIL_IMAGES.pet} tags={["Лояльность: 100%"]} />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-4">
          <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 h-12 px-8" onClick={onClose}>Отмена</Button>
          <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 h-12 text-lg font-bold rounded-xl shadow-lg" onClick={onSelect}>Выбрать этого персонажа</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CategoryCard({ title, icon, count, onClick, image }: CategoryCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick} className="cursor-pointer group relative h-48 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 to-transparent transition-colors" />
      </div>
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="bg-white/10 w-fit p-3 rounded-xl backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">{icon}</div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{title}</h3>
          <p className="text-white/60 font-medium">{count}</p>
        </div>
      </div>
    </motion.div>
  )
}

function DetailCard({ title, subtitle, image, tags = [], details = [], isRed = false }: DetailCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row h-full group hover:border-white/20 transition-colors">
      <div className="w-full md:w-40 h-48 md:h-auto relative shrink-0 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent md:hidden" />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center">
        <h3 className={cn("text-xl font-bold mb-1", isRed ? "text-red-400" : "text-white")}>{title}</h3>
        <p className="text-white/50 mb-4 text-sm">{subtitle}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="bg-white/10 text-white/80 hover:bg-white/20 font-normal">{tag}</Badge>
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
