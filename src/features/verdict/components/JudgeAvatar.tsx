import { Brain, Sparkles, Zap, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const config = {
  Claude: { icon: Brain, bg: 'bg-amber-100', text: 'text-amber-700' },
  GPT: { icon: Sparkles, bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Gemini: { icon: Zap, bg: 'bg-blue-100', text: 'text-blue-700' },
  Grok: { icon: Search, bg: 'bg-rose-100', text: 'text-rose-700' },
}

export function JudgeAvatar({
  name,
  size = 'md',
}: {
  name: string
  size?: 'sm' | 'md'
}) {
  const c = config[name as keyof typeof config] ?? config.Claude
  const Icon = c.icon
  const sizeClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        c.bg,
        c.text,
        sizeClass
      )}
    >
      <Icon className={iconSize} />
    </div>
  )
}
