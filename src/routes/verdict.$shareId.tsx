import { createFileRoute } from '@tanstack/react-router'
import { ConvexHttpClient } from 'convex/browser'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { PanelDisplay } from '@/features/verdict/components/PanelDisplay'
import { SingleVerdictCard } from '@/features/verdict/components/SingleVerdictCard'
import {
  isPanelVerdict,
  isSingleVerdict,
} from '@/features/verdict/components/verdictUtils'
import { Card, CardContent } from '@/components/ui/card'

const VERDICT_META: Record<
  string,
  { label: string; emoji: string }
> = {
  YTA: { label: "You're The A-hole", emoji: '😬' },
  NTA: { label: 'Not The A-hole', emoji: '✅' },
  ESH: { label: 'Everyone Sucks Here', emoji: '🤦' },
  NAH: { label: 'No A-holes Here', emoji: '🤝' },
  INFO: { label: 'Need More Info', emoji: '❓' },
}

async function fetchVerdictMeta(shareId: string) {
  const convexUrl = process.env.VITE_CONVEX_URL
  if (!convexUrl) return null

  try {
    const convex = new ConvexHttpClient(convexUrl)
    const verdict = await convex.query(
      api.functions.verdicts.queries.getByShareId,
      { shareId }
    )
    if (!verdict) return null

    return {
      verdict: verdict.verdict,
      mode: verdict.mode,
      panelSplit: verdict.panelSplit ?? null,
      summary: verdict.summary,
    }
  } catch {
    return null
  }
}

export const Route = createFileRoute('/verdict/$shareId')({
  ssr: true,
  loader: async ({ params }) => {
    const meta = await fetchVerdictMeta(params.shareId)
    return { meta }
  },
  component: VerdictPage,
  head: ({ loaderData }) => {
    const meta = loaderData?.meta
    const verdictCode = meta?.verdict ?? null
    const info = verdictCode ? VERDICT_META[verdictCode] : null

    const isPanel = meta?.mode === 'panel'
    const splitText = isPanel && meta?.panelSplit ? ` (${meta.panelSplit})` : ''

    const title = info
      ? `${verdictCode} ${info.emoji} — ${info.label}`
      : 'AITA Verdict — The Panel Will See You Now'

    const description = info
      ? isPanel
        ? `The panel ruled${splitText}: ${info.label}. Read the full breakdown.`
        : `The judge ruled: ${info.label}. Read the full verdict.`
      : 'AI judges weigh in on your situation. Get your verdict now.'

    const ogImage = verdictCode
      ? `https://aita.jessewalberg.com/og/${verdictCode.toLowerCase()}.png`
      : 'https://aita.jessewalberg.com/og/default.png'

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:image', content: ogImage },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'AITA Verdict' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
      ],
    }
  },
})

function VerdictPage() {
  const { shareId } = Route.useParams()
  const verdict = useQuery(api.functions.verdicts.queries.getByShareId, {
    shareId,
  })

  if (verdict === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <Card className="w-full max-w-xl border-white/10 bg-white/5 text-white">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-white/70">Loading verdict...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!verdict) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <Card className="w-full max-w-xl border-white/10 bg-white/5 text-white">
          <CardContent className="p-6 text-center space-y-2">
            <h2 className="text-lg font-semibold">Verdict not found</h2>
            <p className="text-sm text-white/70">
              That share link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {isPanelVerdict(verdict) ? (
          <PanelDisplay verdict={verdict} />
        ) : isSingleVerdict(verdict) ? (
          <SingleVerdictCard verdict={verdict} />
        ) : (
          <Card className="w-full border-white/10 bg-white/5 text-white">
            <CardContent className="p-6 text-center space-y-2">
              <h2 className="text-lg font-semibold">Verdict unavailable</h2>
              <p className="text-sm text-white/70">
                This verdict is incomplete. Please generate a new verdict.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
