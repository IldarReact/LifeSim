"use client";

import { useGameStore } from "@/core/model/game-store";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { getRestActivitiesForCountry } from "@/core/lib/data-loaders/rest-loader";
import {
  Heart,
  Brain,
  Activity,
  Music,
  Book,
  Coffee,
  Gamepad2,
  Mountain,
  Palette,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Heart,
  Brain,
  Activity,
  Music,
  Book,
  Coffee,
  Gamepad2,
  Mountain,
  Palette,
  Zap,
};

export function RestActivity(): React.JSX.Element | null {
  const { player, applyStatChanges } = useGameStore();

  if (!player) return null;

  const activities = getRestActivitiesForCountry(player.countryId || 'us');
  const energy = player.personal.stats.energy;
  const money = player.stats.money;

  const applyRest = (activity: any) => {
    if (energy < activity.energyCost) return;
    if (money < activity.cost) return;

    applyStatChanges({
      energy: -activity.energyCost,
      money: -activity.cost,
      ...activity.effects,
    });
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-0" />
      <img
        src="https://images.unsplash.com/photo-1517816428104-a9f8f5d9c1a0?w=1920&h=1080&fit=crop"
        alt="Rest background"
        className="fixed inset-0 w-full h-full object-cover z-[-1]"
      />

      <div className="relative z-10 container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-4 drop-shadow-lg">
            <Heart className="w-10 h-10 md:w-12 md:h-12 text-pink-400" />
            Отдых и хобби
          </h1>
          <p className="text-white/90 text-lg font-medium drop-shadow-md">
            Восстанови силы и займись любимым делом
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {activities.map((activity) => {
            const Icon = ICON_MAP[activity.icon] || Activity;
            const canDo = energy >= activity.energyCost && money >= activity.cost;

            return (
              <Card
                key={activity.id}
                className="group bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:bg-black/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                {/* Header with Icon */}
                <div className={`h-24 bg-gradient-to-br ${activity.bg} relative flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  <Icon className={`w-12 h-12 ${activity.color} relative z-10 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300`} />
                </div>

                <div className="p-5 flex flex-col h-[calc(100%-6rem)]">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
                      {activity.title}
                    </h3>

                    {/* Cost & Energy */}
                    <div className="flex items-center gap-3 text-sm font-medium mb-4">
                      <span className="flex items-center gap-1 text-amber-300">
                        <Zap className="w-4 h-4" /> -{activity.energyCost}
                      </span>
                      <span className={`flex items-center gap-1 ${activity.cost > 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                        {activity.cost > 0 ? `-$${activity.cost.toLocaleString()}` : "Бесплатно"}
                      </span>
                    </div>

                    {/* Effects */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(activity.effects).map(([key, val]) => {
                        const icons = { happiness: Heart, health: Activity, sanity: Brain, intelligence: Brain };
                        const EffectIcon = icons[key as keyof typeof icons] || Activity;
                        const value = val as number;
                        const color = value > 0 ? "text-green-400" : "text-red-400";
                        const labels = { happiness: "Счастье", health: "Здоровье", sanity: "Рассудок", intelligence: "Интеллект" };

                        return (
                          <div key={key} className="flex items-center gap-2 bg-white/5 rounded-lg p-1.5 px-2">
                            <EffectIcon className={`w-3.5 h-3.5 ${color}`} />
                            <span className="text-xs font-medium text-white/90">
                              {value > 0 ? "+" : ""}{value} {labels[key as keyof typeof labels] || key}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    className={`w-full font-bold transition-all ${canDo
                      ? "bg-white text-black hover:bg-white/90 shadow-lg hover:shadow-white/20"
                      : "bg-white/10 text-white/40 border border-white/10"
                      }`}
                    disabled={!canDo}
                    onClick={() => applyRest(activity)}
                  >
                    {canDo ? "Заняться" : energy < activity.energyCost ? "Нет энергии" : "Нет денег"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
