import { useEffect, useState } from 'react'

const STORAGE_KEY = 'aita_visitor_id'

function generateId() {
  return `v_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

export function useVisitorId() {
  const [visitorId, setVisitorId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing) {
      setVisitorId(existing)
      return
    }
    const next = generateId()
    window.localStorage.setItem(STORAGE_KEY, next)
    setVisitorId(next)
  }, [])

  return visitorId
}
