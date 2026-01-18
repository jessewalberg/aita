import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { PanelDisplay } from '@/features/verdict/components/PanelDisplay'
import { SingleVerdictCard } from '@/features/verdict/components/SingleVerdictCard'
import {
  isPanelVerdict,
  isSingleVerdict,
} from '@/features/verdict/components/verdictUtils'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/verdict/$shareId')({
  ssr: false,
  component: VerdictPage,
  head: ({ params }) => ({
    meta: [
      {
        title: `AITA Verdict - ${params.shareId}`,
      },
      {
        name: 'description',
        content:
          'Read the panel ruling and see how each judge weighed the facts.',
      },
      {
        property: 'og:title',
        content: `AITA Verdict - ${params.shareId}`,
      },
      {
        property: 'og:description',
        content:
          'Read the panel ruling and see how each judge weighed the facts.',
      },
      {
        property: 'og:type',
        content: 'article',
      },
      {
        property: 'og:url',
        content: `/verdict/${params.shareId}`,
      },
      {
        property: 'og:image',
        content: `/og-default.svg?shareId=${params.shareId}`,
      },
    ],
  }),
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
