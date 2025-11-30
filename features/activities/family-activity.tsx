"use client";

import { useGameStore } from "@/core/model/game-store";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Heart, Brain, DollarSign } from "lucide-react";
import type { FamilyMember } from "@/core/types";

export function FamilyActivity(): React.JSX.Element | null {
  const { player } = useGameStore();
  if (!player) return null;

  const members = player.personal.familyMembers;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {members.map(member => (
        <FamilyMemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

function FamilyMemberCard({ member }: { member: FamilyMember }) {
  return (
    <Card className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-4">
      <h4 className="text-white text-lg font-bold">{member.name}</h4>
      <p className="text-sm text-white/60 capitalize">
        {member.type} • {member.age} лет
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {member.income > 0 && (
          <div className="text-green-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> +${member.income}
          </div>
        )}

        {member.expenses > 0 && (
          <div className="text-red-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> −${member.expenses}
          </div>
        )}

        <div className="text-pink-400 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          +{member.passiveEffects?.happiness ?? 0}
        </div>

        <div className="text-purple-400 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          +{member.passiveEffects?.sanity ?? 0}
        </div>
      </div>

      <Button variant="outline" className="w-full">
        Подробнее
      </Button>
    </Card>
  );
}
