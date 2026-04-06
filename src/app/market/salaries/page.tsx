"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExperienceLevel = "JUNIOR" | "MID" | "SENIOR" | "LEAD";
type EmploymentType = "FULL_TIME" | "REMOTE" | "CONTRACT" | "INTERNSHIP" | "PART_TIME";

interface SalaryResult {
  roleTitle: string;
  experienceLevel: ExperienceLevel;
  city: string;
  min: number;
  median: number;
  max: number;
  count: number;
  insufficientData?: never;
}

interface InsufficientResult {
  roleTitle: string;
  experienceLevel: ExperienceLevel;
  city: string;
  insufficientData: true;
  min?: never;
}

type SalaryEntry = SalaryResult | InsufficientResult;

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Mid" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
];

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "REMOTE", label: "Remote" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "PART_TIME", label: "Part-time" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return String(amount);
}

function expLabel(level: ExperienceLevel): string {
  return EXPERIENCE_LEVELS.find((e) => e.value === level)?.label ?? level;
}

// ─── Salary Range Bar ─────────────────────────────────────────────────────────

function SalaryRangeBar({ min, median, max }: { min: number; median: number; max: number }) {
  const range = max - min || 1;
  const medianPct = ((median - min) / range) * 100;

  return (
    <div className="mt-3">
      <div className="relative h-2 rounded-full bg-surface dark:bg-surface-dark overflow-visible">
        {/* Full range bar */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20" />
        {/* Median marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow"
          style={{ left: `calc(${medianPct}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-muted">
        <span>{formatSalary(min)}</span>
        <span className="text-emerald-400 font-medium">~{formatSalary(median)} median</span>
        <span>{formatSalary(max)}</span>
      </div>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ entry }: { entry: SalaryEntry }) {
  return (
    <div className="rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-sm">{entry.roleTitle}</h3>
          <p className="text-xs text-muted mt-0.5">
            {expLabel(entry.experienceLevel)} · {entry.city}
          </p>
        </div>
        {!entry.insufficientData && (
          <span className="text-xs text-muted bg-surface dark:bg-surface-dark px-2 py-1 rounded-lg">
            {(entry as SalaryResult).count} verified {(entry as SalaryResult).count === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      {entry.insufficientData ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <span>⚠</span>
          <span>Insufficient data — fewer than 3 verified entries for this combination</span>
        </div>
      ) : (
        <SalaryRangeBar
          min={(entry as SalaryResult).min}
          median={(entry as SalaryResult).median}
          max={(entry as SalaryResult).max}
        />
      )}

      <div className="mt-3">
        <Link
          href={`/jobs?q=${encodeURIComponent(entry.roleTitle)}`}
          className="text-xs text-muted hover:text-primary transition-colors"
        >
          View jobs for this role →
        </Link>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-5 animate-pulse">
      <div className="h-4 w-40 rounded bg-surface dark:bg-surface-dark mb-2" />
      <div className="h-3 w-24 rounded bg-surface dark:bg-surface-dark mb-4" />
      <div className="h-2 rounded-full bg-surface dark:bg-surface-dark" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalariesPage() {
  // Search state
  const [role, setRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [city, setCity] = useState("");
  const [techStack, setTechStack] = useState("");

  // Results state
  const [results, setResults] = useState<SalaryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Submission form state
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    roleTitle: "",
    experienceLevel: "" as ExperienceLevel | "",
    city: "",
    salaryAmount: "",
    employmentType: "" as EmploymentType | "",
    techStack: "",
    evidenceUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  // ── Search ──────────────────────────────────────────────────────────────────

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearchError("");
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (role.trim()) params.set("role", role.trim());
      if (experienceLevel) params.set("experienceLevel", experienceLevel);
      if (city.trim()) params.set("city", city.trim());
      if (techStack.trim()) params.set("techStack", techStack.trim());

      const res = await fetch(`/api/salaries?${params}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to fetch salary data");
      }
      const data: SalaryEntry[] = await res.json();
      setResults(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ── Submit salary ───────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const techStackArr = form.techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const body: Record<string, unknown> = {
        roleTitle: form.roleTitle.trim(),
        experienceLevel: form.experienceLevel,
        city: form.city.trim(),
        salaryAmount: Number(form.salaryAmount),
        employmentType: form.employmentType,
        techStack: techStackArr,
      };
      if (form.evidenceUrl.trim()) body.evidenceUrl = form.evidenceUrl.trim();

      const res = await fetch("/api/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Submission failed");
      }

      setSubmitStatus("success");
      setSubmitMessage(
        form.evidenceUrl.trim()
          ? "Salary submitted and queued for verification. Thanks for contributing!"
          : "Salary submitted successfully. Thanks for contributing!"
      );
      setForm({
        roleTitle: "",
        experienceLevel: "",
        city: "",
        salaryAmount: "",
        employmentType: "",
        techStack: "",
        evidenceUrl: "",
      });
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Salary Database</h1>
          <p className="text-muted mt-1 text-sm">
            Crowdsourced, verified salary data for Pakistan&apos;s IT market.
          </p>
        </div>

        {/* Search / filter bar */}
        <form
          onSubmit={handleSearch}
          className="p-4 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Role */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Role Title</label>
              <input
                type="text"
                placeholder="e.g. Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Experience level */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | "")}
                className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Any level</option>
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">City</label>
              <input
                type="text"
                placeholder="e.g. Lahore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Tech stack */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Tech Stack</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        {/* Results */}
        {searchError && (
          <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {searchError}
          </div>
        )}

        {loading && (
          <div className="grid gap-4 mb-8">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && results !== null && (
          <div className="mb-8">
            {results.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <p className="text-3xl mb-3">💼</p>
                <p className="font-medium">No salary data found for these filters.</p>
                <p className="text-xs mt-1">Try broadening your search or submit your own salary below.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map((entry, i) => (
                  <ResultCard key={`${entry.roleTitle}-${entry.experienceLevel}-${entry.city}-${i}`} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit salary section */}
        <div className="rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark overflow-hidden">
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium hover:bg-surface dark:hover:bg-surface-dark transition-colors"
          >
            <span>Submit your salary</span>
            <span className="text-muted text-lg leading-none">{formOpen ? "−" : "+"}</span>
          </button>

          {formOpen && (
            <div className="px-5 pb-5 border-t border-border dark:border-border-dark">
              <p className="text-xs text-muted mt-4 mb-4">
                Help others by sharing your salary. All submissions are anonymous. Optionally add verification evidence to get a Verified badge.
              </p>

              {submitStatus === "success" && (
                <div className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                  {submitMessage}
                </div>
              )}
              {submitStatus === "error" && (
                <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Role title */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted">
                    Role Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backend Engineer"
                    value={form.roleTitle}
                    onChange={(e) => setForm((f) => ({ ...f, roleTitle: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Experience level */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted">
                    Experience Level <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={form.experienceLevel}
                    onChange={(e) => setForm((f) => ({ ...f, experienceLevel: e.target.value as ExperienceLevel }))}
                    className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">Select level</option>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Salary amount */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted">
                    Monthly Salary (PKR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 150000"
                    value={form.salaryAmount}
                    onChange={(e) => setForm((f) => ({ ...f, salaryAmount: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Employment type */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted">
                    Employment Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={form.employmentType}
                    onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value as EmploymentType }))}
                    className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">Select type</option>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Tech stack (optional) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted">Tech Stack (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, TypeScript"
                    value={form.techStack}
                    onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Evidence URL (optional) — full width */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-medium text-muted">
                    Verification Evidence URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="Payslip link or LinkedIn profile URL"
                    value={form.evidenceUrl}
                    onChange={(e) => setForm((f) => ({ ...f, evidenceUrl: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-xs text-muted">
                    Adding evidence queues your entry for admin verification and earns a Verified badge.
                  </p>
                </div>

                {/* Submit */}
                <div className="sm:col-span-2 flex justify-end mt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit Salary"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
