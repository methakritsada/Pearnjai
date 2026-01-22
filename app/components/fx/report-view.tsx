import type { ReactNode } from 'react'

import type { Call1Response, Call2Response } from '@/lib/validators'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const formatBias = (bias: string) => {
  if (bias === 'bullish') return 'Bullish'
  if (bias === 'bearish') return 'Bearish'
  return 'Neutral'
}

const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

export const ReportView = ({
  call1,
  call2,
}: {
  call1: Call1Response
  call2: Call2Response
}) => {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Macro Brief"
        description={`As of ${call1.as_of} (Asia/Bangkok)`}
      >
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Market driver
            </p>
            <p className="mt-1 text-slate-800">{call1.macro_summary.market_driver}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Risk environment
            </p>
            <p className="mt-1 text-slate-800">
              {call1.macro_summary.risk_environment}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Key uncertainties
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-700">
              {call1.macro_summary.key_uncertainties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Daily Rules"
        description={`Risk mode: ${call2.daily_rules.risk_mode}`}
      >
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
          {call2.daily_rules.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        title="High-impact events"
        description="Times shown in Asia/Bangkok"
      >
        {call1.high_impact_events.length === 0 ? (
          <p className="text-sm text-slate-500">No high-impact events listed.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-2">Currency</th>
                  <th className="pb-2">Event</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Risk note</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {call1.high_impact_events.map((event, index) => (
                  <tr key={`${event.currency}-${index}`} className="border-t">
                    <td className="py-2 pr-4 font-medium">{event.currency}</td>
                    <td className="py-2 pr-4">{event.event}</td>
                    <td className="py-2 pr-4">{event.time_local}</td>
                    <td className="py-2">{event.risk_note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Currency Bias Matrix">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-2">Currency</th>
                <th className="pb-2">Bias</th>
                <th className="pb-2">Confidence</th>
                <th className="pb-2">Drivers</th>
                <th className="pb-2">Conflicts</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {call1.currency_bias.map((row) => (
                <tr key={row.currency} className="border-t">
                  <td className="py-2 pr-4 font-medium">{row.currency}</td>
                  <td className="py-2 pr-4">{formatBias(row.bias)}</td>
                  <td className="py-2 pr-4">{row.confidence}</td>
                  <td className="py-2 pr-4">
                    <ul className="list-disc space-y-1 pl-4">
                      {row.drivers.map((driver) => (
                        <li key={driver}>{driver}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-2">
                    {row.conflicts.length === 0 ? (
                      <span className="text-slate-400">None</span>
                    ) : (
                      <ul className="list-disc space-y-1 pl-4">
                        {row.conflicts.map((conflict) => (
                          <li key={conflict}>{conflict}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Top 5 Trade Ideas">
        <div className="grid gap-4 lg:grid-cols-2">
          {call2.top_5_pairs.map((pair) => (
            <Card key={pair.pair} className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{pair.pair}</span>
                  <span className="text-sm font-normal text-slate-500">
                    Score {pair.score}
                  </span>
                </CardTitle>
                <CardDescription>
                  {formatBias(pair.bias)} · {pair.market_regime}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Selection reasons
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {pair.selection_reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Scenario A · Continuation
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      {pair.scenarios.A.trigger_conditions.map((condition) => (
                        <li key={condition}>{condition}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-slate-500">Targets</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {pair.scenarios.A.targets.map((target) => (
                        <li key={target}>{target}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-slate-500">Invalidation</p>
                    <p className="mt-1 text-slate-700">
                      {pair.scenarios.A.invalidation}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">Risk note</p>
                    <p className="mt-1 text-slate-700">
                      {pair.scenarios.A.risk_note}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Scenario B · Reversal
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      {pair.scenarios.B.trigger_conditions.map((condition) => (
                        <li key={condition}>{condition}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-slate-500">Targets</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {pair.scenarios.B.targets.map((target) => (
                        <li key={target}>{target}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-slate-500">Invalidation</p>
                    <p className="mt-1 text-slate-700">
                      {pair.scenarios.B.invalidation}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">Risk note</p>
                    <p className="mt-1 text-slate-700">
                      {pair.scenarios.B.risk_note}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    RSI + SMC checklist
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {pair.rsi_smc_checklist.map((item) => (
                      <li key={`${pair.pair}-${item.rule}`}>
                        {item.rule}: {item.status}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    No-trade if
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {pair.no_trade_if.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Watchlist">
          {call2.watchlist.length === 0 ? (
            <p className="text-sm text-slate-500">No watchlist pairs.</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-700">
              {call2.watchlist.map((item) => (
                <li key={item.pair}>
                  <span className="font-medium">{item.pair}</span> — {item.score}
                  <span className="text-slate-500"> · {item.note}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard title="Avoid">
          {call2.avoid.length === 0 ? (
            <p className="text-sm text-slate-500">No avoid list items.</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-700">
              {call2.avoid.map((item) => (
                <li key={item.pair}>
                  <span className="font-medium">{item.pair}</span> —
                  <span className="text-slate-500"> {item.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="News sources">
        <ul className="space-y-2 text-sm text-slate-700">
          {call1.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                className="font-medium text-slate-900 underline"
                target="_blank"
                rel="noreferrer"
              >
                {source.title}
              </a>
              <div className="text-xs text-slate-500">
                {source.publisher} · {source.published_time}
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
