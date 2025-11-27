"use client";

import { useGameStore } from "@/core/model/game-store";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import type { EconomicEvent } from "@/core/types";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  ArrowUp,
  ArrowDown
} from "lucide-react";

const eventIcons: Record<EconomicEvent['type'], React.ReactNode> = {
  crisis: <AlertTriangle className="w-5 h-5 text-red-400" />,
  boom: <TrendingUp className="w-5 h-5 text-emerald-400" />,
  recession: <TrendingDown className="w-5 h-5 text-orange-400" />,
  inflation_spike: <Zap className="w-5 h-5 text-yellow-400" />,
  rate_hike: <ArrowUp className="w-5 h-5 text-blue-400" />,
  rate_cut: <ArrowDown className="w-5 h-5 text-cyan-400" />,
};

const eventColors: Record<EconomicEvent['type'], string> = {
  crisis: 'bg-red-500/10 border-red-500/20',
  boom: 'bg-emerald-500/10 border-emerald-500/20',
  recession: 'bg-orange-500/10 border-orange-500/20',
  inflation_spike: 'bg-yellow-500/10 border-yellow-500/20',
  rate_hike: 'bg-blue-500/10 border-blue-500/20',
  rate_cut: 'bg-cyan-500/10 border-cyan-500/20',
};

export function EconomicEventsPanel() {
  const { player, countries } = useGameStore();

  if (!player) return null;

  const country = countries[player.countryId];
  const activeEvents = country?.activeEvents || [];

  if (activeEvents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-white/70" />
        <h3 className="text-lg font-bold text-white">Экономические события</h3>
      </div>

      {activeEvents.map((event) => (
        <Card
          key={event.id}
          className={`p-4 border ${eventColors[event.type]} backdrop-blur-sm`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white/5">
              {eventIcons[event.type]}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-white">{event.title}</h4>
                <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                  {event.duration} кв.
                </Badge>
              </div>

              <p className="text-sm text-white/70 mb-3">{event.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {event.effects.inflationChange && (
                  <div className="flex items-center gap-1">
                    <span className="text-white/50">Инфляция:</span>
                    <span className={event.effects.inflationChange > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {event.effects.inflationChange > 0 ? '+' : ''}{event.effects.inflationChange}%
                    </span>
                  </div>
                )}

                {event.effects.keyRateChange && (
                  <div className="flex items-center gap-1">
                    <span className="text-white/50">Ключ. ставка:</span>
                    <span className={event.effects.keyRateChange > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {event.effects.keyRateChange > 0 ? '+' : ''}{event.effects.keyRateChange}%
                    </span>
                  </div>
                )}

                {event.effects.gdpGrowthChange && (
                  <div className="flex items-center gap-1">
                    <span className="text-white/50">Рост ВВП:</span>
                    <span className={event.effects.gdpGrowthChange > 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {event.effects.gdpGrowthChange > 0 ? '+' : ''}{event.effects.gdpGrowthChange}%
                    </span>
                  </div>
                )}

                {event.effects.unemploymentChange && (
                  <div className="flex items-center gap-1">
                    <span className="text-white/50">Безработица:</span>
                    <span className={event.effects.unemploymentChange > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {event.effects.unemploymentChange > 0 ? '+' : ''}{event.effects.unemploymentChange}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
