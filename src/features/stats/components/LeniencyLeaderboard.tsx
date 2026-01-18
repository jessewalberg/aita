import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { JudgeAvatar } from '@/features/verdict/components/JudgeAvatar'

interface ModelStat {
  modelId: string
  modelName: string
  leniencyScore: number
  totalVerdicts: number
  ntaCount: number
  ytaCount: number
}

export function LeniencyLeaderboard({ stats }: { stats: ModelStat[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leniency Leaderboard</CardTitle>
        <CardDescription>Who is most likely to side with you?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, i) => {
          const ntaRate =
            stat.totalVerdicts > 0
              ? Math.round((stat.ntaCount / stat.totalVerdicts) * 100)
              : 0

          return (
            <div key={stat.modelId} className="flex items-center gap-4">
              <span className="text-lg font-bold text-muted-foreground w-6">
                {i + 1}.
              </span>
              <JudgeAvatar name={stat.modelName} size="sm" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{stat.modelName}</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {ntaRate}% NTA
                  </span>
                </div>
                <Progress value={ntaRate} className="h-2" />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
