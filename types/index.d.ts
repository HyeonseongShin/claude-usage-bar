declare module 'claude-code' {
  interface PluginState {
    'cost-bar': {
      usd: number | null
      context: { tokens?: number; window: number; percent?: number } | null
      limits: { kind: string; percentUsed: number; resetsAt?: string }[]
      delta: number | null
      limitDelta: Record<string, number>
      turns: number
      ttl: '5m' | '1h' | null
      lastRequestAt: number | null
    }
  }
}
