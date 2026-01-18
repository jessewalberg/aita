import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LeniencyLeaderboard } from '@/features/stats/components/LeniencyLeaderboard'
import { JudgeAvatar } from '@/features/verdict/components/JudgeAvatar'
import { VERDICT_CONFIG } from 'convex/lib/constants/verdicts'
import { ArrowLeft, BarChart3 } from 'lucide-react'

export const Route = createFileRoute('/stats')({
  ssr: false,
  component: StatsPage,
  head: () => ({
    meta: [
      {
        title: 'AITA Verdict Stats - Judge Analytics',
      },
      {
        name: 'description',
        content: 'See judge leniency, verdict distributions, and panel trends.',
      },
      {
        property: 'og:title',
        content: 'AITA Verdict Stats - Judge Analytics',
      },
      {
        property: 'og:description',
        content: 'See judge leniency, verdict distributions, and panel trends.',
      },
      {
        property: 'og:image',
        content: '/og-default.svg',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
  }),
})

type ModelStat = {
  modelId: string
  modelName: string
  totalVerdicts: number
  ytaCount: number
  ntaCount: number
  eshCount: number
  nahCount: number
  infoCount: number
  leniencyScore: number
}

const verdictOrder = [
  { key: 'NTA', color: 'bg-emerald-500' },
  { key: 'NAH', color: 'bg-blue-500' },
  { key: 'ESH', color: 'bg-amber-500' },
  { key: 'YTA', color: 'bg-red-500' },
  { key: 'INFO', color: 'bg-zinc-400' },
] as const

function StatsPage() {
  const stats = useQuery(api.functions.analytics.queries.getModelStats)

  if (stats === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <Card className="w-full max-w-xl border-white/10 bg-white/5 text-white">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-white/70">Loading judge analytics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const typedStats = stats as ModelStat[]
  const totalVerdicts = typedStats.reduce(
    (sum, stat) => sum + stat.totalVerdicts,
    0
  )
  const mostLenient = typedStats[0]
  const strictest = typedStats[typedStats.length - 1]
  const mostActive = typedStats.reduce(
    (top, stat) =>
      stat.totalVerdicts > (top?.totalVerdicts ?? 0) ? stat : top,
    typedStats[0]
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <main className="relative mx-auto max-w-6xl px-6 py-16 space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 font-mono">
                <BarChart3 className="h-3.5 w-3.5" />
                Judge Analytics
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight font-serif">
                Who is toughest? Who is kindest?
              </h1>
              <p className="mt-3 text-lg text-white/70 max-w-2xl">
                Track judge tendencies, verdict distributions, and the most
                generous decision-makers.
              </p>
            </div>
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to verdicts
            </Link>
          </div>

          {typedStats.length === 0 ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-10 text-center space-y-2">
                <h2 className="text-xl font-semibold">No data yet</h2>
                <p className="text-sm text-white/70">
                  Generate verdicts to see analytics populate here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <LeniencyLeaderboard stats={typedStats} />

              <Card>
                <CardHeader>
                  <CardTitle>Fun Facts</CardTitle>
                  <CardDescription>
                    Quick insights across {totalVerdicts} total verdicts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FactRow
                    label="Most lenient"
                    value={mostLenient?.modelName}
                    detail={mostLenient ? `${mostLenient.leniencyScore} score` : ''}
                  />
                  <FactRow
                    label="Strictest"
                    value={strictest?.modelName}
                    detail={strictest ? `${strictest.leniencyScore} score` : ''}
                  />
                  <FactRow
                    label="Most active"
                    value={mostActive?.modelName}
                    detail={
                      mostActive ? `${mostActive.totalVerdicts} verdicts` : ''
                    }
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {typedStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verdict Distribution</CardTitle>
                <CardDescription>
                  How each judge leans across verdict types.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {typedStats.map((stat) => {
                  const total = stat.totalVerdicts || 1
                  const counts: Record<string, number> = {
                    NTA: stat.ntaCount,
                    NAH: stat.nahCount,
                    ESH: stat.eshCount,
                    YTA: stat.ytaCount,
                    INFO: stat.infoCount,
                  }

                  return (
                    <div key={stat.modelId} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <JudgeAvatar name={stat.modelName} size="sm" />
                        <div>
                          <p className="font-medium">{stat.modelName}</p>
                          <p className="text-xs text-muted-foreground">
                            {stat.totalVerdicts} verdicts
                          </p>
                        </div>
                      </div>

                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
                        {verdictOrder.map(({ key, color }) => {
                          const value = counts[key]
                          const width = Math.round((value / total) * 100)
                          return (
                            <div
                              key={key}
                              className={color}
                              style={{ width: `${width}%` }}
                              title={`${key}: ${value}`}
                            />
                          )
                        })}
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-white/70">
                        {verdictOrder.map(({ key, color }) => (
                          <span key={key} className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${color}`} />
                            {VERDICT_CONFIG[key].label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

function FactRow({
  label,
  value,
  detail,
}: {
  label: string
  value?: string
  detail?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 p-3">
      <div>
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="text-base font-semibold">{value || '—'}</p>
      </div>
      <span className="text-xs text-white/60">{detail}</span>
    </div>
  )
}
