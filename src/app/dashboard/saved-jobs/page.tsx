"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SavedJob {
  id: string;
  savedAt: string;
  jobPost: {
    id: string;
    title: string;
    city: string;
    jobType: string;
    experienceLevel: string;
    salaryMin: number;
    salaryMax: number;
    isActive: boolean;
    isClosed: boolean;
    skills: string[];
    recruiter: { id: string; name: string; companyName: string | null };
  };
}

export default function SavedJobsPage() {
  const [saved, setSaved] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/saved-jobs")
      .then(r => r.json())
      .then(data => setSaved(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobPostId: string) => {
    setRemoving(jobPostId);
    await fetch(`/api/saved-jobs?jobPostId=${jobPostId}`, { method: "DELETE" });
    setSaved(prev => prev.filter(s => s.jobPost.id !== jobPostId));
    setRemoving(null);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Saved Jobs</h1>
        <p className="mt-1 text-sm text-gray-400">{saved.length} saved</p>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900 py-20">
          <p className="text-4xl mb-3">🔖</p>
          <p className="text-gray-400">No saved jobs yet</p>
          <Link href="/jobs" className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map(item => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-gray-900 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/jobs/${item.jobPost.id}`} className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors">
                      {item.jobPost.title}
                    </Link>
                    {item.jobPost.isClosed && (
                      <span className="rounded-full bg-red-900/40 px-2 py-0.5 text-xs text-red-400">Closed</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {item.jobPost.recruiter.companyName || item.jobPost.recruiter.name} · {item.jobPost.city} · {item.jobPost.jobType.replace("_", " ")}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    PKR {item.jobPost.salaryMin.toLocaleString()} – {item.jobPost.salaryMax.toLocaleString()}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.jobPost.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-400">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!item.jobPost.isClosed && (
                    <Link href={`/jobs/${item.jobPost.id}`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                      Apply
                    </Link>
                  )}
                  <button
                    onClick={() => handleUnsave(item.jobPost.id)}
                    disabled={removing === item.jobPost.id}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 disabled:opacity-50 transition-colors">
                    {removing === item.jobPost.id ? "…" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
