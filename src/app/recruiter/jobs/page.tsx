"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  city: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  isActive: boolean;
  isClosed: boolean;
  createdAt: string;
  category: string[];
  skills: string[];
}

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recruiter/jobs")
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
      }
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Job Posts</h1>
          <p className="mt-0.5 text-sm text-gray-400">{jobs.length} total posts</p>
        </div>
        <Link
          href="/recruiter/jobs/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          + Post a Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900 py-20">
          <p className="text-gray-400">No job posts yet.</p>
          <Link
            href="/recruiter/jobs/new"
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-white/10 bg-gray-900 px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-white truncate">{job.title}</h2>
                  {job.isClosed ? (
                    <span className="rounded-full bg-red-900/40 px-2 py-0.5 text-xs text-red-400">Closed</span>
                  ) : (
                    <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-400">Active</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {job.city} · {job.jobType.replace("_", " ")} · {job.experienceLevel}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  PKR {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => router.push(`/recruiter/jobs/${job.id}/edit`)}
                  disabled={job.isClosed}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Edit
                </button>

                {confirmDeleteId === job.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Sure?</span>
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={deletingId === job.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === job.id ? "…" : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(job.id)}
                    disabled={job.isClosed}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50" onClick={() => setConfirmDeleteId(null)} />
      )}
    </div>
  );
}
