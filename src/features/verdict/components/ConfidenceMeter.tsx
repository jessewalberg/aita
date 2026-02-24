import { cn } from '@/lib/utils'

export function ConfidenceMeter({ confidence }: { confidence: number }) {
  const blocks = Array.from({ length: 10 }, (_, i) => i)

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {blocks.map((block) => (
          <div
            key={block}
            className={cn(
              'h-2 w-2.5 rounded-sm',
              block < Math.round(confidence / 10)
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
