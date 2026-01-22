import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ReportView } from '@/app/components/fx/report-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import type { Call1Response, Call2Response } from '@/lib/validators'

const HistoryDetailPage = async ({
  params,
}: {
  params: { date: string }
}) => {
  const report = await prisma.dailyReport.findUnique({
    where: { dateLocal: params.date },
  })

  if (!report) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Report for {report.dateLocal}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/history">Back to history</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <ReportView
          call1={report.call1Json as Call1Response}
          call2={report.call2Json as Call2Response}
        />
      </div>
    </main>
  )
}

export default HistoryDetailPage
