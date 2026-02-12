import * as Sentry from '@sentry/core'
import { useState } from 'react'
import { useAction } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '../../../../convex/_generated/api'
import type { Role } from '../../../../convex/lib/permissions'

type SubmitPayload = {
  situation: string
  visitorId?: string
  userId?: string
  userTier?: 'free' | 'pro'
  userRole?: Role
  isPrivate?: boolean
}

type SubmitResult = {
  success: boolean
  error?: 'RATE_LIMITED' | 'UNKNOWN'
}

export function useSubmitVerdict() {
  const navigate = useNavigate()
  const generatePanel = useAction(
    api.functions.verdicts.actions.generatePanelVerdict
  )
  const [isPending, setIsPending] = useState(false)

  async function mutate(payload: SubmitPayload): Promise<SubmitResult> {
    setIsPending(true)
    try {
      const result = await generatePanel({
        situation: payload.situation,
        visitorId: payload.visitorId,
        userId: payload.userId,
        userTier: payload.userTier,
        userRole: payload.userRole,
        isPrivate: payload.isPrivate,
      })

      // Navigate to verdict page on success
      navigate({ to: '/verdict/$shareId', params: { shareId: result.shareId } })
      return { success: true }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (message.includes('RATE_LIMITED')) {
        return { success: false, error: 'RATE_LIMITED' }
      }
      Sentry.captureException(e)
      return { success: false, error: 'UNKNOWN' }
    } finally {
      setIsPending(false)
    }
  }

  return { mutate, isPending }
}
