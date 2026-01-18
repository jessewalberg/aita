import { type ReactNode, useState } from 'react'
import { ConvexReactClient, ConvexProvider } from 'convex/react'
import type { User } from '@workos-inc/node'

interface ConvexClientProviderProps {
  children: ReactNode
  user?: User | null
}

export function ConvexClientProvider({
  children,
  user: _user,
}: ConvexClientProviderProps) {
  // Note: user prop is available for future authenticated Convex integration
  void _user

  const [convex] = useState(() => {
    return new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!)
  })

  // For now, use simple ConvexProvider without auth
  // The user info is passed down from the root loader
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
