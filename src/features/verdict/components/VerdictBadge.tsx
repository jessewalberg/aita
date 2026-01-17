import { cn } from '@/lib/utils'
import { type VerdictCode } from 'convex/lib/constants/verdicts'

const colorClasses: Record<VerdictCode, string> = {
  YTA: 'bg-red-100 text-red-700 border-red-300',
  NTA: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  ESH: 'bg-amber-100 text-amber-700 border-amber-300',
  NAH: 'bg-blue-100 text-blue-700 border-blue-300',
  INFO: 'bg-zinc-100 text-zinc-700 border-zinc-300',
}

interface VerdictBadgeProps {
  verdict: VerdictCode
  size?: 'sm' | 'md' | 'lg'
}

export function VerdictBadge({ verdict, size = 'lg' }: VerdictBadgeProps) {
  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-6 py-3 text-xl',
  }[size]

  return (
    <div
      className={cn(
        'rounded-lg border-2 font-bold tracking-wide inline-block',
        colorClasses[verdict],
        sizeClass
      )}
    >
      {verdict}
    </div>
  )
}
