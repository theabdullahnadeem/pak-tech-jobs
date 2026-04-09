"use client";

import { useEffect, useState } from "react";

interface JobAlert {
  id: string;
  keywords: string[];
  city: string | null;
  jobType: string | null;
  experienceLevel: string | null;
  salaryMin: number | null;
  isActive: boolean;
  createdAt: string;
}

export default function JobAlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [city, setCity] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salaryMin, setSalaryMin] = useState("");

  useEffect(() => {
    fetch("/api/job-alerts")
      .then(r => r.json())
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;
    setCreating(true);
    const res = await fetch("/api/job-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
        city: city || undefined,
        jobType: jobType || undefined,
        experienceLevel: experienceLevel || undefined,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
      }),
    });
    if (res.ok) {
      const alert = await res.json();
      setAlerts(prev => [alert, ...prev]);
      setShowForm(false);
      setKeywords(""); setCity(""); setJobType(""); setExperienceLevel(""); setSalaryMin("");
    }
    setCreating(false);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/job-alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !isActive } : a));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/job-alerts/${id}`, { method: "DELETE" });
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Alerts</h1>
          <p className="mt-1 text-sm text-gray-400">Get notified when matching jobs are posted</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
          + New Alert
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-white/10 bg-gray-900 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Create Job Alert</h2>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Keywords (comma-separated) *</label>
            <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="React, TypeScript, Node.js"
              className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">City</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Lahore"
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min Salary (PKR)</label>
              <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="50000"
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Job Type</label>
              <select value={jobType} onChange={e => setJobType(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                <option value="">Any</option>
                {["FULL_TIME","REMOTE","CONTRACT","INTERNSHIP","PART_TIME"].map(t => (
                  <option key={t} value={t}>{t.replace("_"," ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Experience Level</label>
              <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                <option value="">Any</option>
                {["JUNIOR","MID","SENIOR","LEAD"].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating || !keywords.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {creating ? "Creating…" : "Create Alert"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900 py-20">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-400">No job alerts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="rounded-xl border border-white/10 bg-gray-900 px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-1 mb-1">
                  {alert.keywords.map(k => (
                    <span key={k} className="rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-400">{k}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {[alert.city, alert.jobType?.replace("_"," "), alert.experienceLevel, alert.salaryMin ? `PKR ${alert.salaryMin.toLocaleString()}+` : null]
                    .filter(Boolean).join(" · ") || "Any location/type"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => handleToggle(alert.id, alert.isActive)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${alert.isActive ? "bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60" : "bg-gray-800 text-gray-500 hover:bg-gray-700"}`}>
                  {alert.isActive ? "Active" : "Paused"}
                </button>
                <button onClick={() => handleDelete(alert.id)}
                  className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-950/30 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
