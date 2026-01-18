import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { JudgeCard } from './JudgeCard'
import { VerdictBadge } from './VerdictBadge'
import { ConfidenceMeter } from './ConfidenceMeter'
import { DissentSection } from './DissentSection'
import { ShareActions } from './ShareActions'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Users, Gavel } from 'lucide-react'
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {verdict.panelVerdicts.map((pv, i) => (
          <JudgeCard key={i} judge={pv} />
        ))}
      </div>

      <Separator />

      {/* Chief Judge Section */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/20 to-slate-900/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Chief Judge Avatar */}
            <div className="rounded-full h-14 w-14 bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
              <Gavel className="h-7 w-7" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-lg text-violet-300">Chief Judge</span>
                <span className="text-xs text-violet-400/70 px-2 py-0.5 bg-violet-500/10 rounded-full">
                  Synthesizer
                </span>
              </div>

              {/* Final Ruling */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <VerdictBadge verdict={verdictCode} />
                <span className="text-sm text-muted-foreground">
                  {VERDICT_CONFIG[verdictCode].label}
                </span>
                <span className="text-sm font-medium text-violet-300">
                  Panel ruled {verdict.panelSplit}
                </span>
              </div>

              <ConfidenceMeter confidence={verdict.confidence} />

              {/* Synthesis */}
              <div className="mt-4 pt-4 border-t border-violet-500/20">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
                  The Synthesis
                </h3>
                <p className="text-sm leading-relaxed text-white/90">
                  {verdict.synthesis || verdict.reasoning}
                </p>
              </div>

              {/* Key Points */}
              {verdict.keyPoints.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
                    Key Points
                  </h3>
                  <ul className="space-y-1">
                    {verdict.keyPoints.map((p, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-violet-400">•</span>
                        <span className="text-white/80">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
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
