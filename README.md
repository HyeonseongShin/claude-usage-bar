# claude-usage-bar-for-subscription

`cost-bar` is a Claude Code mod for subscription users. It draws one bar above the prompt with the model, session cost, context fill, 5h/7d usage, turn count and a prompt-cache countdown.

```
Sonnet 5.5(M) | $0.146 (+$0.012) | Context [█░░░░░░░░░] 5% 53k/1.0M | 5h: 14% (+2%) (4h40m) │ 7d: 9% (+1%) (4d22h) | Turn 2 | Cache(5m) 1:22
```

| Field | Source |
| - | - |
| Model | The live model, with `(M)` for a 1M window |
| Cost | The total `/cost` shows, with the last increase in parentheses |
| Context | A 10-cell bar (at least one cell once usage is above 0%), the engine's percentage, then tokens in the window over the window size |
| 5h / 7d | Rate-limit usage, the last increase and time until reset; left out when the account reports none |
| Turn | Prompts you have sent this session |
| Cache | Countdown from the TTL below; `expired` at zero |

## Install

```
/plugin install cost-bar --marketplace HyeonseongShin/claude-usage-bar-for-subscription
```

Try it without installing: `claude --plugin-dir /path/to/this/repo`

## Cache countdown

The TTL comes from `FORCE_PROMPT_CACHING_5M`, `CLAUDE_CODE_PROMPT_CACHE_TTL`, the `promptCacheTtl` setting or `ENABLE_PROMPT_CACHING_1H`. With none of them set it is 1 hour when the account reports 5h/7d limits (a subscription) and 5 minutes otherwise.

The 1 hour default is based on one measurement: a subscription session still read its cache after an 8 minute pause. The drop to 5 minutes once the plan limit is exceeded is not detected.

## Layout

`hooks/register.tsx` holds the hooks, `hooks/format.ts` and `hooks/cache.ts` the pure formatting and TTL logic (tested by `hooks/*.test.ts`). Run `claude plugin validate .` and `claude plugin test .` after changes.
