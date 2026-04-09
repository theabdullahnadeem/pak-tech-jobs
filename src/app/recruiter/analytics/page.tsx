"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, FunnelChart, Funnel, LabelList,
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
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Hiring Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">Your pipeline performance at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Applications", value: data.totalApplications },
          { label: "Avg Response Time", value: data.avgResponseHours != null ? `${data.avgResponseHours}h` : "N/A" },
          { label: "Offers Made", value: data.funnelData.find(f => f.stage === "OFFER")?.count ?? 0 },
          { label: "Offer Rate", value: data.totalApplications > 0 ? `${Math.round(((data.funnelData.find(f => f.stage === "OFFER")?.count ?? 0) / data.totalApplications) * 100)}%` : "0%" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-white/10 bg-gray-900 p-4">
            <p className="text-xs text-gray-400">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Pipeline Funnel</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.funnelData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis dataKey="stage" type="category" tick={{ fill: "#9ca3af", fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.funnelData.map((entry) => (
                  <rect key={entry.stage} fill={STAGE_COLORS[entry.stage] || "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application Trend */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Applications (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.applicationTrend}>
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rates */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Stage Conversion Rates</h2>
          <div className="space-y-3">
            {data.conversionRates.map(cr => (
              <div key={`${cr.from}-${cr.to}`}>
                <div className="mb-1 flex justify-between text-xs text-gray-400">
                  <span>{cr.from} → {cr.to}</span>
                  <span className="font-medium text-white">{cr.rate}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-800">
                  <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${cr.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Jobs */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Top Jobs by Applications</h2>
          <div className="space-y-2">
            {data.topJobs.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : data.topJobs.map((job, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2">
                <span className="truncate text-sm text-gray-300">{job.title}</span>
                <span className="ml-2 shrink-0 rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-400">{job.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
