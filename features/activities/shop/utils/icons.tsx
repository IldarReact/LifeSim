import { Heart, Zap, Brain, Smile, TrendingUp } from 'lucide-react'

const STAT_ICONS: Record<string, React.ReactElement> = {
  health: <Heart className="w-4 h-4 text-red-400" />,
  energy: <Zap className="w-4 h-4 text-yellow-400" />,
  sanity: <Brain className="w-4 h-4 text-purple-400" />,
  happiness: <Smile className="w-4 h-4 text-pink-400" />,
  intelligence: <TrendingUp className="w-4 h-4 text-blue-400" />,
}

export function getStatIcon(key: string): React.ReactElement | null {
  return STAT_ICONS[key] || null
}
