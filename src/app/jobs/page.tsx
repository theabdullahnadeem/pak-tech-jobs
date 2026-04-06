"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import LiveJobCard, { LiveJob } from "@/components/LiveJobCard";

const JOB_TYPES = [
  { value: "", label: "Any" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "REMOTE", label: "Remote" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "PART_TIME", label: "Part-time" },
];

const EXPERIENCE_LEVELS = [
  { value: "", label: "Any" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Mid" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
];

const RESPONSE_RATES = [
  { value: "", label: "Any" },
  { value: "70", label: "70%+" },
  { value: "80", label: "80%+" },
  { value: "90", label: "90%+" },
];

interface Filters {
  q: string;
  city: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  responseRate: string;
}

const DEFAULT_FILTERS: Filters = {
  q: "",
  city: "",
  jobType: "",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  responseRate: "",
};

function buildQuery(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.city) params.set("city", filters.city);
  if (filters.jobType) params.set("jobType", filters.jobType);
  if (filters.experienceLevel) params.set("experienceLevel", filters.experienceLevel);
  if (filters.salaryMin) params.set("salaryMin", filters.salaryMin);
  if (filters.salaryMax) params.set("salaryMax", filters.salaryMax);
  if (filters.responseRate) params.set("responseRate", filters.responseRate);
  return params.toString();
}

export default function JobsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [jobs, setJobs] = useState<LiveJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce filter changes by 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters]);

  // Fetch jobs when debounced filters change
  const fetchJobs = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const qs = buildQuery(f);
      const res = await fetch(`/api/jobs${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: LiveJob[] = await res.json();
      setJobs(data);
      setLiveCount(data.length);
    } catch {
      // keep previous results on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(debouncedFilters);
  }, [debouncedFilters, fetchJobs]);

  // Socket.io: listen for jobs:count_updated
  useEffect(() => {
    const socket = io(window.location.origin, { path: "/api/socketio" });
    socketRef.current = socket;

    socket.on("jobs:count_updated", ({ activeCount }: { activeCount: number }) => {
      setLiveCount(activeCount);
      // Re-fetch to get the latest listings
      fetchJobs(debouncedFilters);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const displayCount = liveCount ?? jobs.length;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <div className="bg-gradient-to-r from-emerald-950 to-cyan-950 rounded-3xl p-8 md:p-14 mb-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Tech Jobs in Pakistan
            </h1>
            <p className="text-gray-300 mb-8">
              Find your next role. Every listing shows recruiter response rates so you know where to invest your time.
            </p>
            {/* Keyword search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by title, skill, or keyword…"
                value={filters.q}
                onChange={(e) => setFilter("q", e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Filter Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="e.g. Lahore"
                  value={filters.city}
                  onChange={(e) => setFilter("city", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilter("jobType", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {JOB_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Experience Level</label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => setFilter("experienceLevel", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {EXPERIENCE_LEVELS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Salary Range (USD/yr)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.salaryMin}
                    onChange={(e) => setFilter("salaryMin", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    min={0}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.salaryMax}
                    onChange={(e) => setFilter("salaryMax", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    min={0}
                  />
                </div>
              </div>

              {/* Min Response Rate */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Min Response Rate</label>
                <select
                  value={filters.responseRate}
                  onChange={(e) => setFilter("responseRate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {RESPONSE_RATES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Job Listings */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">
                {loading ? "Loading…" : `${displayCount} job${displayCount !== 1 ? "s" : ""} found`}
              </h2>
              {liveCount !== null && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-surface dark:bg-surface-dark animate-pulse border border-border dark:border-border-dark"
                  />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 text-muted">
                <p className="text-4xl mb-4">🔍</p>
                <p className="font-medium">No jobs match your filters.</p>
                <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <LiveJobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
