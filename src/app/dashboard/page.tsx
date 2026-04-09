"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type PipelineStage =
  | "APPLIED"
  | "SEEN"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "EXPIRED";

type RejectionReason =
  | "PORTFOLIO_GAP"
  | "SALARY_MISMATCH"
  | "SPECIFIC_SKILL_MISSING"
  | "ROLE_FILLED"
  | "OVERQUALIFIED";

interface Application {
  id: string;
  stage: PipelineStage;
  submittedAt: string;
  updatedAt: string;
  rejectionReason: RejectionReason | null;
  recruiterNotes: string | null;
  jobPost: {
    id: string;
    title: string;
    city: string;
    location: string;
    jobType: string;
    recruiter: {
      id: string;
      name: string;
      companyName: string | null;
      responseRate: number;
      avgResponseTimeHours: number | null;
      recruiterVerified: boolean;
    };
  };
}

interface UserProfile {
  id: string;
  name: string;
  skills: string[];
  experienceLevel: string | null;
  targetRoles: string[];
  openToOpportunities: boolean;
}

interface DemandSkill {
  skill: string;
  count: number;
}

// ─── Rejection reason labels ──────────────────────────────────────────────────

const REJECTION_REASON_LABEL: Record<RejectionReason, string> = {
  PORTFOLIO_GAP: "Portfolio Gap",
  SALARY_MISMATCH: "Salary Mismatch",
  SPECIFIC_SKILL_MISSING: "Specific Skill Missing",
  ROLE_FILLED: "Role Filled",
  OVERQUALIFIED: "Overqualified",
};

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGE_LABEL: Record<PipelineStage, string> = {
  APPLIED: "Applied",
  SEEN: "Seen",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview Scheduled",
  OFFER: "Offer Received",
  REJECTED: "Feedback Received",
  EXPIRED: "Expired",
};

const STAGE_CLASSES: Record<PipelineStage, string> = {
  APPLIED:
    "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  SEEN:
    "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  SHORTLISTED:
    "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  INTERVIEW:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  OFFER:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  REJECTED:
    "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  EXPIRED:
    "bg-red-500/10 text-red-400 border border-red-500/20",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated 1 day ago";
  return `Updated ${days} days ago`;
}

