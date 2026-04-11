"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobSearchBar from "@/components/JobSearchBar";

interface Job {
  id: string;
  title: string;
  city: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  createdAt: string;
  recruiter: {
    id: string;
    name: string;
    companyName: string | null;
    recruiterVerified: boolean;
    responseRate: number;
  };
}

interface CategoryJobsPageProps {
  title: string;
  description: string;
  apiParams: string;
  initialLocation?: string;
  seoText: string;
  seoHeading: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function CategoryJobsPage({
  title,
  description,
  apiParams,
  initialLocation,
  seoText,
  seoHeading,
}: CategoryJobsPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs?${apiParams}`)
      .then(r => r.json())
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [apiParams]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="bg-gradient-to-r from-primary/90 to-primary/70 rounded-3xl p-8 md:p-14 mb-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{title}</h1>
            <p className="text-base md:text-lg text-white/85 mb-8">{description}</p>
            <JobSearchBar initialLocation={initialLocation} />
          </div>
        </div>

        {/* Job count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {loading ? "Loading jobs…" : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
          </h2>
          <Link href="/jobs" className="text-sm text-primary hover:underline">
            Browse all jobs →
          </Link>
        </div>

        {/* Jobs list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-surface dark:bg-surface-dark animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 border border-border dark:border-border-dark rounded-2xl bg-surface dark:bg-surface-dark">
            <span className="text-5xl block mb-4">🕵️</span>
            <h3 className="text-xl font-bold mb-2">No jobs yet</h3>
            <p className="text-muted mb-4">No recruiter has posted in this category yet. Check back soon.</p>
            <Link href="/jobs" className="inline-block px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              Browse All Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => {
              const company = job.recruiter.companyName || job.recruiter.name;
              const isRemote = job.jobType === "REMOTE" || job.location?.toLowerCase().includes("remote");
              return (
                <Link key={job.id} href={`/jobs/${job.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200">
                  {/* Company avatar */}
                  <div className="w-11 h-11 shrink-0 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark flex items-center justify-center text-lg font-bold text-muted">
                    {company.charAt(0)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {job.title}
                        {job.recruiter.recruiterVerified && (
                          <span className="ml-1.5 text-blue-400 text-xs">✓</span>
                        )}
                      </h3>
                      <span className="text-xs text-muted shrink-0">{timeAgo(job.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted mt-0.5">
                      {company}
                      <span className="mx-1.5 opacity-40">·</span>
                      <span className={isRemote ? "text-emerald-500" : ""}>{isRemote ? "🌍 Remote" : `📍 ${job.city}`}</span>
                      <span className="mx-1.5 opacity-40">·</span>
                      PKR {job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.slice(0, 4).map(s => (
                        <span key={s} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">{s}</span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="rounded-full bg-surface dark:bg-surface-dark text-muted px-2 py-0.5 text-xs">+{job.skills.length - 4}</span>
                      )}
                    </div>
                  </div>
                  <span className="hidden sm:block text-primary text-lg group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* SEO text */}
        <div className="mt-16 bg-surface dark:bg-surface-dark p-8 rounded-2xl border border-border dark:border-border-dark text-sm text-muted">
          <h2 className="text-lg font-bold text-foreground mb-3">{seoHeading}</h2>
          <p>{seoText}</p>
        </div>
      </div>
    </div>
  );
}
