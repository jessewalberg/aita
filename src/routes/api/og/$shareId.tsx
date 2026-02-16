import { createFileRoute } from '@tanstack/react-router'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../convex/_generated/api'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
// @ts-expect-error -- wasm import
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'

let wasmInitialized = false

async function ensureWasm() {
  if (!wasmInitialized) {
    await initWasm(resvgWasm)
    wasmInitialized = true
  }
}

const VERDICT_COLORS: Record<
  string,
  { bg: string; text: string; accent: string }
> = {
  YTA: { bg: '#7f1d1d', text: '#fecaca', accent: '#ef4444' },
  NTA: { bg: '#064e3b', text: '#a7f3d0', accent: '#10b981' },
  ESH: { bg: '#78350f', text: '#fde68a', accent: '#f59e0b' },
  NAH: { bg: '#1e3a5f', text: '#bfdbfe', accent: '#3b82f6' },
  INFO: { bg: '#27272a', text: '#d4d4d8', accent: '#a1a1aa' },
}

const VERDICT_LABELS: Record<string, string> = {
  YTA: "You're The A-hole",
  NTA: 'Not The A-hole',
  ESH: 'Everyone Sucks Here',
  NAH: 'No A-holes Here',
  INFO: 'Need More Info',
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 1) + '...'
}

function generateOgSvg(verdict: {
  verdict: string
  mode: string
  panelSplit?: string
  situation: string
}) {
  const code = verdict.verdict
  const colors = VERDICT_COLORS[code] ?? VERDICT_COLORS.INFO
  const label = VERDICT_LABELS[code] ?? code
  const isPanel = verdict.mode === 'panel'
  const modeText = isPanel ? 'Panel Verdict' : 'Single Judge'
  const splitText =
    isPanel && verdict.panelSplit ? `${verdict.panelSplit} decision` : ''
  const situationPreview = escapeXml(truncate(verdict.situation, 90))

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#0b1120" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Verdict accent bar -->
  <rect x="0" y="0" width="1200" height="8" fill="${colors.accent}" />

  <!-- Verdict code badge -->
  <rect x="80" y="80" width="220" height="100" rx="16" fill="${colors.bg}" />
  <text x="190" y="148" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="800" fill="${colors.accent}" text-anchor="middle">${escapeXml(code)}</text>

  <!-- Verdict label -->
  <text x="80" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="700" fill="#ffffff">${escapeXml(label)}</text>

  <!-- Mode + split -->
  <text x="80" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#94a3b8">${escapeXml(modeText)}${splitText ? ` · ${escapeXml(splitText)}` : ''}</text>

  <!-- Divider -->
  <rect x="80" y="320" width="1040" height="1" fill="#334155" />

  <!-- Situation preview -->
  <text x="80" y="370" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#64748b">"${situationPreview}"</text>

  <!-- Branding -->
  <text x="80" y="560" font-family="Georgia, serif" font-size="36" font-weight="600" fill="#ffffff">AITA Verdict</text>
  <text x="80" y="595" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#475569">3 AI judges. 1 ruling. Your verdict awaits.</text>

  <!-- Bottom accent bar -->
  <rect x="0" y="622" width="1200" height="8" fill="${colors.accent}" />
</svg>`
}

function generateDefaultSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0f172a" />
  <text x="600" y="280" font-family="Georgia, serif" font-size="64" font-weight="600" fill="#ffffff" text-anchor="middle">AITA Verdict</text>
  <text x="600" y="350" font-family="system-ui, sans-serif" font-size="32" fill="#94a3b8" text-anchor="middle">3 AI judges. 1 ruling. Your verdict awaits.</text>
</svg>`
}

async function svgToPng(svg: string): Promise<Uint8Array> {
  await ensureWasm()
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
  const rendered = resvg.render()
  const png = rendered.asPng()
  return png
}

export const Route = createFileRoute('/api/og/$shareId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const convexUrl = process.env.VITE_CONVEX_URL
          if (!convexUrl) {
            return new Response('Server error', { status: 500 })
          }

          const convex = new ConvexHttpClient(convexUrl)
          const verdict = await convex.query(
            api.functions.verdicts.queries.getByShareId,
            { shareId: params.shareId },
          )

          let svg: string
          let cacheMaxAge: number

          if (!verdict) {
            svg = generateDefaultSvg()
            cacheMaxAge = 60
          } else {
            svg = generateOgSvg({
              verdict: verdict.verdict,
              mode: verdict.mode,
              panelSplit: verdict.panelSplit,
              situation: verdict.situation,
            })
            cacheMaxAge = 3600
          }

          const png = await svgToPng(svg)

          return new Response(png.buffer as ArrayBuffer, {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': `public, max-age=${cacheMaxAge}`,
            },
          })
        } catch {
          return new Response('Error generating image', { status: 500 })
        }
      },
    },
  },
})
