import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 })
  }

  const report = await prisma.dailyReport.findUnique({
    where: { dateLocal: date },
  })

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  return NextResponse.json(report)
}
