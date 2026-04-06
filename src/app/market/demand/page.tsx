"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Classification = "In-Demand" | "Oversaturated" | "Neither";

interface SnapshotItem {
  skill: string;
  count: number;
  classification: Classification;
  snapshotDate: string;
  category: string | null;
  city: string | null;
}

interface TrendPoint {
  snapshotDate: string;
  count: number;
  classification: Classification;
}

interface ComparisonData {
  [skillName: string]: TrendPoint[];
}

type TimeRange = 30 | 90 | 180;

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 180, label: "180 days" },
];

const COMPARISON_COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function ClassificationBadge({ value }: { value: Classification }) {
  if (value === "In-Demand") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        🔥 In-Demand
      </span>
    );
  }
  if (value === "Oversaturated") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
        ↓ Oversaturated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
      — Neither
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="w-6 h-4 rounded bg-surface dark:bg-surface-dark" />
      <div className="flex-1 h-4 rounded bg-surface dark:bg-surface-dark" />
      <div className="w-16 h-4 rounded bg-surface dark:bg-surface-dark" />
      <div className="w-24 h-5 rounded-full bg-surface dark:bg-surface-dark" />
      <div className="w-20 h-7 rounded-lg bg-surface dark:bg-surface-dark" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemandHeatmapPage() {
  // Filters
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");

  // Snapshot data
  const [snapshot, setSnapshot] = useState<SnapshotItem[]>([]);
  const [snapshotLoading, setSnapshotLoading] = useState(true);

  // Selected skill for trend line
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendClassification, setTrendClassification] = useState<Classification | null>(null);

  // Comparison overlay (up to 4 skills)
  const [comparedSkills, setComparedSkills] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData>({});
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // ── Fetch snapshot ──────────────────────────────────────────────────────────

  const fetchSnapshot = useCallback(async () => {
    setSnapshotLoading(true);
    try {
      const params = new URLSearchParams({ timeRange: String(timeRange) });
      if (category) params.set("category", category);
      if (city) params.set("city", city);
      const res = await fetch(`/api/demand?${params}`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      if (json.mode === "snapshot" && Array.isArray(json.data)) {
        setSnapshot(json.data.slice(0, 20));
      }
    } catch {
      setSnapshot([]);
    } finally {
      setSnapshotLoading(false);
    }
  }, [timeRange, category, city]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  // ── Fetch trend for selected skill ─────────────────────────────────────────

  const fetchTrend = useCallback(async (skill: string) => {
    setTrendLoading(true);
    try {
      const params = new URLSearchParams({ skill, timeRange: String(timeRange) });
      const res = await fetch(`/api/demand?${params}`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      if (json.mode === "trend" && Array.isArray(json.data)) {
        setTrendData(json.data);
        setTrendClassification(json.data[json.data.length - 1]?.classification ?? null);
      }
    } catch {
      setTrendData([]);
    } finally {
      setTrendLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (selectedSkill) fetchTrend(selectedSkill);
  }, [selectedSkill, fetchTrend]);

  // ── Fetch comparison data ───────────────────────────────────────────────────

  const fetchComparison = useCallback(async (skills: string[]) => {
    if (skills.length < 2) return;
    setComparisonLoading(true);
    try {
      const params = new URLSearchParams({
        skills: skills.join(","),
        timeRange: String(timeRange),
      });
      const res = await fetch(`/api/demand?${params}`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      if (json.mode === "comparison" && json.skills) {
        setComparisonData(json.skills as ComparisonData);
      }
    } catch {
      setComparisonData({});
    } finally {
      setComparisonLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (comparedSkills.length >= 2) {
      fetchComparison(comparedSkills);
    } else {
      setComparisonData({});
    }
  }, [comparedSkills, fetchComparison]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleSkillClick(skill: string) {
    setSelectedSkill((prev) => (prev === skill ? null : skill));
  }

  function handleAddCompare(skill: string) {
    setComparedSkills((prev) => {
      if (prev.includes(skill)) return prev;
      if (prev.length >= 4) return prev;
      return [...prev, skill];
    });
  }

  function handleRemoveCompare(skill: string) {
    setComparedSkills((prev) => prev.filter((s) => s !== skill));
  }

  function clearComparison() {
    setComparedSkills([]);
    setComparisonData({});
  }

  // ── Build comparison chart data ─────────────────────────────────────────────

  const comparisonChartData = (() => {
    if (comparedSkills.length < 2 || Object.keys(comparisonData).length === 0) return [];
    // Collect all unique dates
    const dateSet = new Set<string>();
    for (const points of Object.values(comparisonData)) {
      for (const p of points) dateSet.add(p.snapshotDate);
    }
    const dates = Array.from(dateSet).sort();
    return dates.map((date) => {
      const row: Record<string, string | number> = { date: formatDate(date) };
      for (const skill of comparedSkills) {
        const point = comparisonData[skill]?.find((p) => p.snapshotDate === date);
        row[skill] = point?.count ?? 0;
      }
      return row;
    });
  })();

  const trendChartData = trendData.map((p) => ({
    date: formatDate(p.snapshotDate),
    count: p.count,
  }));

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Demand Heatmap</h1>
          <p className="text-muted mt-1 text-sm">
            Skill demand trends derived from active job posts. Updated daily.
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap gap-3 mb-8 p-4 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
          {/* Time range */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value) as TimeRange)}
              className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {TIME_RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Category</label>
            <input
              type="text"
              placeholder="e.g. Backend"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 w-40"
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">City</label>
            <input
              type="text"
              placeholder="e.g. Lahore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 w-40"
            />
          </div>
        </div>

        {/* Comparison overlay */}
        {comparedSkills.length >= 2 && (
          <div className="mb-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">
                Technology Comparison
                <span className="ml-2 text-xs text-muted font-normal">
                  ({comparedSkills.length}/4 skills)
                </span>
              </h2>
              <button
                onClick={clearComparison}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear comparison
              </button>
            </div>

            {/* Compared skill chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {comparedSkills.map((skill, i) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    borderColor: COMPARISON_COLORS[i] + "40",
                    backgroundColor: COMPARISON_COLORS[i] + "15",
                    color: COMPARISON_COLORS[i],
                  }}
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveCompare(skill)}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {comparisonLoading ? (
              <div className="h-64 rounded-xl bg-surface dark:bg-surface-dark animate-pulse" />
            ) : comparisonChartData.length === 0 ? (
              <p className="text-sm text-muted text-center py-10">No comparison data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={comparisonChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  {comparedSkills.map((skill, i) => (
                    <Line
                      key={skill}
                      type="monotone"
                      dataKey={skill}
                      stroke={COMPARISON_COLORS[i]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Trend line for selected skill */}
        {selectedSkill && (
          <div className="mb-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold">{selectedSkill} — Trend</h2>
                {trendClassification && (
                  <ClassificationBadge value={trendClassification} />
                )}
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>

            {trendLoading ? (
              <div className="h-52 rounded-xl bg-surface dark:bg-surface-dark animate-pulse" />
            ) : trendChartData.length === 0 ? (
              <p className="text-sm text-muted text-center py-10">No trend data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Snapshot table */}
        <div className="rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark overflow-hidden">
          <div className="px-4 py-3 border-b border-border dark:border-border-dark">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Top Skills Snapshot
            </h2>
          </div>

          {snapshotLoading ? (
            <div className="divide-y divide-border dark:divide-border-dark">
              {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : snapshot.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p className="text-3xl mb-3">📊</p>
              <p className="font-medium">No data for the selected filters.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border dark:divide-border-dark">
              {snapshot.map((item, idx) => {
                const isSelected = selectedSkill === item.skill;
                const isCompared = comparedSkills.includes(item.skill);
                const canAddMore = comparedSkills.length < 4;

                return (
                  <li
                    key={item.skill}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isSelected
                        ? "bg-emerald-500/5"
                        : "hover:bg-surface dark:hover:bg-surface-dark"
                    }`}
                  >
                    {/* Rank */}
                    <span className="w-6 text-xs text-muted text-right flex-shrink-0">
                      {idx + 1}
                    </span>

                    {/* Skill name — click for trend */}
                    <button
                      onClick={() => handleSkillClick(item.skill)}
                      className="flex-1 text-left text-sm font-medium hover:text-primary transition-colors truncate"
                    >
                      {item.skill}
                    </button>

                    {/* Count */}
                    <span className="text-sm text-muted w-12 text-right flex-shrink-0">
                      {item.count}
                    </span>

                    {/* Classification badge */}
                    <div className="flex-shrink-0 w-32">
                      <ClassificationBadge value={item.classification} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Compare button */}
                      {isCompared ? (
                        <button
                          onClick={() => handleRemoveCompare(item.skill)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                        >
                          ✓ Added
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddCompare(item.skill)}
                          disabled={!canAddMore}
                          className="text-xs px-2.5 py-1 rounded-lg border border-border dark:border-border-dark text-muted hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          + Compare
                        </button>
                      )}

                      {/* Jobs link */}
                      <Link
                        href={`/jobs?q=${encodeURIComponent(item.skill)}`}
                        className="text-xs px-2.5 py-1 rounded-lg border border-border dark:border-border-dark text-muted hover:text-primary hover:border-primary/40 transition-colors"
                      >
                        Jobs →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Comparison hint */}
        {comparedSkills.length === 1 && (
          <p className="mt-3 text-xs text-muted text-center">
            Add one more skill to see the comparison chart.
          </p>
        )}
        {comparedSkills.length === 4 && (
          <p className="mt-3 text-xs text-muted text-center">
            Maximum 4 skills in comparison. Remove one to add another.
          </p>
        )}

      </div>
    </div>
  );
}
