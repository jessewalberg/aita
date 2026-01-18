"use client"

import { useQuery } from 'convex/react'
import { Link } from '@tanstack/react-router'
import { api } from '../../../../convex/_generated/api'
import { formatDistanceToNow } from 'date-fns'

const VERDICT_COLORS: Record<string, string> = {
  YTA: 'bg-red-500/20 text-red-400 border-red-500/30',
  NTA: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ESH: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  NAH: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  INFO: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

export function RecentVerdicts() {
  const recentVerdicts = useQuery(api.functions.verdicts.queries.getRecentPublic, {
    limit: 5,
  })

  if (!recentVerdicts || recentVerdicts.length === 0) {
    return null
  }

  return (
    <section className="mt-16">
      <h2 className="text-xl font-semibold text-white mb-6">Recent Verdicts</h2>
      <div className="space-y-3">
        {recentVerdicts.map((verdict) => (
          <Link
            key={verdict._id}
            to="/verdict/$shareId"
            params={{ shareId: verdict.shareId }}
            className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 line-clamp-2">
                  {verdict.situation.slice(0, 150)}
                  {verdict.situation.length > 150 && '...'}
                </p>
                <p className="text-xs text-white/50 mt-2">
                  {formatDistanceToNow(verdict.createdAt, { addSuffix: true })}
                  {verdict.panelSplit && ` • Panel: ${verdict.panelSplit}`}
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full border ${VERDICT_COLORS[verdict.verdict] || VERDICT_COLORS.INFO}`}
              >
                {verdict.verdict}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
