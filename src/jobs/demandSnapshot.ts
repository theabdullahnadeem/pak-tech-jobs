import { prisma } from "@/lib/prisma";

const TIME_RANGES = [30, 90, 180] as const;

export interface DemandSnapshotResult {
  processed: number;
}

/**
 * Classifies skills into "In-Demand", "Oversaturated", or "Neutral" based on
 * frequency counts. Top 20% = "In-Demand", bottom 20% = "Oversaturated".
 *
 * Requirements: 11.3
 */
export function classifySkills(
  skillCounts: Map<string, number>
): Map<string, string> {
  const entries = Array.from(skillCounts.entries()).sort((a, b) => b[1] - a[1]);
  const total = entries.length;

  if (total === 0) return new Map();

  // Calculate thresholds using ceil/floor to ensure top 20% and bottom 20%
  // are non-overlapping even for small sets
  const topThresholdIndex = Math.ceil(total * 0.2); // top 20% boundary (exclusive upper)
  const bottomThresholdIndex = Math.floor(total * 0.8); // bottom 20% starts here

  const classifications = new Map<string, string>();

  for (let i = 0; i < entries.length; i++) {
    const [skill] = entries[i];
    if (i < topThresholdIndex) {
      classifications.set(skill, "In-Demand");
    } else if (i >= bottomThresholdIndex) {
      classifications.set(skill, "Oversaturated");
    } else {
      classifications.set(skill, "Neutral");
    }
  }

  return classifications;
}

/**
 * Daily cron that aggregates JobPost.skills frequency counts for 30/90/180-day
 * windows and upserts into DemandSnapshot. Classifies top 20% as "In-Demand"
 * and bottom 20% as "Oversaturated".
 *
 * Requirements: 11.1, 11.2, 11.3
 */
export async function runDemandSnapshot(): Promise<DemandSnapshotResult> {
  const now = new Date();
  // Normalize to start of day for consistent upsert keys
  const snapshotDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  let processed = 0;

  for (const timeRange of TIME_RANGES) {
    const since = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

    // Fetch active job posts within the time window
    const jobPosts = await prisma.jobPost.findMany({
      where: {
        isActive: true,
        isClosed: false,
        createdAt: { gte: since },
      },
      select: {
        skills: true,
        category: true,
        city: true,
      },
    });

    // Aggregate skill frequency counts
    const skillCounts = new Map<string, number>();
    for (const post of jobPosts) {
      for (const skill of post.skills) {
        skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
      }
    }

    // Classify skills
    const classifications = classifySkills(skillCounts);

    // Upsert each skill into DemandSnapshot
    for (const [skill, count] of skillCounts.entries()) {
      const classification = classifications.get(skill) ?? "Neutral";

      await prisma.demandSnapshot.upsert({
        where: {
          skill_timeRange_snapshotDate: {
            skill,
            timeRange,
            snapshotDate,
          },
        },
        update: {
          count,
          classification,
        },
        create: {
          skill,
          count,
          snapshotDate,
          timeRange,
          classification,
        },
      });

      processed++;
    }
  }

  return { processed };
}
