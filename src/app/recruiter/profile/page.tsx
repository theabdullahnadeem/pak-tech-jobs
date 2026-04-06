"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RecruiterProfile {
  id: string;
  name: string;
  companyName: string | null;
  businessEmail: string | null;
  recruiterVerified: boolean;
  responseRate: number;
  avgResponseTimeHours: number | null;
}

type BadgeTier = "high" | "mid" | "low";

function getBadge(rate: number): { tier: BadgeTier; label: string } {
  if (rate >= 90) return { tier: "high", label: "Highly Responsive" };
  if (rate >= 70) return { tier: "mid", label: "Responsive" };
  return { tier: "low", label: "Low Responsiveness" };
}

const BADGE_STYLES: Record<BadgeTier, string> = {
  high: "bg-emerald-100 text-emerald-800 border-emerald-200",
  mid: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-red-100 text-red-800 border-red-200",
};

export default function RecruiterProfilePage() {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data: RecruiterProfile) => setProfile(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-red-600">{error ?? "Profile not found"}</p>
      </div>
    );
  }

  const badge = getBadge(profile.responseRate);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
              {profile.companyName && (
                <p className="text-sm text-gray-600 mt-0.5">{profile.companyName}</p>
              )}
              {profile.businessEmail && (
                <p className="text-sm text-gray-500 mt-0.5">{profile.businessEmail}</p>
              )}
            </div>
            {profile.recruiterVerified && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                ✓ Verified Company
              </span>
            )}
          </div>
        </div>

        {/* Response metrics card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Response Metrics
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <span
              className={[
                "inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium",
                BADGE_STYLES[badge.tier],
              ].join(" ")}
            >
              {badge.label}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {Math.round(profile.responseRate)}%
            </span>
          </div>

          <div className="text-sm text-gray-600">
            {profile.avgResponseTimeHours !== null ? (
              <p>
                Average response time:{" "}
                <span className="font-medium text-gray-900">
                  {profile.avgResponseTimeHours < 24
                    ? `${Math.round(profile.avgResponseTimeHours)}h`
                    : `${Math.round(profile.avgResponseTimeHours / 24)}d`}
                </span>
              </p>
            ) : (
              <p className="text-gray-400">No applications responded to yet</p>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            <Link
              href="/recruiter/jobs/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors w-fit"
            >
              + Post a New Job
            </Link>
            <Link
              href="/recruiter/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors w-fit"
            >
              View Pipeline Dashboard
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
