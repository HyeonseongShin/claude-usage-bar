export const formatUsd = (usd: number): string => `$${usd.toFixed(usd < 1 ? 3 : 2)}`

export const formatTotalUsd = (usd: number): string => `$${usd.toFixed(1)}`

export const formatTokens = (n: number): string =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : `${n}`

export type Context = { tokens?: number; window: number; percent?: number }

const BAR_CELLS = 10

export const formatContext = ({ tokens, window, percent }: Context): string => {
  const pct = percent ?? 0
  const filled = Math.min(BAR_CELLS, Math.max(pct > 0 ? 1 : 0, Math.round((pct / 100) * BAR_CELLS)))
  const bar = '█'.repeat(filled) + '░'.repeat(BAR_CELLS - filled)

  return `Context [${bar}] ${pct}% ${formatTokens(tokens ?? 0)}/${formatTokens(window)}`
}

// 'claude-sonnet-5-5[1m]' -> 'Sonnet 5.5'; anything unrecognised is shown as-is. (M) marks a 1M window.
export const formatModel = (id: string, window = 0): string => {
  const m = /^claude-([a-z]+)((?:-\d{1,2})+)(?:-\d{8})?(?:\[.*\])?$/.exec(id)
  const name = m ? `${m[1]!.charAt(0).toUpperCase()}${m[1]!.slice(1)} ${m[2]!.slice(1).replaceAll('-', '.')}` : id

  return window >= 1e6 ? `${name}(M)` : name
}

export const formatDuration = (ms: number): string => {
  const m = Math.max(0, Math.floor(ms / 60_000))
  const d = Math.floor(m / 1440)
  const h = Math.floor((m % 1440) / 60)

  return d > 0 ? `${d}d${h}h` : `${h}h${String(m % 60).padStart(2, '0')}m`
}

export type RateLimit = { kind: string; percentUsed: number; resetsAt?: string }

const WINDOWS: [string, string][] = [['five_hour', '5h'], ['seven_day', '7d']]

// Only the 5h and 7d windows; empty string when the account reports neither.
export const formatLimits = (limits: RateLimit[], now: number, deltas: Record<string, number> = {}): string =>
  WINDOWS.flatMap(([kind, label]) => {
    const l = limits.find(x => x.kind === kind)
    if (!l) return []
    const reset = l.resetsAt ? ` (${formatDuration(Date.parse(l.resetsAt) - now)})` : ''

    const d = deltas[l.kind]
    const up = d ? ` (+${Number(d.toFixed(1))}%)` : ''

    return [`${label}: ${Math.round(l.percentUsed)}%${up}${reset}`]
  }).join(' │ ')
