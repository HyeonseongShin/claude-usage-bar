import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { TTL_MS, explicitTtl, formatRemaining, resolveTtl } from './cache'
import { formatContext, formatLimits, formatModel, formatTotalUsd, formatUsd } from './format'

const usd = atom({ plugin: 'cost-bar', key: 'usd' } as const, null)
const context = atom({ plugin: 'cost-bar', key: 'context' } as const, null)
const limits = atom({ plugin: 'cost-bar', key: 'limits' } as const, [])
const delta = atom({ plugin: 'cost-bar', key: 'delta' } as const, null)
const limitDelta = atom({ plugin: 'cost-bar', key: 'limitDelta' } as const, {})
const turns = atom({ plugin: 'cost-bar', key: 'turns' } as const, 0)
const ttl = atom({ plugin: 'cost-bar', key: 'ttl' } as const, null)
const lastRequestAt = atom({ plugin: 'cost-bar', key: 'lastRequestAt' } as const, null)

export const register: Register = on => {
  // Seed from the ledger so a resumed session shows its totals before the first turn ends.
  on('session.start', async ($, e, next) => {
    // ponytail: redraw once a second forever; stop it when idle if the repaint cost shows up.
    // Started first so a failing settings/env read below cannot leave the countdown frozen.
    $.clock.every(1000, () => $.ui.invalidate('ui.render'))

    const settings = await $.settings.read()
    const resolved = explicitTtl({
      force5m: await $.env.get('FORCE_PROMPT_CACHING_5M'),
      envTtl: await $.env.get('CLAUDE_CODE_PROMPT_CACHE_TTL'),
      settingTtl: settings.promptCacheTtl,
      enable1h: await $.env.get('ENABLE_PROMPT_CACHING_1H'),
    })
    await update($, ttl, () => resolved)

    const u = await $.session.usage()
    if (u.cost) await update($, usd, () => u.cost!.usd)
    await update($, context, () => u.context)
    await update($, limits, () => u.rateLimits)
    const n = await $.session.turns()
    await update($, turns, () => n)

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.cost) {
      // Only a rise counts; a ledger reset or an unchanged total keeps the last increase on screen.
      const prev = await read($, usd)
      if (prev !== null && e.cost.usd > prev) await update($, delta, () => e.cost!.usd - prev)
      await update($, usd, () => e.cost!.usd)
    }
    await update($, context, () => e.context)
    // Same rule as cost: only a rise counts, a window reset keeps the last increase on screen.
    const before = await read($, limits)
    for (const l of e.rateLimits) {
      const p = before.find(x => x.kind === l.kind)
      if (p && l.percentUsed > p.percentUsed) await update($, limitDelta, d => ({ ...d, [l.kind]: l.percentUsed - p.percentUsed }))
    }
    await update($, limits, () => e.rateLimits)
    const n = await $.session.turns()
    await update($, turns, () => n)

    return next(e)
  })

  // The TTL runs from when a request starts: the prompt, and each request that follows a tool result.
  on('prompt.submit', async ($, e, next) => {
    const now = await $.clock.now()
    await update($, lastRequestAt, () => now)

    return next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    const now = await $.clock.now()
    await update($, lastRequestAt, () => now)

    return result
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const cost = await read($, usd)
    const ctx = await read($, context)
    const turn = await read($, turns)
    const id = await $.session.model()
    const last = await read($, delta)
    const lim = formatLimits(await read($, limits), await $.clock.now(), await read($, limitDelta))
    const at = await read($, lastRequestAt)
    // Rate limits arrive with the first response, so the default is decided at render time.
    const lims = await read($, limits)
    // ponytail: >=100% is assumed to mean extra-usage credits (5m); unverified, fix if it misleads.
    const subscription = lims.length > 0 && lims.every(l => l.percentUsed < 100)
    const kind = resolveTtl({ envTtl: await read($, ttl) ?? undefined }, subscription)
    const left = at === null ? null : at + TTL_MS[kind] - (await $.clock.now())
    const below = await next(e)
    if (cost === null || e.props.hasSurvey) return below

    const { Box, Text } = $.ui.resolve(e)

    // Stack on top of whatever other plugins drew beneath us instead of replacing it.
    return (
      <Box flexDirection="column">
        {below}
        <Text dimColor>
          {id ? `${formatModel(id)} | ` : ''}{formatTotalUsd(cost)}{last ? ` (+${formatUsd(last)})` : ''}
          {ctx ? ` | ${formatContext(ctx)}` : ''}{lim ? ` | ${lim}` : ''} | Turn {turn}
          {left === null ? '' : ` | Cache(${kind}) ${formatRemaining(left)}`}
        </Text>
      </Box>
    )
  })
}
