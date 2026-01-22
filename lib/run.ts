import 'server-only'

import { prisma } from '@/lib/db'
import { runCall1, runCall2 } from '@/lib/openai'
import { getBangkokDate } from '@/lib/time'

export const runDailyReport = async () => {
  const dateLocal = getBangkokDate()

  const call1Json = await runCall1()
  const call2Json = await runCall2(call1Json)

  const report = await prisma.dailyReport.upsert({
    where: { dateLocal },
    update: { call1Json, call2Json },
    create: { dateLocal, call1Json, call2Json },
  })

  return report
}
