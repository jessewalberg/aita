"use client"

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, User, Lock } from 'lucide-react'

interface ModeSelectorProps {
  mode: 'single' | 'panel'
  onModeChange: (mode: 'single' | 'panel') => void
  isPro: boolean
}

export function ModeSelector({ mode, onModeChange, isPro }: ModeSelectorProps) {
  const handleChange = (value: string) => {
    if (value === 'single' || value === 'panel') {
      onModeChange(value)
    }
  }

  return (
    <Tabs value={mode} onValueChange={handleChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="single" className="gap-2">
          <User className="h-4 w-4" />
          Quick Verdict
        </TabsTrigger>
        <TabsTrigger value="panel" disabled={!isPro} className="gap-2">
          <Users className="h-4 w-4" />
          Panel Mode
          {!isPro && <Lock className="h-3 w-3 ml-1" />}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
