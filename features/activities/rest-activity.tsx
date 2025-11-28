"use client";

import { useGameStore } from "@/core/model/game-store";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Heart, Brain, Zap, Activity, Music, Book, Coffee, Gamepad2, Mountain, Palette } from "lucide-react";

const restActivities = [
  {
    id: "walk",
    title: "Прогулка в парке",
    energyCost: 6,
    effects: { happiness: 3, health: 1, sanity: 1 },
    cost: 0,
    icon: Mountain,
    color: "text-emerald-400",
    bg: "from-emerald-900/20 to-emerald-800/10",
  },
  {
    id: "gym",
    title: "Тренировка в зале",
    energyCost: 15,
    effects: { health: 4, happiness: 1, sanity: 1 },
    cost: 600,
    icon: Activity,
    color: "text-orange-400",
    bg: "from-orange-900/20 to-orange-800/10",
  },
  {
    id: "meditation",
    title: "Медитация",
    energyCost: 5,
    effects: { sanity: 2, happiness: 1, intelligence: 1, health: 1 },
    cost: 0,
    icon: Brain,
    color: "text-purple-400",
    bg: "from-purple-900/20 to-purple-800/10",
  },
  {
    id: "reading",
    title: "Чтение книги",
    energyCost: 5,
    effects: { intelligence: 2, happiness: 1, sanity: 1 },
    cost: 0,
    icon: Book,
    color: "text-blue-400",
    bg: "from-blue-900/20 to-blue-800/10",
  },
  {
    id: "music",
    title: "Игра на гитаре",
    energyCost: 8,
    effects: { happiness: 3, sanity: 1, intelligence: 1 },
    cost: 0,
    icon: Music,
    color: "text-pink-400",
    bg: "from-pink-900/20 to-pink-800/10",
  },
  {
    id: "gaming",
    title: "Играть в игры",
    energyCost: 18,
    effects: { happiness: 12, sanity: -3, health: -2, intelligence: 1 },
    cost: 0,
    icon: Gamepad2,
    color: "text-cyan-400",
    bg: "from-cyan-900/20 to-cyan-800/10",
  },
  {
    id: "painting",
    title: "Рисование",
    energyCost: 10,
    effects: { happiness: 3, sanity: 2, intelligence: 2 },
    cost: 800,
    icon: Palette,
    color: "text-indigo-400",
    bg: "from-indigo-900/20 to-indigo-800/10",
  },
  {
    id: "coffee",
    title: "Встреча с друзьями в кафе",
    energyCost: 15,
    effects: { happiness: 10, sanity: 3 },
    cost: 2000,
    icon: Coffee,
    color: "text-amber-400",
    bg: "from-amber-900/20 to-amber-800/10",
  },
] as const;

export function RestActivity(): React.JSX.Element | null {
  const { player, applyStatChanges } = useGameStore();

  if (!player) return null;

  const applyRest = (activity: typeof restActivities[number]) => {
    if (player.personal.energy < activity.energyCost) return;
    if (player.cash < activity.cost) return;

    // Применяем изменения статов
    applyStatChanges({
      energy: -activity.energyCost,
      cash: -activity.cost,
      ...activity.effects
    });
  };

  return (
    <div className="min-h-screen ">
      {/* Фоновая картинка + блюр */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-0" />
      <img
        src="https://images.unsplash.com/photo-1517816428104-a9f8f5d9c1a0?w=1920&h=1080&fit=crop"
        alt="Rest background"
        className="fixed inset-0 w-full h-full object-cover z-[-1]"
      />

      <div className="relative z-10 container mx-auto p-6 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center justify-center gap-4">
            <Heart className="w-12 h-12 text-pink-400" />
            Отдых и хобби
          </h1>
          <p className="text-white/80 text-lg">Восстанови силы и займись любимым делом</p>
        </div>

        {/* Карточки хобби */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restActivities.map((activity) => {
            const Icon = activity.icon;
            const canDo = player.personal.energy >= activity.energyCost && player.cash >= activity.cost;

            return (
              <Card
                key={activity.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:bg-white/20 transition-all"
              >
                <div className={`h-32 bg-gradient-to-br ${activity.bg} relative`}>
                  <div className="absolute inset-0 bg-black/40" />
                  <Icon className={`w-16 h-16 ${activity.color} absolute bottom-4 right-4 opacity-90`} />
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-white">{activity.title}</h3>
                  <p className="text-sm text-white/70">
                    Энергия: −{activity.energyCost} • {activity.cost > 0 ? `−$${activity.cost.toLocaleString()}` : "Бесплатно"}
                  </p>

                  <div className="space-y-1 text-sm">
                    {Object.entries(activity.effects).map(([key, val]) => {
                      const icons = { happiness: Heart, health: Activity, sanity: Brain, intelligence: Brain };
                      const Icon = icons[key as keyof typeof icons];
                      const color = val > 0 ? "text-green-400" : "text-red-400";
                      const labels = { happiness: "счастья", health: "здоровья", sanity: "рассудка", intelligence: "интеллекта" };
                      return (
                        <div key={key} className={`flex items-center gap-2 ${color}`}>
                          <Icon className="w-4 h-4" />
                          <span>{val > 0 ? "+" : ""}{val} {labels[key as keyof typeof labels]}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50"
                    disabled={!canDo}
                    onClick={() => applyRest(activity)}
                  >
                    {canDo ? "Заняться" : player.personal.energy < activity.energyCost ? "Недостаточно энергии" : "Недостаточно денег"}
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