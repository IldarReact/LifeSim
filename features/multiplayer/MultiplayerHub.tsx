// features/multiplayer/MultiplayerHud.tsx
import { getOnlinePlayers } from "@/core/lib/multiplayer";
import { Button } from "@/shared/ui/button";
import { Users, Link } from "lucide-react";

export function MultiplayerHud() {
  const players = getOnlinePlayers();

  if (players.length <= 1) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Ссылка скопирована!");
  };

  return (
    <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 z-50">
      <div className="flex items-center gap-3 mb-3">
        <Users className="w-6 h-6 text-white" />
        <span className="text-white font-bold">Онлайн: {players.length}</span>
      </div>
      <div className="space-y-2">
        {players.map(p => (
          <div key={p.clientId} className="text-white/80 text-sm">
            ● {p.name}
          </div>
        ))}
      </div>
      <Button onClick={copyLink} size="sm" className="w-full mt-3 bg-white/10 hover:bg-white/20">
        <Link className="w-4 h-4 mr-2" />
        Пригласить
      </Button>
    </div>
  );
}