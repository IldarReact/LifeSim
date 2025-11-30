"use client";

import React from "react";
import { useGameStore } from "@/core/model/game-store";
import { SectionSeparator } from "@/shared/ui/section-separator";
import { OpportunityCard } from "./ui/opportunity-card";
import { Button } from "@/shared/ui/button";
import { Brain } from "lucide-react";

export function EducationActivity(): React.JSX.Element | null {
  const { player, studyCourse, applyToUniversity } = useGameStore();
  if (!player) return null;

  const money = player.stats.money;

  const enrollCourse = (
    name: string,
    cost: number,
    skill: string
  ) => {
    if (money < cost) return;

    studyCourse(name, cost, {}, skill, 1);
  };

  const enrollUni = (
    name: string,
    cost: number,
    skill: string,
    duration: number
  ) => {
    if (money < cost) return;

    applyToUniversity(name, cost, {}, skill, duration);
  };

  return (
    <div className="space-y-8">
      <SectionSeparator title="Курсы" />

      <OpportunityCard
        title="Английский (Business)"
        description="Деловой английский для работы и переезда"
        icon={<Brain className="w-6 h-6 text-blue-400" />}
        actionLabel="$500"
        onAction={() =>
          enrollCourse("English Business", 500, "English")
        }
      />

      <OpportunityCard
        title="Python"
        description="Основы разработки на Python"
        icon={<Brain className="w-6 h-6 text-purple-400" />}
        actionLabel="$1200"
        onAction={() =>
          enrollCourse("Python", 1200, "Python")
        }
      />

      <SectionSeparator title="Университет" />

      <OpportunityCard
        title="Бакалавр IT"
        description="4 года профильного образования"
        icon={<Brain className="w-6 h-6 text-cyan-400" />}
        actionLabel="$5000"
        onAction={() =>
          enrollUni("IT Bachelor", 5000, "Programming", 16)
        }
      />

      <Button className="w-full">
        Деньги: ${money}
      </Button>
    </div>
  );
}
