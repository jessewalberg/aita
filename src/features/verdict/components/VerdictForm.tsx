"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSubmitVerdict } from '../hooks/useSubmitVerdict'
import { useVisitorId } from '@/hooks/useVisitorId'
import { Loader2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Role } from '../../../../convex/lib/permissions'

interface VerdictFormProps {
  userId?: string
  userTier?: 'free' | 'pro'
  userRole?: Role
  hasUnlimitedAccess?: boolean
  remaining?: number
  limit?: number
  isSignedIn?: boolean
}

export function VerdictForm({
  userId,
  userTier,
  userRole,
  hasUnlimitedAccess = false,
  remaining = 0,
  limit = 2,
  isSignedIn = false,
}: VerdictFormProps) {
  const [situation, setSituation] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [panelStep, setPanelStep] = useState(0)
  const visitorId = useVisitorId()
  const { mutate: submit, isPending } = useSubmitVerdict()

  const chars = situation.length
  const isValid = chars >= 50 && chars <= 5000
  const hasRemaining = hasUnlimitedAccess || remaining > 0
  const canSubmit = isValid && !isPending && (userId || visitorId) && hasRemaining

  const panelSteps = useMemo(
    () => [
      'Judge Claude is deliberating...',
      'Judge GPT is analyzing...',
      'Judge Gemini is considering...',
      'Judge Grok is investigating...',
      'Chief Judge is synthesizing...',
    ],
    []
  )

  useEffect(() => {
    if (!isPending) {
      setPanelStep(0)
      return
    }

    const interval = window.setInterval(() => {
      setPanelStep((current) => (current + 1) % panelSteps.length)
    }, 1200)

    return () => window.clearInterval(interval)
  }, [isPending, panelSteps.length])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const result = await submit({
      situation: situation.trim(),
      visitorId,
      userId,
      userTier,
      userRole,
      isPrivate,
    })

    if (!result.success) {
      if (result.error === 'RATE_LIMITED') {
        toast.error('Daily limit reached', {
          description: isSignedIn
            ? "You've used all 3 free verdicts today. Upgrade to Pro for unlimited."
            : "You've used all 2 free verdicts today. Sign in for 1 more or upgrade to Pro.",
        })
      } else {
        toast.error('Something went wrong', {
          description: 'The judges are unavailable. Please try again.',
        })
      }
    }
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Panel Mode
        </CardTitle>
        <CardDescription>
          4 AI judges debate, Chief Judge rules
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

          <div className="flex items-center gap-2">
            <Checkbox
              id="isPrivate"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked === true)}
              disabled={isPending}
            />
            <label
              htmlFor="isPrivate"
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              Keep my verdict private
            </label>
          </div>

          <Button type="submit" disabled={!canSubmit} className="w-full" size="lg">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consulting the Panel...
              </>
            ) : !hasRemaining ? (
              'Daily Limit Reached'
            ) : (
              'Summon the Panel'
            )}
          </Button>

          {!hasUnlimitedAccess && (
            <p className="text-center text-xs text-muted-foreground">
              {remaining} of {limit} free verdicts remaining today
              {!isSignedIn && ' • Sign in for 1 more'}
            </p>
          )}

          {isPending && (
            <div className="rounded-lg border border-dashed border-muted-foreground/40 p-3 text-xs text-muted-foreground space-y-1">
              {panelSteps.map((step, index) => (
                <div
                  key={step}
                  className={cn(
                    'flex items-center gap-2 transition-colors',
                    index === panelStep && 'text-foreground'
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
