import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_TIME_RANGES = [30, 90, 180] as const;
const MAX_SKILL_OVERLAYS = 4;

/**
 * GET /api/demand
 *
 * Public endpoint returning demand snapshot data for the heatmap.
 *
 * Query params:
 *   - category   (optional) — filter by category
 *   - city        (optional) — filter by city
 *   - timeRange   (optional, default 30) — 30, 90, or 180
 *   - skills      (optional, comma-separated, max 4) — comparison overlay
 *   - skill       (optional) — single skill trend line
 *
 * Response modes:
 *   1. `skills` param → trend data for each skill across all snapshots
 *   2. `skill` param  → trend line: [{ snapshotDate, count }]
 *   3. default        → all snapshots for the given timeRange/category/city
 *
 * Requirements: 11.4, 11.5, 11.6
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const category = searchParams.get("category")?.trim() || undefined;
  const city = searchParams.get("city")?.trim() || undefined;
  const timeRangeParam = searchParams.get("timeRange");
  const skillsParam = searchParams.get("skills");
  const skillParam = searchParams.get("skill")?.trim() || undefined;

  // Validate timeRange
  const timeRangeNum = timeRangeParam ? parseInt(timeRangeParam, 10) : 30;
  if (!VALID_TIME_RANGES.includes(timeRangeNum as (typeof VALID_TIME_RANGES)[number])) {
    return NextResponse.json(
      { error: "timeRange must be 30, 90, or 180" },
      { status: 400 }
    );
  }
  const timeRange = timeRangeNum as 30 | 90 | 180;

  try {
    // Mode 1: multi-skill comparison overlay (up to 4 skills)
    if (skillsParam) {
      const skills = skillsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, MAX_SKILL_OVERLAYS);

      if (skills.length === 0) {
        return NextResponse.json(
          { error: "skills param must contain at least one skill" },
          { status: 400 }
        );
      }

      // Return trend data for each skill across all available snapshots
      const snapshots = await prisma.demandSnapshot.findMany({
        where: {
          skill: { in: skills },
          ...(city ? { city } : {}),
          ...(category ? { category } : {}),
        },
        select: {
          skill: true,
          snapshotDate: true,
          count: true,
          timeRange: true,
          classification: true,
        },
        orderBy: { snapshotDate: "asc" },
      });

      // Group by skill
      const grouped: Record<
        string,
        { snapshotDate: string; count: number; timeRange: number; classification: string }[]
      > = {};

      for (const snap of snapshots) {
        if (!grouped[snap.skill]) grouped[snap.skill] = [];
        grouped[snap.skill].push({
          snapshotDate: snap.snapshotDate.toISOString(),
          count: snap.count,
          timeRange: snap.timeRange,
          classification: snap.classification,
        });
      }

      return NextResponse.json({ mode: "comparison", skills: grouped });
    }

    // Mode 2: single skill trend line
    if (skillParam) {
      const trendData = await prisma.demandSnapshot.findMany({
        where: {
          skill: skillParam,
          timeRange,
          ...(city ? { city } : {}),
          ...(category ? { category } : {}),
        },
        select: {
          snapshotDate: true,
          count: true,
          classification: true,
        },
        orderBy: { snapshotDate: "asc" },
      });

      return NextResponse.json({
        mode: "trend",
        skill: skillParam,
        data: trendData.map((d) => ({
          snapshotDate: d.snapshotDate.toISOString(),
          count: d.count,
          classification: d.classification,
        })),
      });
    }

    // Mode 3: default — all snapshots for the given filters
    const snapshots = await prisma.demandSnapshot.findMany({
      where: {
        timeRange,
        ...(city ? { city } : {}),
        ...(category ? { category } : {}),
      },
      select: {
        skill: true,
        count: true,
        classification: true,
        snapshotDate: true,
        category: true,
        city: true,
      },
      orderBy: { count: "desc" },
    });

    return NextResponse.json({
      mode: "snapshot",
      timeRange,
      data: snapshots.map((s) => ({
        skill: s.skill,
        count: s.count,
        classification: s.classification,
        snapshotDate: s.snapshotDate.toISOString(),
        category: s.category,
        city: s.city,
      })),
    });
  } catch (error) {
    console.error("[GET /api/demand] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
