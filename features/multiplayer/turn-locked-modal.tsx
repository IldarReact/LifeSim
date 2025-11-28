"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { AlertCircle } from "lucide-react";

interface TurnLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TurnLockedModal({ isOpen, onClose }: TurnLockedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-amber-900/90 to-orange-900/90 border-amber-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="w-6 h-6 text-amber-400" />
            Ход завершен
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-white/90 leading-relaxed">
            Вы уже завершили свой ход и ожидаете других игроков.
          </p>
          <p className="text-white/70 text-sm">
            Пока все игроки не завершат ход, вы не можете вносить изменения в игру.
            Вы можете просматривать интерфейс, но все действия заблокированы.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-sm text-amber-200">
              <strong>Подсказка:</strong> Если вы хотите отменить завершение хода и продолжить играть,
              закройте окно ожидания.
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            Понятно
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
