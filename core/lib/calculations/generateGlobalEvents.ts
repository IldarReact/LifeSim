import seedrandom from 'seedrandom';
import type { GlobalEvent } from '@/core/types';

export function generateGlobalEvents(
  turn: number,
  currentEvents: GlobalEvent[]
): GlobalEvent[] {
  const rng = seedrandom(`global_events_${turn}`);

  const possibleEvents: GlobalEvent[] = [
    {
      id: 'pandemic',
      title: 'Pandemic',
      description: 'A global pandemic spreads, affecting health and economy.',
      impact: { gdp: -2, inflation: 1 },
    },
    {
      id: 'tech_boom',
      title: 'Tech Boom',
      description: 'Rapid technological advancements boost productivity.',
      impact: { gdp: 3 },
    },
    {
      id: 'financial_crisis',
      title: 'Financial Crisis',
      description: 'Markets crash, causing financial instability.',
      impact: { gdp: -3, market: -5 },
    },
    {
      id: 'climate_shift',
      title: 'Climate Shift',
      description: 'Significant climate changes affect agriculture.',
      impact: { gdp: -1, inflation: 2 },
    },
  ];

  // 5% chance to add a new event
  if (rng() > 0.95) {
    const newEvent = possibleEvents[Math.floor(rng() * possibleEvents.length)];
    if (!currentEvents.find((e) => e.id === newEvent.id)) {
      return [...currentEvents, newEvent];
    }
  }

  // Keep at most 3 events
  if (currentEvents.length > 3) {
    return currentEvents.slice(1);
  }

  return currentEvents;
}
