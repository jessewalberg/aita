import { Card, CardContent } from '@/components/ui/card'
import { VerdictBadge } from './VerdictBadge'
import { ConfidenceMeter } from './ConfidenceMeter'
import { ShareActions } from './ShareActions'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { VERDICT_CONFIG } from 'convex/lib/constants/verdicts'
import { normalizeVerdictCode, type SingleVerdict } from './verdictUtils'

interface SingleVerdictCardProps {
  verdict: SingleVerdict
}

export function SingleVerdictCard({ verdict }: SingleVerdictCardProps) {
  const verdictCode = normalizeVerdictCode(verdict.verdict)

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <VerdictBadge verdict={verdictCode} />
        <p className="mt-2 text-sm text-muted-foreground">
          {VERDICT_CONFIG[verdictCode].label}
        </p>
        <div className="mt-3 flex justify-center">
          <ConfidenceMeter confidence={verdict.confidence} />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              The Reasoning
            </h3>
            <p className="text-sm leading-relaxed">{verdict.reasoning}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Key Points
            </h3>
            <ul className="space-y-1">
              {verdict.keyPoints.map((point, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-emerald-600">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <ShareActions shareId={verdict.shareId} verdict={verdict.verdict} />

      <div className="text-center">
        <Button asChild>
          <Link to="/">New Verdict</Link>
        </Button>
      </div>
    </div>
  )
}
