"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

interface Analytics {
  totalApplications: number;
  stageCounts: Record<string, number>;
  topSkillsInDemand: { skill: string; count: number }[];
  applicationTimeline: { date: string; count: number }[];
  successRate: number;
  offersReceived: number;
  recentApplications: { id: string; jobTitle: string; company: string | null; stage: string; submittedAt: string }[];
}

const STAGE_COLORS: Record<string, string> = {
  APPLIED: "#6b7280", SEEN: "#3b82f6", SHORTLISTED: "#8b5cf6",
  INTERVIEW: "#10b981", OFFER: "#f59e0b", REJECTED: "#ef4444", EXPIRED: "#374151",
};

const PIE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280", "#374151"];

export default function ApplicantAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/applicant")
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

  const stageData = Object.entries(data.stageCounts).map(([stage, count]) => ({ stage, count }));

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Job Search Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">Track your application performance</p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Applied", value: data.totalApplications },
          { label: "Offers Received", value: data.offersReceived },
          { label: "Success Rate", value: `${data.successRate}%` },
          { label: "In Progress", value: (data.stageCounts["SHORTLISTED"] || 0) + (data.stageCounts["INTERVIEW"] || 0) },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-white/10 bg-gray-900 p-4">
            <p className="text-xs text-gray-400">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Application Timeline */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Applications Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.applicationTimeline}>
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stage Distribution */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Application Stages</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={stageData} dataKey="count" nameKey="stage" cx="50%" cy="50%" outerRadius={70}>
                  {stageData.map((entry, i) => (
                    <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {stageData.map((entry, i) => (
                <div key={entry.stage} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: STAGE_COLORS[entry.stage] || PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-400">{entry.stage}</span>
                  </div>
                  <span className="font-medium text-white">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Skills in Demand */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Skills in Demand (from your applications)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topSkillsInDemand} layout="vertical">
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis dataKey="skill" type="category" tick={{ fill: "#9ca3af", fontSize: 11 }} width={80} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Applications */}
        <div className="rounded-xl border border-white/10 bg-gray-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Recent Applications</h2>
          <div className="space-y-2">
            {data.recentApplications.length === 0 ? (
              <p className="text-sm text-gray-500">No applications yet</p>
            ) : data.recentApplications.map(app => (
              <div key={app.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{app.jobTitle}</p>
                  <p className="text-xs text-gray-400">{app.company || "Unknown"}</p>
                </div>
                <span className="ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: `${STAGE_COLORS[app.stage]}20`, color: STAGE_COLORS[app.stage] }}>
                  {app.stage}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