function ResponseRateBadge({ rate }: { rate: number }) {
  const rounded = Math.round(rate);
  if (rounded >= 90) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        ✓ {rounded}% Highly Responsive
      </span>
    );
  }
  if (rounded >= 70) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        ~ {rounded}% Responsive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
      ⚠ {rounded}% Low Responsiveness
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-6 animate-pulse space-y-3">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-surface dark:bg-surface-dark" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-surface dark:bg-surface-dark" />
          <div className="h-3 w-1/3 rounded bg-surface dark:bg-surface-dark" />
        </div>
      </div>
      <div className="h-6 w-28 rounded-full bg-surface dark:bg-surface-dark" />
      <div className="h-3 w-40 rounded bg-surface dark:bg-surface-dark" />
    </div>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({ app }: { app: Application }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { jobPost } = app;
  if (!jobPost || !jobPost.recruiter) return null;
  const companyName = jobPost.recruiter.companyName ?? jobPost.recruiter.name;
  const isRemote =
    jobPost.jobType === "REMOTE" ||
    jobPost.location.toLowerCase().includes("remote");
  const showFeedback =
    app.stage === "REJECTED" && app.rejectionReason != null;

  return (
    <div className="rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-6 transition-all duration-200 hover:shadow-lg hover:border-primary/40">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-11 h-11 flex-shrink-0 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark flex items-center justify-center">
          <span className="text-lg font-bold text-muted">
            {companyName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">
            {jobPost.title}
          </h3>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-sm text-muted mt-0.5">
            <span className="font-medium">
              {companyName}
              {jobPost.recruiter.recruiterVerified && (
                <span className="ml-1 text-blue-400" title="Verified Company">
                  ✓
                </span>
              )}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className={isRemote ? "text-emerald-400" : ""}>
              {isRemote ? "🌍 Remote" : `📍 ${jobPost.city}`}
            </span>
          </div>
        </div>
      </div>

      {/* Stage badge */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STAGE_CLASSES[app.stage]}`}
        >
          {STAGE_LABEL[app.stage]}
        </span>
        <span className="text-xs text-muted">{timeAgo(app.updatedAt)}</span>
      </div>

      {/* Response rate */}
      <ResponseRateBadge rate={jobPost.recruiter.responseRate} />

      {/* Rejection feedback — Requirement 7.4 */}
      {showFeedback && (
        <div className="mt-4 border-t border-border dark:border-border-dark pt-3">
          <button
            onClick={() => setFeedbackOpen((o) => !o)}
            className="flex items-center gap-2 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
          >
            <span>{feedbackOpen ? "▾" : "▸"}</span>
            Feedback
          </button>
          {feedbackOpen && (
            <div className="mt-2 rounded-xl bg-orange-500/5 border border-orange-500/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">Reason:</span>
                <span className="font-semibold text-orange-300">
                  {REJECTION_REASON_LABEL[app.rejectionReason!]}
                </span>
              </div>
              {app.recruiterNotes && (
                <div className="text-sm text-muted">
                  <span className="font-medium text-foreground">Notes: </span>
                  {app.recruiterNotes}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skill Gap Report ─────────────────────────────────────────────────────────
// Requirement 7.5

function SkillGapReport() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topSkills, setTopSkills] = useState<DemandSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/demand?timeRange=30").then((r) => r.json()),
    ])
      .then(([profileData, demandData]) => {
        if (profileData && !profileData.error) {
          setProfile(profileData as UserProfile);
        }
        if (demandData?.mode === "snapshot" && Array.isArray(demandData.data)) {
          setTopSkills((demandData.data as DemandSkill[]).slice(0, 10));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-6 animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-surface dark:bg-surface-dark" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-surface dark:bg-surface-dark" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile || topSkills.length === 0) return null;

  const userSkillsLower = new Set(
    profile.skills.map((s) => s.toLowerCase())
  );
  const matchCount = topSkills.filter((s) =>
    userSkillsLower.has(s.skill.toLowerCase())
  ).length;

  return (
    <div className="rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-6">
      <h2 className="text-lg font-semibold mb-1">Skill Gap Report</h2>
      <p className="text-sm text-muted mb-4">
        You have{" "}
        <span className="font-semibold text-foreground">
          {matchCount} of {topSkills.length}
        </span>{" "}
        top demanded skills
      </p>
      <ul className="space-y-2">
        {topSkills.map((item) => {
          const has = userSkillsLower.has(item.skill.toLowerCase());
          return (
            <li
              key={item.skill}
              className="flex items-center justify-between rounded-lg px-4 py-2.5 bg-surface dark:bg-surface-dark"
            >
              <span className="text-sm font-medium">{item.skill}</span>
              {has ? (
                <span className="text-emerald-400 text-sm font-semibold">✓ Have it</span>
              ) : (
                <span className="text-red-400 text-sm font-semibold">✗ Gap</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; stage: string } | null>(null);
  const [socketConnected, setSocketConnected] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  // Fetch applications on mount
  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((data: Application[]) => {
        if (Array.isArray(data)) setApplications(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Socket.io: real-time stage updates
  useEffect(() => {
    if (!session?.user) return;

    const socket = io(window.location.origin, { path: "/api/socketio" });
    socketRef.current = socket;

    socket.on(
      "application:stage_changed",
      ({ applicationId, newStage, jobTitle }: { applicationId: string; newStage: PipelineStage; jobTitle?: string }) => {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? { ...app, stage: newStage, updatedAt: new Date().toISOString() }
              : app
          )
        );
        if (jobTitle) {
          setToast({ message: jobTitle, stage: newStage });
          setTimeout(() => setToast(null), 5000);
        }
      }
    );

    socket.on("connect", () => {
      setSocketConnected(true);
      // Reconcile missed events on reconnect
      fetch("/api/applications")
        .then(r => r.json())
        .then((data: Application[]) => { if (Array.isArray(data)) setApplications(data); })
        .catch(() => {});
    });
    socket.on("disconnect", () => setSocketConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user]);

  const userName = session?.user?.name ?? "there";

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            My Applications
          </h1>
          <p className="text-muted mt-1">
            Hey {userName} — here&apos;s where all your applications stand.
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/dashboard/saved-jobs"
            className="rounded-lg border border-border dark:border-border-dark px-4 py-2 text-sm font-medium text-muted hover:bg-surface dark:hover:bg-surface-dark transition-colors"
          >
            🔖 Saved Jobs
          </Link>
          <Link
            href="/dashboard/job-alerts"
            className="rounded-lg border border-border dark:border-border-dark px-4 py-2 text-sm font-medium text-muted hover:bg-surface dark:hover:bg-surface-dark transition-colors"
          >
            🔔 Job Alerts
          </Link>
          <Link
            href="/dashboard/interviews"
            className="rounded-lg border border-border dark:border-border-dark px-4 py-2 text-sm font-medium text-muted hover:bg-surface dark:hover:bg-surface-dark transition-colors"
          >
            📅 Interviews
          </Link>
          <Link
            href="/dashboard/analytics"
            className="rounded-lg border border-border dark:border-border-dark px-4 py-2 text-sm font-medium text-muted hover:bg-surface dark:hover:bg-surface-dark transition-colors"
          >
            📊 Analytics
          </Link>
        </nav>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-24 text-muted">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-medium">No applications yet</p>
            <p className="text-sm mt-2">
              Browse{" "}
              <a href="/jobs" className="text-primary hover:underline">
                open roles
              </a>{" "}
              and apply to get started.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-5">
              {applications.length} application{applications.length !== 1 ? "s" : ""}
              {" "}· stages update in real time
              <span className="inline-flex items-center gap-1 ml-2 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </p>
            {!socketConnected && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 text-sm text-yellow-400">
                <span>⚠</span>
                <span>Real-time updates paused — reconnecting…</span>
              </div>
            )}
            <div className="space-y-4">
              {applications.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          </>
        )}

        {/* Skill Gap Report — always shown for applicants */}
        <div className="mt-10">
          <SkillGapReport />
        </div>

        {/* Stage change toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 border border-white/10 px-5 py-3.5 shadow-2xl max-w-sm">
            <p className="text-xs text-gray-400 mb-0.5">Application status updated</p>
            <p className="text-sm font-medium text-white">{toast.message}</p>
            <p className="text-xs text-emerald-400 mt-0.5">→ {toast.stage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
