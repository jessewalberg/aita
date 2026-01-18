import { Link } from '@tanstack/react-router'
import { Scale } from 'lucide-react'
import SignInButton from './workos-user'
import type { User } from '@workos-inc/node'

interface HeaderProps {
  user?: User | null
  signInUrl?: string
}

export default function Header({ user, signInUrl }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <Scale className="h-6 w-6 text-emerald-400" />
            <span className="font-serif text-xl font-semibold">AITA Verdict</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/stats"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Stats
            </Link>
            <SignInButton user={user} signInUrl={signInUrl} />
          </div>
        </div>
      </div>
    </header>
  )
}
