"use client";

import Link from "next/link";

interface JobCardProps {
  slug: string;
  title: string;
  company: string;
  logoUrl?: string;
  location: string;
  salary?: string;
  experience?: string;
  datePosted: string;
  skills: string[];
  isFeatured?: boolean;
  isVerified?: boolean;
  isNew?: boolean;
  applyUrl?: string;
}

export default function JobCard({
  slug,
  title,
  company,
  logoUrl,
  location,
  salary,
  experience,
  datePosted,
  skills,
  isFeatured = false,
  isVerified = false,
  isNew = false,
  applyUrl,
}: JobCardProps) {
  const isRemote = location.toLowerCase().includes("remote");

  return (
    <div
      className={`group relative flex flex-col p-6 rounded-2xl border bg-card dark:bg-card-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isFeatured
          ? "border-amber-400/50 shadow-amber-400/10 bg-amber-500/[0.02]"
          : "border-border dark:border-border-dark hover:border-primary/50"
      }`}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-md">
            <span>⭐</span> Featured
          </span>
        </div>
      )}

      {/* Header: Logo + Title + Company + Location */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 flex-shrink-0 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={`${company} logo`} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-muted">{company.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-2">
              <Link href={`/jobs/${slug}`} className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                {title}
              </Link>
              {isNew && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 z-10 relative">
                  NEW
                </span>
              )}
            </h3>
            <span className="text-xs text-muted whitespace-nowrap">{datePosted}</span>
          </div>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-muted-foreground flex items-center gap-1">
              {company}
              {isVerified && (
                <span className="text-blue-500" title="Verified Company">✓</span>
              )}
            </span>
            <span className="text-border dark:text-border-dark hidden sm:inline">•</span>
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                isRemote ? "text-emerald-500" : "text-muted"
              }`}
            >
              {isRemote ? "🌍 Remote" : `📍 ${location}`}
            </span>
          </div>
        </div>
      </div>

      {/* Meta Info: Salary & Experience */}
      <div className="flex items-center flex-wrap gap-4 text-sm mb-4">
        {salary && (
          <div className="flex items-center gap-1.5 text-foreground">
            <span className="text-muted">💰</span>
            <span className="font-medium">{salary}</span>
          </div>
        )}
        {experience && (
          <div className="flex items-center gap-1.5 text-foreground">
            <span className="text-muted">⏳</span>
            <span>{experience}</span>
          </div>
        )}
      </div>

      {/* Footer: Skills & Button */}
      <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-border dark:border-border-dark relative z-10">
        <div className="flex flex-wrap gap-2 flex-1">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface dark:bg-surface-dark text-muted">
              +{skills.length - 3}
            </span>
          )}
        </div>
        {applyUrl ? (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-primary hover:bg-primary-dark text-white`}
          >
            Apply Externally 🚀
          </a>
        ) : (
          <Link
            href={`/jobs/${slug}`}
            className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              isFeatured
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-surface dark:bg-surface-dark hover:bg-primary/10 text-foreground hover:text-primary"
            }`}
          >
            View Job
          </Link>
        )}
      </div>
    </div>
  );
}
