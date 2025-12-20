import {
  DollarSign, ChevronRight, Target, Star, Heart, Brain,
  Home, Utensils, Car, School, Pill, CreditCard, AlertCircle
} from "lucide-react";
import React from "react";

import { useGameStore } from "@/core/model/game-store";
import type { LifeGoal } from "@/core/types";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Progress } from "@/shared/ui/progress";

// Категории расходов (можно вынести в отдельный файл констант)
const expenseCategories = [
  { id: "rent", title: "Квартира", amount: 45000, icon: Home, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600" },
  { id: "food", title: "Еда", amount: 25000, icon: Utensils, img: "https://images.unsplash.com/photo-1543351611-88a0df7c74e3?w=600" },
  { id: "transport", title: "Транспорт", amount: 8000, icon: Car, img: "https://images.unsplash.com/photo-1494905998402-39560b62a7b5?w=600" },
  { id: "education", title: "Образование", amount: 12000, icon: School, img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600" },
  { id: "health", title: "Здоровье", amount: 6000, icon: Pill, img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600" },
  { id: "taxes", title: "Налоги", amount: 38000, icon: CreditCard, img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600" },
] as const;

export function PlayerCard() {
  const { player } = useGameStore();

  if (!player) return null;

  const { familyMembers, lifeGoals } = player.personal;

  // Расчет расходов
  const familyMods = familyMembers?.reduce((acc, member) => ({
    expenses: acc.expenses + member.expenses
  }), { expenses: 0 }) || { expenses: 0 };

  const totalExpenses = expenseCategories.reduce((sum, exp) => sum + exp.amount, 0) + (familyMods.expenses || 0);

  return (
    <div className="space-y-4">
      {/* Карточка Финансов */}
      <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-md transition-all hover:bg-white/10 group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Финансы</h2>
            </div>
            <div className="text-right">
              <p className={`text-2xl md:text-3xl font-bold tracking-tight ${player.quarterlyReport.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {player.quarterlyReport.netProfit > 0 ? '+' : ''}${player.quarterlyReport.netProfit.toLocaleString()}
              </p>
              <span className="text-sm text-white/50 font-medium">чистая прибыль / кв.</span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 justify-between px-4 group/btn">
                <span className="text-white/80 group-hover/btn:text-white transition-colors">Финансовый отчет</span>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover/btn:text-white transition-colors" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-emerald-400" />
                  Квартальный отчет
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Income */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60">Общий доход</span>
                    <span className="text-emerald-400 font-bold text-xl">+${player.quarterlyReport.income.total.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 border-l-2 border-white/10 space-y-1 text-sm">
                    <div className="flex justify-between text-white/40">
                      <span>Зарплата</span>
                      <span>${player.quarterlySalary?.toLocaleString()}</span>
                    </div>
                    {/* Add other income sources breakdown if available in report or calculate them */}
                  </div>
                </div>

                {/* Expenses */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60">Общие расходы</span>
                    <span className="text-rose-400 font-bold text-xl">-${player.quarterlyReport.expenses.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Taxes */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Налоги</span>
                    <span className="text-amber-400 font-bold text-xl">-${player.quarterlyReport.taxes.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                  <span className="text-xl font-bold text-white">Чистая прибыль</span>
                  <span className={`text-2xl font-bold ${player.quarterlyReport.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {player.quarterlyReport.netProfit > 0 ? '+' : ''}${player.quarterlyReport.netProfit.toLocaleString()}
                  </span>
                </div>

                {player.quarterlyReport.warning && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-3 text-rose-300 text-sm">
                    <AlertCircle className="w-5 h-5" />
                    {player.quarterlyReport.warning}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Карточка Игрока */}
      <div className="relative overflow-hidden rounded-3xl bg-black/40 border border-white/10 min-h-[200px] group">
        {/* Фоновое изображение */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=80"
            alt="Background"
            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 p-8 flex flex-col justify-end h-full min-h-[240px]">
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-white mb-2">{player.name}</h2>
            <div className="flex items-center gap-3 text-white/70">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-medium">
                {player.age} лет
              </span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-fit bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md pl-4 pr-6 h-12">
                <Target className="w-5 h-5 mr-3 text-purple-400" />
                Цели и Мечты
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 text-white max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-400" />
                  Мои Цели и Мечты
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 mt-4">
                {lifeGoals?.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
                {(!lifeGoals || lifeGoals.length === 0) && (
                  <p className="text-white/40 text-center py-8">У вас пока нет активных целей.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: LifeGoal }) {
  return (
    <div className={`bg-white/5 border ${goal.isCompleted ? 'border-green-500/30' : 'border-white/10'} rounded-xl p-4 relative overflow-hidden`}>
      {goal.isCompleted && (
        <div className="absolute top-0 right-0 bg-green-500/20 px-3 py-1 rounded-bl-xl text-green-400 text-xs font-bold">
          ВЫПОЛНЕНО
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-white">{goal.title}</h4>
        {goal.type === 'dream' ? (
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ) : (
          <Target className="w-4 h-4 text-blue-400" />
        )}
      </div>
      <p className="text-white/60 text-sm mb-4">{goal.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs text-white/40">
          <span>Прогресс</span>
          <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
        </div>
        <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
      </div>

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1 text-rose-400">
          <Heart className="w-3 h-3" />
          <span>
            +{goal.reward.perTurnReward.happiness ?? 0}/ход
          </span>
        </div>

        <div className="flex items-center gap-1 text-purple-400">
          <Brain className="w-3 h-3" />
          <span>
            +{goal.reward.perTurnReward.sanity ?? 0}/ход
          </span>
        </div>
      </div>
    </div>
  );
}
