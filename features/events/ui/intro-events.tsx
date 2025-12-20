"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/ui/button"

interface IntroEvent {
  title: string
  description: string
  type: "world" | "country"
}

interface IntroEventsProps {
  countryName: string
  onComplete: () => void
}

export function IntroEvents({ countryName, onComplete }: IntroEventsProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0)

  const events: IntroEvent[] = [
    {
      title: "Добро пожаловать в мир симулятора жизни",
      description:
        "Вы начинаете свой путь в мире с реалистичной экономикой. Каждое ваше решение будет влиять на вашу жизнь. Управляйте финансами, семьёй, работой и отдыхом. Каждые 3 месяца (1 ход) мир будет меняться, происходить события, влияющие на экономику и вашу жизнь.",
      type: "world",
    },
    {
      title: `Добро пожаловать в ${countryName}`,
      description:
        "Вы начинаете свою жизнь в этой стране. Здесь своя экономика, налоги, инфляция и возможности. Изучите условия и адаптируйтесь к местным реалиям. Помните: каждая страна уникальна и предлагает свои преимущества и вызовы.",
      type: "country",
    },
  ]

  const currentEvent = events[currentIndex]
  const isLast = currentIndex === events.length - 1

  const handleNext = (): void => {
    if (isLast) {
      onComplete()
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-4"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full">
                <span className="text-sm font-medium text-white">
                  {currentEvent.type === "world" ? "Мировое событие" : "Событие в стране"}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white">{currentEvent.title}</h2>

              <p className="text-lg text-white/80 leading-relaxed">{currentEvent.description}</p>
            </div>

            <div className="flex items-center justify-between pt-6">
              <div className="flex gap-2">
                {events.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/30"
                    }`}
                  />
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleNext}
                className="bg-white/90 hover:bg-white text-black shadow-xl 
                           px-6 py-3 font-bold rounded-xl
                           flex items-center gap-2 group"
              >
                {isLast ? "Начать игру" : "Далее"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
