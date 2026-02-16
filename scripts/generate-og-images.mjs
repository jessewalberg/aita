import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'fs'

const VERDICT_COLORS = {
  YTA: { bg: '#7f1d1d', accent: '#ef4444' },
  NTA: { bg: '#064e3b', accent: '#10b981' },
  ESH: { bg: '#78350f', accent: '#f59e0b' },
  NAH: { bg: '#1e3a5f', accent: '#3b82f6' },
  INFO: { bg: '#27272a', accent: '#a1a1aa' },
}

const VERDICT_LABELS = {
  YTA: "You're The A-hole",
  NTA: 'Not The A-hole',
  ESH: 'Everyone Sucks Here',
  NAH: 'No A-holes Here',
  INFO: 'Need More Info',
}

function generateVerdictSvg(code) {
  const colors = VERDICT_COLORS[code]
  const label = VERDICT_LABELS[code]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#0b1120" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="0" y="0" width="1200" height="8" fill="${colors.accent}" />

  <rect x="80" y="120" width="280" height="130" rx="20" fill="${colors.bg}" />
  <text x="220" y="208" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="${colors.accent}" text-anchor="middle">${code}</text>

  <text x="80" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" fill="#ffffff">${label}</text>

  <rect x="80" y="370" width="1040" height="1" fill="#334155" />

  <text x="80" y="520" font-family="Georgia, serif" font-size="44" font-weight="600" fill="#ffffff">AITA Verdict</text>
  <text x="80" y="565" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#475569">4 AI judges. 1 ruling. Your verdict awaits.</text>

  <rect x="0" y="622" width="1200" height="8" fill="${colors.accent}" />
</svg>`
}

function generateDefaultSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#0b1120" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="0" y="0" width="1200" height="8" fill="#8b5cf6" />

  <text x="600" y="260" font-family="Georgia, serif" font-size="72" font-weight="600" fill="#ffffff" text-anchor="middle">AITA Verdict</text>
  <text x="600" y="330" font-family="system-ui, sans-serif" font-size="36" fill="#94a3b8" text-anchor="middle">4 AI judges. 1 ruling. Your verdict awaits.</text>

  <rect x="0" y="622" width="1200" height="8" fill="#8b5cf6" />
</svg>`
}

function svgToPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
  const rendered = resvg.render()
  return rendered.asPng()
}

// Generate verdict-specific images
for (const code of Object.keys(VERDICT_COLORS)) {
  const svg = generateVerdictSvg(code)
  const png = svgToPng(svg)
  const path = `public/og/${code.toLowerCase()}.png`
  writeFileSync(path, png)
  console.log(`Generated ${path}`)
}

// Generate default image
const defaultSvg = generateDefaultSvg()
const defaultPng = svgToPng(defaultSvg)
writeFileSync('public/og/default.png', defaultPng)
console.log('Generated public/og/default.png')

console.log('Done!')
