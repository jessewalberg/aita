import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { JudgeCard } from './JudgeCard'
import { VerdictBadge } from './VerdictBadge'
import { ConfidenceMeter } from './ConfidenceMeter'
import { DissentSection } from './DissentSection'
import { ShareActions } from './ShareActions'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Scale, Users } from 'lucide-react'
import { VERDICT_CONFIG } from 'convex/lib/constants/verdicts'
import { normalizeVerdictCode, type PanelVerdict } from './verdictUtils'

interface PanelDisplayProps {
  verdict: PanelVerdict
}

export function PanelDisplay({ verdict }: PanelDisplayProps) {
  const majorityVerdict = verdict.verdict
  const dissenters = verdict.panelVerdicts.filter(
    (p) => p.verdict !== majorityVerdict
  )
  const dissenterNames =
    dissenters.length > 0
      ? dissenters.map((p) => p.modelName).join(', ')
      : undefined
  const verdictCode = normalizeVerdictCode(verdict.verdict)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium uppercase tracking-wider">
            The Panel
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {verdict.panelVerdicts.map((pv, i) => (
          <JudgeCard key={i} judge={pv} />
        ))}
      </div>

      <Separator />

      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
          <Scale className="h-4 w-4" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Final Ruling
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <VerdictBadge verdict={verdictCode} />
          <p className="text-sm text-muted-foreground">
          {VERDICT_CONFIG[verdictCode].label}
          </p>
          <ConfidenceMeter confidence={verdict.confidence} />
          <p className="text-sm font-medium mt-1">
            Panel ruled {verdict.panelSplit}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              The Synthesis
            </h3>
            <p className="text-sm leading-relaxed">
              {verdict.synthesis || verdict.reasoning}
            </p>
          </div>

          {verdict.keyPoints.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Key Points
              </h3>
              <ul className="space-y-1">
                {verdict.keyPoints.map((p, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-emerald-600">✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {verdict.dissent && (
        <DissentSection
          dissent={verdict.dissent}
          dissenterName={dissenterNames}
        />
      )}

      <ShareActions shareId={verdict.shareId} verdict={verdict.verdict} />

      <div className="text-center">
        <Button asChild>
          <Link to="/">Summon Another Panel</Link>
        </Button>
      </div>
    </div>
  )
}
