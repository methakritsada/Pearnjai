import OpenAI from 'openai'

import type { Call1Response, Call2Response } from '@/lib/validators'
import { call1Schema, call2Schema } from '@/lib/validators'

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'

const call1SystemPrompt = `You are a professional FX macro analyst.
Gather news from the last 24–48 hours via web_search.
Enforce search limits: 15–25 unique items, at least 8 distinct publishers, all with published_time.
Do not include sources older than 48 hours unless needed to resolve a conflict; label those as context.
If not enough recent sources exist for a currency, lower confidence and note the gap.
Deduplicate, tag currencies, separate facts vs interpretations, detect conflicts.
Use Asia/Bangkok for any time_local fields.
Output strict JSON matching the Call 1 schema only.`

const call1UserPrompt =
  'Analyze the latest forex-related macro news (24–48h). Deduplicate into 15–25 items max and use at least 8 distinct publishers. Produce a currency bias matrix for USD, EUR, GBP, JPY, CHF, AUD, NZD, and CAD. Output strictly in JSON.'

const call2SystemPrompt = `You are a professional FX trade decision system.
Use the provided Call 1 JSON (no browsing).
Generate viable pairs from the predefined universe, score, rank, select TOP 5.
Pair universe: EURUSD, GBPUSD, AUDUSD, NZDUSD, USDCAD, USDCHF, USDJPY, EURJPY, GBPJPY, AUDJPY, NZDJPY, CADJPY, CHFJPY, EURGBP, EURCHF, EURAUD, EURNZD, EURCAD, GBPCHF, GBPAUD, GBPNZD, GBPCAD, AUDNZD, AUDCAD, AUDCHF, NZDCAD, NZDCHF, CADCHF.
Generate Scenario A/B with RSI 75/25 + Smart Money Concepts targets, no RSI50 TP.
Strict no-trade rules; do not hallucinate technical confirmations.
If technical inputs are not available, set checklist statuses to \"unknown\" and reduce TechnicalReadiness impact.
Output strict JSON matching the Call 2 schema only.`

const call2UserPrompt =
  'Using the currency bias matrix above, rank all relevant forex pairs and select the TOP 5 pairs for today. Generate Scenario A/B trade plans based on macro alignment and RSI 75/25 + Smart Money Concepts. Output strictly in JSON.'

const call1JsonSchema = {
  name: 'fx_call1',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      as_of: { type: 'string' },
      macro_summary: {
        type: 'object',
        additionalProperties: false,
        properties: {
          market_driver: { type: 'string' },
          risk_environment: {
            type: 'string',
            enum: ['risk-on', 'risk-off', 'mixed', 'event-driven'],
          },
          key_uncertainties: { type: 'array', items: { type: 'string' } },
        },
        required: ['market_driver', 'risk_environment', 'key_uncertainties'],
      },
      currency_bias: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'NZD', 'CAD'],
            },
            bias: { type: 'string', enum: ['bullish', 'bearish', 'neutral'] },
            confidence: { type: 'number' },
            drivers: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
            conflicts: { type: 'array', items: { type: 'string' } },
          },
          required: ['currency', 'bias', 'confidence', 'drivers', 'conflicts'],
        },
      },
      high_impact_events: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'NZD', 'CAD'],
            },
            event: { type: 'string' },
            time_local: { type: 'string' },
            risk_note: { type: 'string' },
          },
          required: ['currency', 'event', 'time_local', 'risk_note'],
        },
      },
      sources: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string' },
            publisher: { type: 'string' },
            published_time: { type: 'string' },
            url: { type: 'string' },
          },
          required: ['title', 'publisher', 'published_time', 'url'],
        },
      },
    },
    required: ['as_of', 'macro_summary', 'currency_bias', 'high_impact_events', 'sources'],
  },
  strict: true,
} as const

