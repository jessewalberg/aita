import { cn } from '@/lib/utils'

export function ConfidenceMeter({ confidence }: { confidence: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 w-2.5 rounded-sm',
              i < Math.round(confidence / 10)
                ? 'bg-zinc-800'
                : 'bg-zinc-200'
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {confidence}%
      </span>
    </div>
  )
}
