"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { JudgeAvatar } from './JudgeAvatar'
import { VerdictBadge } from './VerdictBadge'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { JUDGES } from 'convex/lib/llm/models'
import { normalizeVerdictCode } from './verdictUtils'

interface JudgeCardProps {
  judge: {
    modelName: string
    verdict: string
    confidence: number
    summary: string
    reasoning: string
    keyPoints: string[]
  }
}

export function JudgeCard({ judge }: JudgeCardProps) {
  const [open, setOpen] = useState(false)
  const config = JUDGES.find((j) => j.name === judge.modelName)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <JudgeAvatar name={judge.modelName} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-semibold">{judge.modelName}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {config?.personality}
                </span>
              </div>
              <VerdictBadge
                verdict={normalizeVerdictCode(judge.verdict)}
                size="sm"
              />
            </div>

            <p className="text-sm text-muted-foreground mb-2">{judge.summary}</p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>{judge.confidence}% confident</span>
            </div>

            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                {open ? 'Hide' : 'Show'} full reasoning
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    open && 'rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 pt-2 border-t">
                <p className="text-sm mb-2">{judge.reasoning}</p>
                <ul className="space-y-1">
                  {judge.keyPoints.map((p, i) => (
                    <li key={i} className="text-xs flex gap-1">
                      <span>•</span> {p}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
