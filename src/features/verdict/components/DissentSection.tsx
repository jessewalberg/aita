import { AlertTriangle } from 'lucide-react'

export function DissentSection({
  dissent,
  dissenterName,
}: {
  dissent: string
  dissenterName?: string
}) {
  if (!dissent) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-800 text-sm mb-1">
            Dissenting Opinion{dissenterName && ` — Judge ${dissenterName}`}
          </h4>
          <p className="text-sm text-amber-700">{dissent}</p>
        </div>
      </div>
    </div>
  )
}
