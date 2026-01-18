import type { User } from '@workos-inc/node'

interface SignInButtonProps {
  large?: boolean
  user?: User | null
  signInUrl?: string
}

export default function SignInButton({
  large,
  user,
  signInUrl,
}: SignInButtonProps) {
  const buttonClasses = `${
    large ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
  } bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-white/80">
          {user.profilePictureUrl && (
            <img
              src={user.profilePictureUrl}
              alt={`${user.firstName || 'User'}`}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span>{user.firstName || user.email}</span>
        </div>
        <a
          href="/api/auth/logout"
          className="px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          Sign Out
        </a>
      </div>
    )
  }

  if (!signInUrl) {
    return (
      <button className={buttonClasses} disabled>
        Loading...
      </button>
    )
  }

  return (
    <a href={signInUrl} className={buttonClasses}>
      Sign In
    </a>
  )
}
