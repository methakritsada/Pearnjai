import { z } from 'zod'

const currencyEnum = z.enum([
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'AUD',
  'NZD',
  'CAD',
])

export const call1Schema = z
  .object({
    as_of: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    macro_summary: z
      .object({
        market_driver: z.string(),
        risk_environment: z.enum(['risk-on', 'risk-off', 'mixed', 'event-driven']),
        key_uncertainties: z.array(z.string()),
      })
      .strict(),
    currency_bias: z.array(
      z
        .object({
          currency: currencyEnum,
          bias: z.enum(['bullish', 'bearish', 'neutral']),
          confidence: z.number().min(0).max(100),
          drivers: z.array(z.string()).length(3),
          conflicts: z.array(z.string()),
        })
        .strict(),
    ),
    high_impact_events: z.array(
      z
        .object({
          currency: currencyEnum,
          event: z.string(),
          time_local: z.string().regex(/^\d{2}:\d{2}$/),
          risk_note: z.string(),
        })
        .strict(),
    ),
    sources: z.array(
      z
        .object({
          title: z.string(),
          publisher: z.string(),
          published_time: z.string(),
          url: z.string().url(),
        })
        .strict(),
    ),
  })
  .strict()

const rsiSmcChecklist = z
  .array(
    z
      .object({
      rule: z.enum([
        'RSI reaches 75 or 25',
        'SMC structure (BOS/CHoCH)',
        'Liquidity sweep / zone reaction',
      ]),
      status: z.enum(['pass', 'fail', 'unknown']),
      })
      .strict(),
  )
  .length(3)

export const call2Schema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    daily_rules: z
      .object({
        risk_mode: z.enum([
          'normal',
          'reduced',
          'post-news only',
          'no-trade',
        ]),
        rules: z.array(z.string()),
      })
      .strict(),
    top_5_pairs: z
      .array(
        z
          .object({
            pair: z.string(),
            bias: z.enum(['bullish', 'bearish', 'neutral']),
            score: z.number().min(0).max(100),
            market_regime: z.enum([
              'trend',
              'range',
              'news-driven',
              'untradable',
            ]),
            selection_reasons: z.array(z.string()).length(3),
            scenarios: z
              .object({
                A: z
                  .object({
                    type: z.literal('Continuation'),
                    trigger_conditions: z.array(z.string()),
                    invalidation: z.string(),
                    targets: z.array(z.string()).length(2),
                    risk_note: z.string(),
                  })
                  .strict(),
                B: z
                  .object({
                    type: z.literal('Reversal'),
                    trigger_conditions: z.array(z.string()),
                    invalidation: z.string(),
                    targets: z.array(z.string()).length(2),
                    risk_note: z.string(),
                  })
                  .strict(),
              })
              .strict(),
            rsi_smc_checklist: rsiSmcChecklist,
            no_trade_if: z.array(z.string()),
          })
          .strict(),
      )
      .length(5),
    watchlist: z
      .array(
        z
          .object({
            pair: z.string(),
            score: z.number().min(0).max(100),
            note: z.string(),
          })
          .strict(),
      )
      .max(10),
    avoid: z
      .array(
        z
          .object({
            pair: z.string(),
            reason: z.string(),
          })
          .strict(),
      )
      .max(10),
  })
  .strict()

export type Call1Response = z.infer<typeof call1Schema>
export type Call2Response = z.infer<typeof call2Schema>
