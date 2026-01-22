import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const report = await prisma.dailyReport.findFirst({
    orderBy: { dateLocal: 'desc' },
  })

  if (!report) {
    return NextResponse.json({ error: 'No reports found' }, { status: 404 })
  }

  return NextResponse.json(report)
}
