# claude-usage-bar-for-subscription

`cost-bar` is a Claude Code mod for subscription users. It draws one bar above the prompt with the session cost, context fill, turn count and a prompt-cache countdown.

```
Session cost: $0.097 | Context [█░░░░░░░░░] 8% 82k/1.0M | Turn 12 | Cache(5m) 4:12
```

| Field | Source |
| - | - |
| Session cost | The total `/cost` shows, updated after each turn |
| Context | A 10-cell bar (at least one cell once usage is above 0%), the engine's percentage, then tokens in the window over the window size |
| Turn | Prompts you have sent this session |
| Cache | Time left before the prompt cache expires, counted down every second; `expired` at zero |

## Install

```
/plugin install cost-bar --marketplace HyeonseongShin/claude-usage-bar-for-subscription
```

Answer `y` to add the marketplace, then pick a scope. Needs Claude Code 2.1.287+.

Try it without installing: `claude --plugin-dir /path/to/this/repo`

## Cache countdown

The TTL is chosen once at session start, in Claude Code's own order: `FORCE_PROMPT_CACHING_5M=1`, then `CLAUDE_CODE_PROMPT_CACHE_TTL`, then the `promptCacheTtl` setting, then `ENABLE_PROMPT_CACHING_1H=1`, then the 5 minute default. Restart the session after changing any of them.

The timer starts when a request starts, as the API counts it: at your prompt, and again right after each tool call finishes. Tool-heavy turns refresh the cache mid-turn, so the real expiry can be later than shown.

Not covered: Claude subscriptions. Their 1 hour default, and the drop to 5 minutes once a plan's limit is exceeded, are not detected.

## Layout

`hooks/register.tsx` holds the hooks, `hooks/format.ts` and `hooks/cache.ts` the pure formatting and TTL logic (tested by `hooks/*.test.ts`). Run `claude plugin validate .` and `claude plugin test .` after changes.
