import { expect, test } from 'claude-code/testing'

import { formatRemaining, resolveTtl } from './cache'

test('resolveTtl follows Claude Code precedence', () => {
  expect(resolveTtl({})).toBe('5m')
  expect(resolveTtl({ enable1h: '1' })).toBe('1h')
  expect(resolveTtl({ settingTtl: '1h', enable1h: '1' })).toBe('1h')
  expect(resolveTtl({ settingTtl: '1h', envTtl: '5m' })).toBe('5m')
  expect(resolveTtl({ settingTtl: 'bogus' })).toBe('5m')
  expect(resolveTtl({ force5m: '1', envTtl: '1h' })).toBe('5m')
})

test('formatRemaining counts down and expires', () => {
  expect(formatRemaining(252_000)).toBe('4:12')
  expect(formatRemaining(3_599_100)).toBe('60:00')
  expect(formatRemaining(0)).toBe('expired')
})
