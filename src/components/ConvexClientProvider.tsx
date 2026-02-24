import { type ReactNode, useState } from 'react'
import { ConvexReactClient, ConvexProvider } from 'convex/react'
import type { User } from '@workos-inc/node'

// Get Convex URL from either Vite build-time env or runtime env (Cloudflare Workers)
function getConvexUrl(): string {
  // Try Vite's import.meta.env first (build-time)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONVEX_URL) {
    return import.meta.env.VITE_CONVEX_URL
  }

  const nodeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process

  // Try process.env (Cloudflare Workers runtime with nodejs_compat)
  if (nodeProcess?.env?.VITE_CONVEX_URL) {
    return nodeProcess.env.VITE_CONVEX_URL
  }
  throw new Error('VITE_CONVEX_URL is not set')
}

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
    return new ConvexReactClient(getConvexUrl())
  })

  // For now, use simple ConvexProvider without auth
  // The user info is passed down from the root loader
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
