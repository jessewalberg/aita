"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { ModeSelector } from './ModeSelector'
import { useSubmitVerdict } from '../hooks/useSubmitVerdict'
import { useVisitorId } from '@/hooks/useVisitorId'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerdictFormProps {
  remainingSingle: number
  userId?: string
  isPro: boolean
}

export function VerdictForm({ remainingSingle, userId, isPro }: VerdictFormProps) {
  const [situation, setSituation] = useState('')
  const [mode, setMode] = useState<'single' | 'panel'>(
    isPro ? 'panel' : 'single'
  )
  const visitorId = useVisitorId()
  const { mutate: submit, isPending } = useSubmitVerdict()

  const chars = situation.length
  const isValid = chars >= 50 && chars <= 5000
  const canSubmit =
    isValid && !isPending && (mode === 'panel' || remainingSingle > 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    submit({ situation: situation.trim(), mode, visitorId, userId, isPro })
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <ModeSelector mode={mode} onModeChange={setMode} isPro={isPro} />
        <CardDescription className="mt-3">
          {mode === 'single'
            ? '1 AI judge delivers a quick verdict'
            : '3 AI judges debate, Chief Judge rules'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Describe your situation... Who did what? Why are you questioning if you're wrong?"
              className="min-h-[150px] resize-none"
              disabled={isPending}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span
                className={cn(
                  chars >= 50 && chars <= 5000 && 'text-emerald-600'
                )}
              >
                {chars} / 5000
              </span>
              {chars < 50 && <span>{50 - chars} more needed</span>}
            </div>
          </div>

          <Button type="submit" disabled={!canSubmit} className="w-full" size="lg">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'panel' ? 'Consulting the Panel...' : 'Analyzing...'}
              </>
            ) : mode === 'panel' ? (
              'Summon the Panel'
            ) : (
              'Get Verdict'
            )}
          </Button>

          {!isPro && mode === 'single' && (
            <p className="text-center text-xs text-muted-foreground">
              {remainingSingle} free verdicts remaining today
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
