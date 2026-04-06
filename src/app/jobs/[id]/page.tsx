"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EasyApplyModal from "@/components/EasyApplyModal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────

interface Recruiter {
  id: string;
  name: string;
  companyName: string | null;
  responseRate: number;
  avgResponseTimeHours: number | null;
  recruiterVerified: boolean;
}

interface JobDetail {
  id: string;
  title: string;
  description: string;
  skills: string[];
  city: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  experienceLevel: string;
  jobType: string;
  category: string[];
  isActive: boolean;
  isClosed: boolean;
  isInactiveLowResponse: boolean;
  createdAt: string;
  recruiter: Recruiter;
  requiredFields: string[];
}

interface TrendPoint {
  snapshotDate: string;
  count: number;
  classification: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatJobType(jt: string) {
  return jt.replace(/_/g, "-").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatExperience(el: string) {
  return el.charAt(0) + el.slice(1).toLowerCase();
}

function ResponseRateBadge({ rate }: { rate: number }) {
  if (rate >= 90) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        ✓ {Math.round(rate)}% Highly Responsive
      </span>
    );
  }
  if (rate >= 70) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
        ~ {Math.round(rate)}% Responsive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
      ⚠ {Math.round(rate)}% Low Responsiveness
    </span>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-2/3 rounded-xl bg-surface dark:bg-surface-dark" />
        <div className="h-5 w-1/3 rounded-lg bg-surface dark:bg-surface-dark" />
        <div className="h-48 rounded-2xl bg-surface dark:bg-surface-dark" />
        <div className="h-32 rounded-2xl bg-surface dark:bg-surface-dark" />
        <div className="h-40 rounded-2xl bg-surface dark:bg-surface-dark" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{ stage: string } | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(false);

