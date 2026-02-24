import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface OriginalQuerySectionProps {
  situation: string
}

const PREVIEW_CHARS = 220

export function OriginalQuerySection({ situation }: OriginalQuerySectionProps) {
  const [showFull, setShowFull] = useState(false)
  const hasOverflow = situation.length > PREVIEW_CHARS
  const preview = hasOverflow
    ? `${situation.slice(0, PREVIEW_CHARS).trimEnd()}...`
    : situation

  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Original Query
        </h2>

        <p className="text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
          {showFull || !hasOverflow ? situation : preview}
        </p>

        {hasOverflow && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowFull((current) => !current)}
          >
            {showFull ? 'Hide full query' : 'View full query'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
