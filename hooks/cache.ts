export type Ttl = '5m' | '1h'

export const TTL_MS: Record<Ttl, number> = { '5m': 5 * 60_000, '1h': 60 * 60_000 }

const asTtl = (v: unknown): Ttl | undefined => (v === '5m' || v === '1h' ? v : undefined)

type Sources = { force5m?: string; envTtl?: string; settingTtl?: unknown; enable1h?: string }

// Same precedence as Claude Code's main-conversation bucket; undefined when nothing sets it.
export const explicitTtl = (s: Sources): Ttl | undefined =>
  s.force5m === '1' ? '5m' : asTtl(s.envTtl) ?? asTtl(s.settingTtl) ?? (s.enable1h === '1' ? '1h' : undefined)

// Subscriptions (the account reports rate limits) cache for 1h within plan limits; API keys for 5m.
// ponytail: measured 1h-or-more on one subscription, not detected after the plan limit is exceeded.
export const resolveTtl = (s: Sources, subscription = false): Ttl =>
  explicitTtl(s) ?? (subscription ? '1h' : '5m')

export const formatRemaining = (ms: number): string => {
  if (ms <= 0) return 'expired'
  const s = Math.ceil(ms / 1000)
  const mm = Math.floor(s / 60)
  return `${mm}:${String(s % 60).padStart(2, '0')}`
}
