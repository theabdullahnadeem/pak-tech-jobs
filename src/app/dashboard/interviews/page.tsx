"use client";

import { useEffect, useState } from "react";

interface Interview {
  id: string;
  applicationId: string;
  proposedSlots: string[];
  confirmedSlot: string | null;
  status: string;
  meetingLink: string | null;
  notes: string | null;
  createdAt: string;
  recruiter: { id: string; name: string; companyName: string | null };
  applicant: { id: string; name: string; email: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-900/40 text-amber-400",
  CONFIRMED: "bg-emerald-900/40 text-emerald-400",
  DECLINED: "bg-red-900/40 text-red-400",
  CANCELLED: "bg-gray-800 text-gray-500",
  COMPLETED: "bg-blue-900/40 text-blue-400",
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/interviews")
      .then(r => r.json())
      .then(data => setInterviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (interviewId: string, slot: string) => {
    setConfirming(interviewId);
    const res = await fetch(`/api/interviews/${interviewId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmedSlot: slot }),
    });
    if (res.ok) {
      setInterviews(prev => prev.map(i =>
        i.id === interviewId ? { ...i, confirmedSlot: slot, status: "CONFIRMED" } : i
      ));
    }
    setConfirming(null);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Interviews</h1>
        <p className="mt-1 text-sm text-gray-400">
          {interviews.length === 0 ? "No invitations yet" : `${interviews.length} invitation${interviews.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900 py-16 px-4 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-400">No interview invitations yet</p>
          <p className="text-xs text-gray-500 mt-1">When a recruiter invites you, you&apos;ll see it here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map(interview => (
            <div key={interview.id} className="rounded-xl border border-white/10 bg-gray-900 p-4 sm:p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {interview.recruiter.companyName || interview.recruiter.name}
                  </p>
                  {interview.notes && (
                    <p className="mt-1 text-xs text-gray-400 leading-relaxed">{interview.notes}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[interview.status] || "bg-gray-800 text-gray-400"}`}>
                  {interview.status}
                </span>
              </div>

              {/* Confirmed slot */}
              {interview.confirmedSlot ? (
                <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/20 px-3 py-2.5">
                  <p className="text-sm text-emerald-400 font-medium">
                    ✓ {new Date(interview.confirmedSlot).toLocaleString()}
                  </p>
                  {interview.meetingLink && (
                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-emerald-400 underline hover:text-emerald-300">
                      Join Meeting →
                    </a>
                  )}
                </div>
              ) : interview.status === "PENDING" ? (
                <div>
                  <p className="mb-2 text-xs text-gray-400 font-medium">Select a time slot:</p>
                  {/* Slots wrap on mobile */}
                  <div className="flex flex-wrap gap-2">
                    {interview.proposedSlots.map(slot => (
                      <button key={slot}
                        onClick={() => handleConfirm(interview.id, slot)}
                        disabled={confirming === interview.id}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-950/10 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-950/30 disabled:opacity-50 transition-colors text-left">
                        {new Date(slot).toLocaleString(undefined, {
                          weekday: "short", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