  // Fetch job details
  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) {
          const data = await res.json();
          setJobError(data.error ?? "Job not found");
          return;
        }
        const data: JobDetail = await res.json();
        setJob(data);
      } catch {
        setJobError("Failed to load job details");
      } finally {
        setJobLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  // Fetch demand trend for primary skill once job is loaded
  useEffect(() => {
    if (!job?.skills?.length) return;
    const primarySkill = job.skills[0];
    setTrendLoading(true);
    fetch(`/api/demand?skills=${encodeURIComponent(primarySkill)}&timeRange=30`)
      .then((r) => r.json())
      .then((data) => {
        // API returns { mode: "comparison", skills: { [skill]: [...] } }
        const points: TrendPoint[] =
          data?.skills?.[primarySkill] ?? [];
        setTrendData(points);
      })
      .catch(() => setTrendData([]))
      .finally(() => setTrendLoading(false));
  }, [job]);

  // Check if user already applied
  useEffect(() => {
    if (!session?.user || session.user.role !== "APPLICANT" || !job) return;
    setCheckingApplication(true);
    fetch("/api/applications")
      .then(r => r.json())
      .then((apps: Array<{ id: string; stage: string; jobPost: { id: string } }>) => {
        const existing = apps.find(a => a.jobPost.id === job.id);
        if (existing) setExistingApplication({ stage: existing.stage });
      })
      .catch(() => {})
      .finally(() => setCheckingApplication(false));
  }, [session, job]);

  if (jobLoading) return <Skeleton />;

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <p className="font-semibold text-lg">{jobError ?? "Job not found"}</p>
          <Link href="/jobs" className="mt-4 inline-block text-sm text-primary hover:underline">
            ← Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const primarySkill = job.skills[0] ?? "";
  const companyName = job.recruiter.companyName ?? job.recruiter.name;
  const isRemote =
    job.jobType === "REMOTE" || job.location.toLowerCase().includes("remote");

  const trendChartData = trendData.map((p) => ({
    date: new Date(p.snapshotDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count: p.count,
  }));

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-6 transition-colors"
        >
          ← Back to listings
        </Link>

        {/* Header card */}
        <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 flex-shrink-0 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark flex items-center justify-center text-xl font-bold text-muted">
              {companyName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground mb-1">{job.title}</h1>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-muted">
                <span className="font-medium text-muted-foreground">
                  {companyName}
                  {job.recruiter.recruiterVerified && (
                    <span className="ml-1 text-blue-500" title="Verified Company">✓</span>
                  )}
                </span>
                <span>•</span>
                <span className={isRemote ? "text-emerald-500" : ""}>
                  {isRemote ? "🌍 Remote" : `📍 ${job.city}`}
                </span>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-sm mb-4">
            <span className="flex items-center gap-1">
              <span className="text-muted">💰</span>
              <span className="font-semibold">
                ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}
              </span>
            </span>
            <span className="flex items-center gap-1 text-muted">
              <span>⏳</span>
              {formatExperience(job.experienceLevel)}
            </span>
            <span className="flex items-center gap-1 text-muted">
              <span>💼</span>
              {formatJobType(job.jobType)}
            </span>
          </div>

          {/* Response rate */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <ResponseRateBadge rate={job.recruiter.responseRate} />
            <span className="text-xs text-muted">
              {job.recruiter.avgResponseTimeHours != null
                ? `Avg. response: ${job.recruiter.avgResponseTimeHours}h`
                : "Avg. response: N/A"}
            </span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border dark:border-border-dark">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-6 mb-5">
          <h2 className="text-base font-semibold mb-3">Job Description</h2>
          <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {/* Inline demand trend chart */}
        {primarySkill && (
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-6 mb-5">
            <h2 className="text-base font-semibold mb-1">
              {primarySkill} Demand Trend
            </h2>
            <p className="text-xs text-muted mb-4">Last 30 days · job postings requiring {primarySkill}</p>

            {trendLoading ? (
              <div className="h-32 rounded-xl bg-surface dark:bg-surface-dark animate-pulse" />
            ) : trendChartData.length === 0 ? (
              <p className="text-xs text-muted italic">No trend data available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={trendChartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--color-muted, #888)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--color-muted, #888)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid var(--color-border, #e5e7eb)",
                      background: "var(--color-card, #fff)",
                    }}
                    labelStyle={{ fontWeight: 600 }}
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

            {/* Contextual link to full heatmap */}
            <Link
              href={`/market/demand?skill=${encodeURIComponent(primarySkill)}`}
              className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View full {primarySkill} demand trend →
            </Link>
          </div>
        )}

        {/* Apply section */}
        <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-6 mb-5">
          <h2 className="text-base font-semibold mb-3">Apply for this role</h2>

          {job.isClosed || !job.isActive ? (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              This job is no longer accepting applications.
            </p>
          ) : checkingApplication ? (
            <div className="h-9 w-32 rounded-xl bg-surface dark:bg-surface-dark animate-pulse" />
          ) : existingApplication ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2.5">
                ✓ Applied — Status: <span className="font-semibold">{existingApplication.stage}</span>
              </span>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  if (sessionStatus === "loading") return;
                  if (!session) { router.push("/login"); return; }
                  setShowApplyModal(true);
                }}
                disabled={sessionStatus === "loading"}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Apply Now
              </button>
              {!session && sessionStatus !== "loading" && (
                <p className="mt-2 text-xs text-muted">
                  You&apos;ll be redirected to sign in before applying.
                </p>
              )}
            </>
          )}
        </div>

        {/* Easy Apply Modal */}
        {showApplyModal && job && (
          <EasyApplyModal
            job={{ id: job.id, title: job.title, requiredFields: job.requiredFields ?? ["name", "email"] }}
            onClose={() => setShowApplyModal(false)}
            onSuccess={() => {
              setShowApplyModal(false);
              setExistingApplication({ stage: "APPLIED" });
            }}
          />
        )}

        {/* Contextual links */}
        {primarySkill && (
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-3">Explore more</h2>
            <div className="flex flex-col gap-2">
              <Link
                href={`/jobs?q=${encodeURIComponent(primarySkill)}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                🔍 See all {primarySkill} jobs
              </Link>
              <Link
                href={`/market/salaries?role=${encodeURIComponent(primarySkill)}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                💰 View {primarySkill} salary data
              </Link>
              <Link
                href={`/market/demand?skill=${encodeURIComponent(primarySkill)}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                📈 View {primarySkill} demand trend
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
