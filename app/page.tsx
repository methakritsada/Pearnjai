import Link from 'next/link'
import { revalidatePath } from 'next/cache'

import { ReportView } from '@/app/components/fx/report-view'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import { runDailyReport } from '@/lib/run'
import type { Call1Response, Call2Response } from '@/lib/validators'

const runNow = async () => {
  'use server'

  await runDailyReport()
  revalidatePath('/')
}

const DashboardPage = async () => {
  const report = await prisma.dailyReport.findFirst({
    orderBy: { dateLocal: 'desc' },
  })

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              FX News → Top 5 Trade Decision System (Pro)
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Daily Macro & Trade Decision Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Latest report delivered from live macro news with strict
              risk-first rankings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <form action={runNow}>
              <Button type="submit">Run now</Button>
            </form>
            <Button variant="outline" asChild>
              <Link href="/history">View history</Link>
            </Button>
          </div>
        </header>

        {report ? (
          <ReportView
            call1={report.call1Json as Call1Response}
            call2={report.call2Json as Call2Response}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            <h2 className="text-lg font-semibold text-slate-900">
              No reports yet
            </h2>
            <p className="mt-2 text-sm">
              Run the system to fetch macro news, build the bias matrix, and
              generate today&apos;s Top 5 trade ideas.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default DashboardPage
