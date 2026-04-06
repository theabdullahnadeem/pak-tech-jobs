"use client";

import { useEffect, useState } from "react";

type PipelineStage = "APPLIED" | "SEEN" | "SHORTLISTED" | "INTERVIEW" | "OFFER" | "REJECTED" | "EXPIRED";

interface ApplicationDetail {
  id: string;
  stage: PipelineStage;
  submittedAt: string;
  recruiterNotes: string | null;
  rejectionReason: string | null;
  applicantName: string | null;
  applicantEmail: string | null;
  applicantPhone: string | null;
  yearsOfExperience: number | null;
  coverLetter: string | null;
  cvPublicId: string | null;
  cvFileName: string | null;
  jobPost: { id: string; title: string; recruiterId: string };
  applicant: {
    id: string;
    name: string;
    email: string;
    skills: string[];
    experienceLevel: string | null;
    location: string | null;
  };
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  APPLIED: "Applied",
  SEEN: "Seen",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

const STAGE_COLORS: Record<PipelineStage, string> = {
  APPLIED: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  SEEN: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  SHORTLISTED: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  INTERVIEW: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  OFFER: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
  EXPIRED: "text-gray-500 bg-gray-500/10 border-gray-500/20",
};

interface Props {
  applicationId: string;
  onClose: () => void;
  onStageChange: (id: string, newStage: PipelineStage) => void;
}

// ── CV Viewer Modal ────────────────────────────────────────────────────────────

function CVViewerModal({ url, fileName, onClose }: { url: string; fileName: string; onClose: () => void }) {
  const isPdf = fileName.toLowerCase().endsWith(".pdf");
  // For DOC/DOCX use Google Docs viewer; for PDF use native iframe
  const viewerUrl = isPdf
    ? url
    : `https://docs.google.com/gviewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-gray-900 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <span className="text-sm font-medium text-white truncate max-w-xs">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 transition-colors"
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white text-2xl leading-none transition-colors ml-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 bg-gray-950">
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title={fileName}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────

export default function ApplicationDetailPanel({ applicationId, onClose, onStageChange }: Props) {
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState("");
  const [cvViewerUrl, setCvViewerUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/applications/${applicationId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setApp(data as ApplicationDetail);
        setNotes(data.recruiterNotes ?? "");
      })
      .catch(() => setError("Failed to load application"))
      .finally(() => setLoading(false));
  }, [applicationId]);

  async function handleNotesBlur() {
    if (!app) return;
    setNotesSaving(true);
    try {
      await fetch(`/api/applications/${applicationId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
    } finally {
      setNotesSaving(false);
    }
  }

  async function handleViewCV() {
    if (!app?.cvPublicId) return;
    setCvLoading(true);
    setCvError("");
    try {
      const res = await fetch(`/api/upload/cv-url?publicId=${encodeURIComponent(app.cvPublicId)}`);
      const data = await res.json();
      if (!res.ok || !data.url) { setCvError("Unable to load CV"); return; }
      setCvViewerUrl(data.url);
    } catch {
      setCvError("Unable to load CV");
    } finally {
      setCvLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Panel */}
        <div className="relative w-full max-w-md bg-gray-900 border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <h2 className="text-base font-semibold text-white">Applicant Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none transition-colors">×</button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="h-7 w-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-950/40 border border-red-500/30 px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            {app && !loading && (
              <>
                {/* Stage badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STAGE_COLORS[app.stage]}`}>
                    {STAGE_LABELS[app.stage]}
                  </span>
                  <span className="text-xs text-gray-500">
                    Applied {new Date(app.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Applicant info */}
                <Section title="Applicant Information">
                  <InfoRow label="Name" value={app.applicantName ?? app.applicant.name} />
                  <InfoRow label="Email" value={app.applicantEmail ?? app.applicant.email} />
                  {app.applicantPhone && <InfoRow label="Phone" value={app.applicantPhone} />}
                  {app.yearsOfExperience != null && <InfoRow label="Experience" value={`${app.yearsOfExperience} year${app.yearsOfExperience !== 1 ? "s" : ""}`} />}
                  {app.applicant.location && <InfoRow label="Location" value={app.applicant.location} />}
                  {app.applicant.experienceLevel && <InfoRow label="Level" value={app.applicant.experienceLevel} />}
                </Section>

                {/* Skills */}
                {app.applicant.skills.length > 0 && (
                  <Section title="Skills">
                    <div className="flex flex-wrap gap-1.5">
                      {app.applicant.skills.map(s => (
                        <span key={s} className="rounded-full bg-emerald-900/30 px-2.5 py-0.5 text-xs text-emerald-400">{s}</span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Cover letter */}
                {app.coverLetter && (
                  <Section title="Cover Letter">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{app.coverLetter}</p>
                  </Section>
                )}

                {/* CV */}
                {app.cvPublicId && (
                  <Section title="CV / Resume">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📄</span>
                      <span className="text-sm text-gray-300 truncate flex-1">{app.cvFileName ?? "Resume"}</span>
                      <button
                        onClick={handleViewCV}
                        disabled={cvLoading}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shrink-0"
                      >
                        {cvLoading ? "Loading…" : "View CV"}
                      </button>
                    </div>
                    {cvError && <p className="mt-1 text-xs text-red-400">{cvError}</p>}
                  </Section>
                )}

                {/* Recruiter notes */}
                <Section title="Recruiter Notes">
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    rows={3}
                    placeholder="Add internal notes about this applicant…"
                    className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                  {notesSaving && <p className="text-xs text-gray-500 mt-1">Saving…</p>}
                </Section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CV Viewer Modal — rendered outside the panel so it's full screen */}
      {cvViewerUrl && app && (
        <CVViewerModal
          url={cvViewerUrl}
          fileName={app.cvFileName ?? "resume.pdf"}
          onClose={() => setCvViewerUrl(null)}
        />
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="rounded-xl border border-white/8 bg-gray-800/50 px-4 py-3 space-y-2">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-gray-500 shrink-0 w-20">{label}</span>
      <span className="text-gray-200 break-all">{value}</span>
    </div>
  );
}
