"use client";

import { useState } from "react";

type Tab = "generate" | "rank" | "match";

export default function RecruiterAIToolsPage() {
  const [tab, setTab] = useState<Tab>("generate");

  // Generate job description
  const [genTitle, setGenTitle] = useState("");
  const [genSkills, setGenSkills] = useState("");
  const [genLevel, setGenLevel] = useState("");
  const [genType, setGenType] = useState("");
  const [genCity, setGenCity] = useState("");
  const [genResult, setGenResult] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  // Rank candidates
  const [rankJobId, setRankJobId] = useState("");
  const [rankResult, setRankResult] = useState<{ applicationId: string; score: number; reason: string }[]>([]);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState("");

  // Match resume
  const [matchResume, setMatchResume] = useState("");
  const [matchJobId, setMatchJobId] = useState("");
  const [matchResult, setMatchResult] = useState<{
    matchScore: number; matchLevel: string; matchingSkills: string[];
    missingSkills: string[]; strengths: string[]; gaps: string[]; recommendation: string;
  } | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true); setGenResult("");
    const res = await fetch("/api/ai/generate-job-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: genTitle,
        skills: genSkills.split(",").map(s => s.trim()).filter(Boolean),
        experienceLevel: genLevel || undefined,
        jobType: genType || undefined,
        city: genCity || undefined,
      }),
    });
    const data = await res.json();
    setGenResult(data.description || data.error || "Failed");
    setGenLoading(false);
  };

  const handleRank = async (e: React.FormEvent) => {
    e.preventDefault();
    setRankLoading(true); setRankResult([]); setRankError("");
    const res = await fetch("/api/ai/rank-candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobPostId: rankJobId }),
    });
    const data = await res.json();
    if (data.error) setRankError(data.error);
    else setRankResult(data.rankings || []);
    setRankLoading(false);
  };

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMatchLoading(true); setMatchResult(null); setMatchError("");
    const res = await fetch("/api/ai/match-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText: matchResume, jobPostId: matchJobId }),
    });
    const data = await res.json();
    if (data.error) setMatchError(data.error);
    else setMatchResult(data);
    setMatchLoading(false);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "generate", label: "Generate Description", icon: "✍️" },
    { id: "rank", label: "Rank Candidates", icon: "🏆" },
    { id: "match", label: "Match Resume", icon: "🎯" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">AI Recruiting Tools</h1>
        <p className="mt-1 text-sm text-gray-400">Powered by Gemini AI</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10 pb-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? "border-emerald-500 text-emerald-400" : "border-transparent text-gray-400 hover:text-gray-300"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Generate Job Description */}
      {tab === "generate" && (
        <div className="max-w-2xl">
          <form onSubmit={handleGenerate} className="space-y-4 rounded-xl border border-white/10 bg-gray-900 p-5">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Job Title *</label>
              <input value={genTitle} onChange={e => setGenTitle(e.target.value)} placeholder="Senior React Developer"
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Required Skills (comma-separated)</label>
              <input value={genSkills} onChange={e => setGenSkills(e.target.value)} placeholder="React, TypeScript, Node.js"
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Level</label>
                <select value={genLevel} onChange={e => setGenLevel(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                  <option value="">Any</option>
                  {["JUNIOR","MID","SENIOR","LEAD"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select value={genType} onChange={e => setGenType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                  <option value="">Any</option>
                  {["FULL_TIME","REMOTE","CONTRACT","INTERNSHIP","PART_TIME"].map(t => <option key={t} value={t}>{t.replace("_"," ")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">City</label>
                <input value={genCity} onChange={e => setGenCity(e.target.value)} placeholder="Lahore"
                  className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
            <button type="submit" disabled={genLoading || !genTitle.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {genLoading ? "Generating…" : "✨ Generate Description"}
            </button>
          </form>
          {genResult && (
            <div className="mt-4 rounded-xl border border-white/10 bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Generated Description</h3>
                <button onClick={() => navigator.clipboard.writeText(genResult)}
                  className="text-xs text-emerald-400 hover:text-emerald-300">Copy</button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{genResult}</pre>
            </div>
          )}
        </div>
      )}

      {/* Rank Candidates */}
      {tab === "rank" && (
        <div className="max-w-2xl">
          <form onSubmit={handleRank} className="space-y-4 rounded-xl border border-white/10 bg-gray-900 p-5">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Job Post ID *</label>
              <input value={rankJobId} onChange={e => setRankJobId(e.target.value)} placeholder="Enter job post ID"
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              <p className="mt-1 text-xs text-gray-500">Ranks all APPLIED/SEEN candidates for this job</p>
            </div>
            <button type="submit" disabled={rankLoading || !rankJobId.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {rankLoading ? "Ranking…" : "🏆 Rank Candidates"}
            </button>
          </form>
          {rankError && <p className="mt-3 text-sm text-red-400">{rankError}</p>}
          {rankResult.length > 0 && (
            <div className="mt-4 space-y-2">
              {rankResult.map((r, i) => (
                <div key={r.applicationId} className="rounded-xl border border-white/10 bg-gray-900 px-4 py-3 flex items-start gap-3">
                  <span className="text-lg font-bold text-gray-500 w-6 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono truncate">{r.applicationId}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${r.score >= 80 ? "bg-emerald-900/40 text-emerald-400" : r.score >= 60 ? "bg-amber-900/40 text-amber-400" : "bg-red-900/40 text-red-400"}`}>
                        {r.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{r.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Match Resume */}
      {tab === "match" && (
        <div className="max-w-2xl">
          <form onSubmit={handleMatch} className="space-y-4 rounded-xl border border-white/10 bg-gray-900 p-5">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Job Post ID *</label>
              <input value={matchJobId} onChange={e => setMatchJobId(e.target.value)} placeholder="Enter job post ID"
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Resume Text *</label>
              <textarea value={matchResume} onChange={e => setMatchResume(e.target.value)} rows={8}
                placeholder="Paste the candidate's resume text here…"
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none resize-y" />
            </div>
            <button type="submit" disabled={matchLoading || !matchJobId.trim() || matchResume.trim().length < 50}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {matchLoading ? "Analyzing…" : "🎯 Analyze Match"}
            </button>
          </form>
          {matchError && <p className="mt-3 text-sm text-red-400">{matchError}</p>}
          {matchResult && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-white/10 bg-gray-900 p-4 flex items-center gap-4">
                <div className={`text-3xl font-bold ${matchResult.matchScore >= 80 ? "text-emerald-400" : matchResult.matchScore >= 60 ? "text-amber-400" : "text-red-400"}`}>
                  {matchResult.matchScore}%
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{matchResult.matchLevel} Match</p>
                  <p className="text-xs text-gray-400">{matchResult.recommendation}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
                  <p className="text-xs font-semibold text-emerald-400 mb-2">Matching Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.matchingSkills.map(s => <span key={s} className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-400">{s}</span>)}
                  </div>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3">
                  <p className="text-xs font-semibold text-red-400 mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.missingSkills.map(s => <span key={s} className="rounded-full bg-red-900/40 px-2 py-0.5 text-xs text-red-400">{s}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
