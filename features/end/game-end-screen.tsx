"use client"


// DEPRECATED: This component uses old store structure
// Use features/end/ui/game-end.tsx instead
export function GameEndScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-foreground mb-4">DEPRECATED</h1>
        <p className="text-2xl text-muted-foreground">
          This component is deprecated. Use GameEnd from features/end/ui instead.
        </p>
      </div>
    </div>
  )
}
