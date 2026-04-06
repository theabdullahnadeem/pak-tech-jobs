import { NextRequest, NextResponse } from "next/server";
import { runSlaEnforcement, runAutoInactiveCheck } from "@/jobs/slaEnforcement";

/**
 * GET /api/cron/sla
 *
 * Vercel Cron endpoint that triggers the daily SLA enforcement sweep.
 * Protected by a CRON_SECRET header to prevent unauthorized invocations.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.6
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.headers.get("x-cron-secret");
  const isAuthorized =
    (authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
    (cronSecret === process.env.CRON_SECRET);

  if (!process.env.CRON_SECRET || !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [slaResult, autoInactiveResult] = await Promise.all([
      runSlaEnforcement(),
      runAutoInactiveCheck(),
    ]);
    return NextResponse.json({ ok: true, ...slaResult, ...autoInactiveResult });
  } catch (error) {
    console.error("[SLA cron] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
