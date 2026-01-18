import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/logout')({
  component: LogoutPage,
})

function LogoutPage() {
  useEffect(() => {
    // Clear the session cookie client-side
    // The cookie name is 'wos-session' (from authkit config)
    const cookieName = 'wos-session'

    // Set cookie to expire immediately
    document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`

    // Redirect to home after a brief moment
    window.location.href = '/'
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <p className="text-white/70">Signing out...</p>
    </div>
  )
}
