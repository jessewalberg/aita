"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LinkIcon, Check } from 'lucide-react'

interface ShareActionsProps {
  shareId: string
  verdict: string
}

export function ShareActions({ shareId, verdict }: ShareActionsProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verdict/${shareId}`
      : ''

  async function handleCopy() {
    try {
      const text = shareUrl || shareId
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Share this verdict
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy link
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">ID: {shareId}</span>
      </div>
      <p className="text-xs text-muted-foreground">Verdict: {verdict}</p>
    </div>
  )
}
