import { expect, test } from 'claude-code/testing'

import { formatContext, formatLimits, formatModel, formatUsd } from './format'

test('formatUsd: three decimals under $1, two above', () => {
  expect(formatUsd(0.0421)).toBe('$0.042')
  expect(formatUsd(12.345)).toBe('$12.35')
})

test('formatContext: bar, percent and k/M units', () => {
  expect(formatContext({ tokens: 82_000, window: 1_000_000, percent: 8 })).toBe('Context [█░░░░░░░░░] 8% 82k/1.0M')
  expect(formatContext({ tokens: 500_000, window: 1_000_000, percent: 50 })).toBe('Context [█████░░░░░] 50% 500k/1.0M')
  expect(formatContext({ window: 200_000 })).toBe('Context [░░░░░░░░░░] 0% 0/200k')
})

test('formatLimits: 5h and 7d with time to reset', () => {
  const now = Date.parse('2026-01-01T00:00:00Z')
  const at = (ms: number) => new Date(now + ms).toISOString()
  const limits = [
    { kind: 'five_hour', percentUsed: 14.2, resetsAt: at(4 * 3600e3 + 40 * 60e3) },
    { kind: 'seven_day', percentUsed: 9, resetsAt: at((4 * 24 + 22) * 3600e3) },
  ]
  expect(formatLimits(limits, now)).toBe('5h: 14% (4h40m) │ 7d: 9% (4d22h)')
  expect(formatLimits(limits, now, { five_hour: 2.04 })).toBe('5h: 14% (+2%) (4h40m) │ 7d: 9% (4d22h)')
  expect(formatLimits([], now)).toBe('')
})

test('formatModel: id to name, (M) suffix for 1M windows', () => {
  expect(formatModel('claude-sonnet-5-5[1m]', 1_000_000)).toBe('Sonnet 5.5(M)')
  expect(formatModel('claude-sonnet-5-5', 200_000)).toBe('Sonnet 5.5')
  expect(formatModel('custom-model')).toBe('custom-model')
})
