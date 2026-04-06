import { NextRequest, NextResponse } from "next/server";
import { runDemandSnapshot } from "@/jobs/demandSnapshot";

/**
 * GET /api/cron/demand
 *
 * Vercel Cron endpoint that triggers the daily demand snapshot aggregation.
 * Protected by a CRON_SECRET header to prevent unauthorized invocations.
 *
 * Requirements: 11.1, 11.2
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.headers.get("x-cron-secret");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    cronSecret === process.env.CRON_SECRET;

  if (!process.env.CRON_SECRET || !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDemandSnapshot();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[demand cron] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
