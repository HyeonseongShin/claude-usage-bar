# claude-usage-bar

`cost-bar` is a Claude Code mod for subscription users. It draws one bar above the prompt with the model, session cost, context fill, 5h/7d plan usage, turn count and a prompt-cache countdown. It stacks under other mods that draw above the prompt instead of replacing them.

```
Sonnet 5.5(M) | $0.146 (+$0.012) | Context [█░░░░░░░░░] 5% 53k/1.0M | 5h: 14% (+2%) (4h40m) │ 7d: 9% (+1%) (4d22h) | Turn 2 | Cache(1h) 58:20
```

| Field | Source |
| - | - |
| Model | The live model, with `(M)` for a 1M window |
| Cost | The total `/cost` shows, then the last increase in parentheses |
| Context | A 10-cell bar (at least one cell once usage is above 0%), the engine's percentage, then tokens in the window over the window size |
| 5h / 7d | Plan usage, its last increase, and time until the window resets. Left out when the account reports no limits (API keys) |
| Turn | Prompts you have sent this session |
| Cache | Time left before the prompt cache expires, counted down every second; `expired` at zero |

The last increase of cost and plan usage only updates when the value rises, so a reset keeps the previous increase on screen. Plan usage is only reported when it moves a whole point, so small increases are folded into the next one.

## Install

```
/plugin install cost-bar --marketplace HyeonseongShin/claude-usage-bar
```

Try it without installing: `claude --plugin-dir /path/to/this/repo`

## Cache countdown

The TTL comes from `FORCE_PROMPT_CACHING_5M`, `CLAUDE_CODE_PROMPT_CACHE_TTL`, the `promptCacheTtl` setting or `ENABLE_PROMPT_CACHING_1H`, in that order. With none set it is 1 hour when the account reports 5h/7d limits (a subscription) and 5 minutes otherwise. Restart the session after changing any of them.

The timer restarts at your prompt and after each tool call finishes.

Unverified:
- The 1 hour default rests on one measurement: a subscription session still read its cache after an 8 minute pause.
- When a limit window reaches 100% the bar assumes the plan is exceeded and shows 5 minutes.

## Layout

`hooks/register.tsx` holds the hooks. `hooks/format.ts` and `hooks/cache.ts` hold the pure formatting and TTL logic, tested by `hooks/*.test.ts`. Run `claude plugin validate .` and `claude plugin test .` after changes.
