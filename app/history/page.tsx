import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'

const HistoryPage = async () => {
  const reports = await prisma.dailyReport.findMany({
    orderBy: { dateLocal: 'desc' },
  })

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
        <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              FX News → Top 5 Trade Decision System (Pro)
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Report History
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Browse prior daily reports by date.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back to dashboard</Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Available reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-sm text-slate-500">No reports generated yet.</p>
            ) : (
              <ul className="space-y-3">
                {reports.map((report) => (
                  <li
                    key={report.dateLocal}
                    className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {report.dateLocal}
                      </p>
                      <p className="text-xs text-slate-500">
                        Created {report.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <Button variant="secondary" asChild>
                      <Link href={`/history/${report.dateLocal}`}>View</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default HistoryPage
