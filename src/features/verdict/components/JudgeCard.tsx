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
    <Card className="h-full">
      <CardContent className="p-3 flex flex-col h-full">
        {/* Header: Avatar + Name + Verdict */}
        <div className="flex items-center gap-2 mb-2">
          <JudgeAvatar name={judge.modelName} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{judge.modelName}</div>
            <div className="text-[10px] text-muted-foreground">{config?.personality}</div>
          </div>
          <VerdictBadge verdict={normalizeVerdictCode(judge.verdict)} size="sm" />
        </div>

        {/* Summary */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
          {judge.summary}
        </p>

        {/* Confidence + Expand */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{judge.confidence}% confident</span>
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="flex items-center gap-0.5 hover:text-foreground">
              {open ? 'Less' : 'More'}
              <ChevronDown
                className={cn('h-3 w-3 transition-transform', open && 'rotate-180')}
              />
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        {/* Expanded Content */}
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleContent className="mt-2 pt-2 border-t">
            <p className="text-xs mb-2">{judge.reasoning}</p>
            <ul className="space-y-0.5">
              {judge.keyPoints.map((p, i) => (
                <li key={i} className="text-[10px] flex gap-1">
                  <span>•</span> {p}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
