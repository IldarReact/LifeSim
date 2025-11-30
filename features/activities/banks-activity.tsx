"use client";

import { useGameStore } from "@/core/model/game-store";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Banknote, TrendingUp, AlertCircle } from "lucide-react";

export function BanksActivity(): React.JSX.Element | null {
  const { player } = useGameStore();

  if (!player) return null;

  const deposits = player.assets.filter(a => a.type === "deposit");
  const debts = player.debts;

  const totalDeposits = deposits.reduce((s, d) => s + d.value, 0);
  const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0);
  const quarterlyPayment = debts.reduce((s, d) => s + (d.quarterlyPayment || 0), 0);

  const hasIncome = player.quarterlyReport?.income
    ? player.quarterlyReport.income.total > 0
    : player.stats.money > 50000;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950" />
      <div className="fixed inset-0 backdrop-blur-2xl" />

      <div className="relative z-10 container mx-auto p-6 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-100 mb-3 flex items-center justify-center gap-4">
            <Banknote className="w-12 h-12 text-zinc-600" />
            Банк
          </h1>
          <p className="text-zinc-500 text-lg">
            Вклады, кредиты и твоя финансовая реальность
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Вклады", value: `$${totalDeposits.toLocaleString()}` },
            { label: "Долги", value: `$${totalDebt.toLocaleString()}` },
            {
              label: "Чистый капитал",
              value: `$${(totalDeposits - totalDebt).toLocaleString()}`,
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center"
            >
              <p className="text-zinc-500 text-sm mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-zinc-100">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Вклады */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-zinc-300 mb-6 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-zinc-600" />
            Вклады
          </h2>

          {deposits.length === 0 ? (
            <Card className="bg-white/6 border border-white/10 border-dashed rounded-3xl p-20 text-center">
              <p className="text-zinc-500 text-lg">Нет активных вкладов</p>
            </Card>
          ) : (
            <div className="space-y-5">
              {deposits.map(deposit => (
                <Card
                  key={deposit.id}
                  className="bg-white/6 border border-white/10 rounded-3xl p-7"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-100">
                        {deposit.name || "Вклад"}
                      </h3>
                      <p className="text-zinc-500 text-sm">
                        Сумма на счету
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-zinc-100">
                      ${deposit.value.toLocaleString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Button className="w-full mt-8">
            Открыть вклад
          </Button>
        </div>

        {/* Кредиты */}
        <div>
          <h2 className="text-2xl font-semibold text-zinc-300 mb-6 flex items-center gap-3">
            <AlertCircle className="w-7 h-7 text-zinc-600" />
            Кредиты
          </h2>

          {debts.length === 0 ? (
            <Card className="bg-white/6 border border-white/10 border-dashed rounded-3xl p-20 text-center">
              <p className="text-zinc-500 text-lg">Нет активных кредитов</p>
            </Card>
          ) : (
            <div className="space-y-5">
              {debts.map(debt => (
                <Card
                  key={debt.id}
                  className="bg-white/6 border border-white/10 rounded-3xl p-7"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-100">
                        {debt.name || "Кредит"}
                      </h3>
                      <p className="text-zinc-500 text-sm">
                        Остаток долга
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-zinc-100">
                        −${debt.remainingAmount.toLocaleString()}
                      </p>
                      {debt.quarterlyPayment && (
                        <p className="text-zinc-500 text-sm mt-1">
                          Платёж: ${debt.quarterlyPayment.toLocaleString()}/кв
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Button disabled={!hasIncome} className="w-full mt-8">
            {!hasIncome
              ? "Кредит недоступен — нет дохода"
              : "Взять кредит"}
          </Button>
        </div>
      </div>
    </div>
  );
}
