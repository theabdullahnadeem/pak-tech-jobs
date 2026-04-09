"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface CompanyProfile {
  id: string;
  name: string;
  companyName: string | null;
  companyDescription: string | null;
  companyWebsite: string | null;
  companyLogoPublicId: string | null;
  companySize: string | null;
  companyIndustry: string | null;
  companyLocation: string | null;
  recruiterVerified: boolean;
  responseRate: number;
  avgResponseTimeHours: number | null;
  avgRating: number | null;
  jobPosts: { id: string; title: string; city: string; jobType: string; experienceLevel: string; createdAt: string }[];
  reviewsReceived: { rating: number; comment: string | null; createdAt: string; giver: { name: string } }[];
}

export default function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/company/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setCompany(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  if (error || !company) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-red-500">{error || "Company not found"}</p>
    </div>
  );

  const displayName = company.companyName || company.name;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark flex items-center justify-center text-2xl font-bold text-muted shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
                {company.recruiterVerified && (
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs text-blue-500">✓ Verified</span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted">
                {company.companyIndustry && <span>🏢 {company.companyIndustry}</span>}
                {company.companyLocation && <span>📍 {company.companyLocation}</span>}
                {company.companySize && <span>👥 {company.companySize}</span>}
                {company.companyWebsite && (
                  <a href={company.companyWebsite} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline">🌐 Website</a>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                <span>Response rate: <strong className="text-foreground">{Math.round(company.responseRate)}%</strong></span>
                {company.avgResponseTimeHours && (
                  <span>Avg response: <strong className="text-foreground">{company.avgResponseTimeHours}h</strong></span>
                )}
                {company.avgRating && (
                  <span>Rating: <strong className="text-foreground">{"⭐".repeat(Math.round(company.avgRating))} {company.avgRating.toFixed(1)}</strong></span>
                )}
              </div>
            </div>
          </div>
          {company.companyDescription && (
            <p className="mt-4 text-sm text-muted leading-relaxed border-t border-border dark:border-border-dark pt-4">
              {company.companyDescription}
            </p>
          )}
        </div>

        {/* Open Jobs */}
        {company.jobPosts.length > 0 && (
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-6 mb-6">
            <h2 className="text-base font-semibold mb-4">Open Positions ({company.jobPosts.length})</h2>
            <div className="space-y-2">
              {company.jobPosts.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`}
                  className="flex items-center justify-between rounded-xl border border-border dark:border-border-dark px-4 py-3 hover:border-primary/50 hover:bg-surface dark:hover:bg-surface-dark transition-all">
                  <div>
                    <p className="text-sm font-medium text-foreground">{job.title}</p>
                    <p className="text-xs text-muted">{job.city} · {job.jobType.replace("_"," ")} · {job.experienceLevel}</p>
                  </div>
                  <span className="text-primary text-sm">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {company.reviewsReceived.length > 0 && (
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-4">Reviews</h2>
            <div className="space-y-3">
              {company.reviewsReceived.map((review, i) => (
                <div key={i} className="rounded-xl border border-border dark:border-border-dark p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{review.giver.name}</span>
                    <span className="text-sm">{"⭐".repeat(review.rating)}</span>
                  </div>
                  {review.comment && <p className="text-sm text-muted">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
