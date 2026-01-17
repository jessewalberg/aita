import { VERDICT_CONFIG, type VerdictCode } from 'convex/lib/constants/verdicts'

export type PanelVerdict = {
  panelVerdicts: Array<{
    modelName: string
    verdict: string
    confidence: number
    summary: string
    reasoning: string
    keyPoints: string[]
  }>
  verdict: string
  confidence: number
  summary: string
  reasoning: string
  keyPoints: string[]
  synthesis: string
  dissent: string
  panelSplit: string
  shareId: string
  mode: 'panel'
}

export type SingleVerdict = {
  verdict: string
  confidence: number
  summary: string
  reasoning: string
  keyPoints: string[]
  shareId: string
  mode: 'single'
}

export function isVerdictCode(value: string): value is VerdictCode {
  return Object.prototype.hasOwnProperty.call(VERDICT_CONFIG, value)
}

export function normalizeVerdictCode(value: string): VerdictCode {
  return isVerdictCode(value) ? value : 'INFO'
}

export function isPanelVerdict(value: unknown): value is PanelVerdict {
  const v = value as PanelVerdict | null
  return (
    !!v &&
    v.mode === 'panel' &&
    Array.isArray(v.panelVerdicts) &&
    v.panelVerdicts.length > 0
  )
}

export function isSingleVerdict(value: unknown): value is SingleVerdict {
  const v = value as SingleVerdict | null
  return !!v && v.mode === 'single'
}
