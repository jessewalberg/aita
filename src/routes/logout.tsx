import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/logout')({
  component: LogoutPage,
})

function LogoutPage() {
  useEffect(() => {
    // Delegate cookie/session clearing to server-side logout handler.
    window.location.href = '/api/auth/logout'
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <p className="text-white/70">Signing out...</p>
    </div>
  )
}
