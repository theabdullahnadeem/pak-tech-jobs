/**
 * Pure classification logic for demand heatmap skill categorization.
 * Extracted from src/jobs/demandSnapshot.ts for testability.
 *
 * Requirements: 11.3
 */

export type SkillClassification = "In-Demand" | "Oversaturated" | "Neither";

export interface SkillCount {
  skill: string;
  count: number;
}

export interface ClassifiedSkill extends SkillCount {
  classification: SkillClassification;
}

/**
 * Classifies an array of skills by demand frequency.
 * - Top 20% by count → "In-Demand"
 * - Bottom 20% by count → "Oversaturated"
 * - Middle 60% → "Neither"
 */
export function classifySkills(skills: SkillCount[]): ClassifiedSkill[] {
  if (skills.length === 0) return [];

  const sorted = [...skills].sort((a, b) => b.count - a.count);
  const total = sorted.length;

  // Top 20% threshold index (exclusive upper bound for "In-Demand")
  const topThreshold = Math.ceil(total * 0.2);
  // Bottom 20% threshold index (start of "Oversaturated")
  const bottomThreshold = Math.floor(total * 0.8);

  return sorted.map((skill, index) => ({
    ...skill,
    classification:
      index < topThreshold
        ? "In-Demand"
        : index >= bottomThreshold
        ? "Oversaturated"
        : "Neither",
  }));
}
