import { useState } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'

type SubmitPayload = {
  situation: string
  mode: 'single' | 'panel'
  visitorId?: string
  userId?: string
  isPro: boolean
}

export function useSubmitVerdict() {
  const generateSingle = useAction(
    api.functions.verdicts.actions.generateSingleVerdict
  )
  const generatePanel = useAction(
    api.functions.verdicts.actions.generatePanelVerdict
  )
  const [isPending, setIsPending] = useState(false)

  async function mutate(payload: SubmitPayload) {
    setIsPending(true)
    try {
      if (payload.mode === 'panel') {
        return await generatePanel({
          situation: payload.situation,
          visitorId: payload.visitorId,
          userId: payload.userId,
        })
      }

      return await generateSingle({
        situation: payload.situation,
        visitorId: payload.visitorId,
        userId: payload.userId,
      })
    } finally {
      setIsPending(false)
    }
  }

  return { mutate, isPending }
}
