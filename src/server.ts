import * as Sentry from '@sentry/cloudflare'
import handler from '@tanstack/react-start/server-entry'

interface Env {
  SENTRY_DSN?: string
  CF_PAGES?: string
}

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    enabled: !!env.SENTRY_DSN,
  }),
  handler,
)
