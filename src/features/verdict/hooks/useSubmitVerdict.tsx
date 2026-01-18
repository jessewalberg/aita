import { useState } from 'react'
import { useAction } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '../../../../convex/_generated/api'

type SubmitPayload = {
  situation: string
  visitorId?: string
  userId?: string
  isPro?: boolean
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
        isPro: payload.isPro,
      })

      // Navigate to verdict page on success
      navigate({ to: '/verdict/$shareId', params: { shareId: result.shareId } })
      return { success: true }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (message.includes('RATE_LIMITED')) {
        return { success: false, error: 'RATE_LIMITED' }
      }
      console.error('Verdict submission failed:', e)
      return { success: false, error: 'UNKNOWN' }
    } finally {
      setIsPending(false)
    }
  }

  return { mutate, isPending }
}