const call2JsonSchema = {
  name: 'fx_call2',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      date: { type: 'string' },
      daily_rules: {
        type: 'object',
        additionalProperties: false,
        properties: {
          risk_mode: {
            type: 'string',
            enum: ['normal', 'reduced', 'post-news only', 'no-trade'],
          },
          rules: { type: 'array', items: { type: 'string' } },
        },
        required: ['risk_mode', 'rules'],
      },
      top_5_pairs: {
        type: 'array',
        minItems: 5,
        maxItems: 5,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            pair: { type: 'string' },
            bias: { type: 'string', enum: ['bullish', 'bearish', 'neutral'] },
            score: { type: 'number' },
            market_regime: {
              type: 'string',
              enum: ['trend', 'range', 'news-driven', 'untradable'],
            },
            selection_reasons: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: { type: 'string' },
            },
            scenarios: {
              type: 'object',
              additionalProperties: false,
              properties: {
                A: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    type: { type: 'string', enum: ['Continuation'] },
                    trigger_conditions: { type: 'array', items: { type: 'string' } },
                    invalidation: { type: 'string' },
                    targets: { type: 'array', minItems: 2, maxItems: 2, items: { type: 'string' } },
                    risk_note: { type: 'string' },
                  },
                  required: [
                    'type',
                    'trigger_conditions',
                    'invalidation',
                    'targets',
                    'risk_note',
                  ],
                },
                B: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    type: { type: 'string', enum: ['Reversal'] },
                    trigger_conditions: { type: 'array', items: { type: 'string' } },
                    invalidation: { type: 'string' },
                    targets: { type: 'array', minItems: 2, maxItems: 2, items: { type: 'string' } },
                    risk_note: { type: 'string' },
                  },
                  required: [
                    'type',
                    'trigger_conditions',
                    'invalidation',
                    'targets',
                    'risk_note',
                  ],
                },
              },
              required: ['A', 'B'],
            },
            rsi_smc_checklist: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  rule: {
                    type: 'string',
                    enum: [
                      'RSI reaches 75 or 25',
                      'SMC structure (BOS/CHoCH)',
                      'Liquidity sweep / zone reaction',
                    ],
                  },
                  status: { type: 'string', enum: ['pass', 'fail', 'unknown'] },
                },
                required: ['rule', 'status'],
              },
            },
            no_trade_if: { type: 'array', items: { type: 'string' } },
          },
          required: [
            'pair',
            'bias',
            'score',
            'market_regime',
            'selection_reasons',
            'scenarios',
            'rsi_smc_checklist',
            'no_trade_if',
          ],
        },
      },
      watchlist: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            pair: { type: 'string' },
            score: { type: 'number' },
            note: { type: 'string' },
          },
          required: ['pair', 'score', 'note'],
        },
      },
      avoid: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            pair: { type: 'string' },
            reason: { type: 'string' },
          },
          required: ['pair', 'reason'],
        },
      },
    },
    required: ['date', 'daily_rules', 'top_5_pairs', 'watchlist', 'avoid'],
  },
  strict: true,
} as const

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const parseOutput = <T>(outputText: string, schemaName: string) => {
  try {
    return JSON.parse(outputText) as T
  } catch {
    throw new Error(`Failed to parse ${schemaName} JSON output`)
  }
}

export const runCall1 = async (): Promise<Call1Response> => {
  const client = getClient()

  const response = await client.responses.create({
    model: MODEL,
    temperature: 0.2,
    tools: [{ type: 'web_search' }],
    input: [
      { role: 'system', content: call1SystemPrompt },
      { role: 'user', content: call1UserPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: call1JsonSchema,
    },
  })

  if (!response.output_text) {
    throw new Error('Call 1 response was empty')
  }

  const parsed = parseOutput<Call1Response>(response.output_text, 'Call 1')
  const validated = call1Schema.safeParse(parsed)
  if (!validated.success) {
    throw new Error(`Call 1 validation failed: ${validated.error.message}`)
  }

  return validated.data
}

export const runCall2 = async (
  call1: Call1Response,
): Promise<Call2Response> => {
  const client = getClient()

  const response = await client.responses.create({
    model: MODEL,
    temperature: 0.2,
    input: [
      { role: 'system', content: call2SystemPrompt },
      {
        role: 'user',
        content: `Call 1 JSON:\n\n${JSON.stringify(call1, null, 2)}\n\n${call2UserPrompt}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: call2JsonSchema,
    },
  })

  if (!response.output_text) {
    throw new Error('Call 2 response was empty')
  }

  const parsed = parseOutput<Call2Response>(response.output_text, 'Call 2')
  const validated = call2Schema.safeParse(parsed)
  if (!validated.success) {
    throw new Error(`Call 2 validation failed: ${validated.error.message}`)
  }

  return validated.data
}
