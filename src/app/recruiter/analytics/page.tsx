"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

interface Analytics {
  totalApplications: number;
  funnelData: { stage: string; count: number }[];
  conversionRates: { from: string; to: string; rate: number }[];
  applicationTrend: { date: string; count: number }[];
  avgResponseHours: number | null;
  topJobs: { title: string; count: number }[];
}

const STAGE_COLORS: Record<string, string> = {
  APPLIED: "#6b7280", SEEN: "#3b82f6", SHORTLISTED: "#8b5cf6",
  INTERVIEW: "#10b981", OFFER: "#f59e0b", REJECTED: "#ef4444",
};

export default function RecruiterAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/recruiter")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  );

  if (!data) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <p className="text-red-400">Failed to load analytics</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Hiring Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">Your pipeline performance at a glance</p>
      </div>

      {/* KPI Cards — 2 cols on mobile, 4 on sm+ */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        {[
          { label: "Total Applications", value: data.totalApplications },
          { label: "Avg Response", value: data.avgResponseHours != null ? `${data.avgResponseHours}h` : "N/A" },
          { label: "Offers Made", value: data.funnelData.find(f => f.stage === "OFFER")?.count ?? 0 },
          { label: "Offer Rate", value: data.totalApplications > 0 ? `${Math.round(((data.funnelData.find(f => f.stage === "OFFER")?.count ?? 0) / data.totalApplications) * 100)}%` : "0%" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-white/10 bg-gray-900 p-3 sm:p-4">
            <p className="text-xs text-gray-400 leading-tight">{kpi.label}</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Pipeline Funnel</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.funnelData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis dataKey="stage" type="category" tick={{ fill: "#9ca3af", fontSize: 10 }} width={80} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application Trend */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Applications (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.applicationTrend} margin={{ left: -10, right: 8 }}>
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rates */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Stage Conversion Rates</h2>
          <div className="space-y-3">
            {data.conversionRates.map(cr => (
              <div key={`${cr.from}-${cr.to}`}>
                <div className="mb-1 flex justify-between text-xs text-gray-400">
                  <span className="truncate mr-2">{cr.from} → {cr.to}</span>
                  <span className="font-medium text-white shrink-0">{cr.rate}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-800">
                  <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${cr.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Jobs */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Top Jobs by Applications</h2>
          <div className="space-y-2">
            {data.topJobs.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : data.topJobs.map((job, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2 gap-2">
                <span className="truncate text-sm text-gray-300 min-w-0">{job.title}</span>
                <span className="shrink-0 rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-400">{job.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
