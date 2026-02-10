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
  { key: 'NTA', bg: 'bg-emerald-500', text: 'text-emerald-400' },
  { key: 'NAH', bg: 'bg-blue-500', text: 'text-blue-400' },
  { key: 'ESH', bg: 'bg-amber-500', text: 'text-amber-400' },
  { key: 'YTA', bg: 'bg-red-500', text: 'text-red-400' },
  { key: 'INFO', bg: 'bg-zinc-400', text: 'text-zinc-400' },
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
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>
                    Highlights from {totalVerdicts} total verdicts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mostLenient && (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <JudgeAvatar name={mostLenient.modelName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                          Most Lenient
                        </p>
                        <p className="font-semibold">{mostLenient.modelName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-400">
                          {mostLenient.totalVerdicts > 0
                            ? Math.round(
                                ((mostLenient.ntaCount + mostLenient.nahCount) /
                                  mostLenient.totalVerdicts) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                        <p className="text-[10px] text-white/50">sided with you</p>
                      </div>
                    </div>
                  )}
                  {strictest && (
                    <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                      <JudgeAvatar name={strictest.modelName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-red-400">
                          Strictest
                        </p>
                        <p className="font-semibold">{strictest.modelName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-400">
                          {strictest.totalVerdicts > 0
                            ? Math.round(
                                (strictest.ytaCount / strictest.totalVerdicts) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                        <p className="text-[10px] text-white/50">called YTA</p>
                      </div>
                    </div>
                  )}
                  {mostActive && (
                    <div className="flex items-center gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                      <JudgeAvatar name={mostActive.modelName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
                          Most Active
                        </p>
                        <p className="font-semibold">{mostActive.modelName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-violet-400">
                          {mostActive.totalVerdicts}
                        </p>
                        <p className="text-[10px] text-white/50">verdicts given</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {typedStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verdict Distribution</CardTitle>
                <CardDescription>
                  Breakdown of how each judge rules, verdict by verdict.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
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
                            {stat.totalVerdicts} verdict
                            {stat.totalVerdicts !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {verdictOrder.map(({ key, bg, text }) => {
                          const value = counts[key]
                          const pct = Math.round((value / total) * 100)
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <span
                                className={`w-8 text-right text-xs font-semibold ${text}`}
                              >
                                {key}
                              </span>
                              <div className="flex-1 h-5 rounded bg-white/5 overflow-hidden">
                                {pct > 0 && (
                                  <div
                                    className={`${bg} h-full rounded transition-all`}
                                    style={{
                                      width: `${Math.max(pct, 2)}%`,
                                    }}
                                  />
                                )}
                              </div>
                              <span className="w-16 text-right text-xs tabular-nums text-white/70">
                                {pct}%{' '}
                                <span className="text-white/30">({value})</span>
                              </span>
                            </div>
                          )
                        })}
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
