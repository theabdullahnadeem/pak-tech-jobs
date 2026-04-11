"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface PublicProfile {
  id: string;
  name: string;
  bio: string | null;
  portfolioUrl: string | null;
  skills: string[];
  verifiedSkills: string[];
  experienceLevel: string | null;
  location: string | null;
  openToOpportunities: boolean;
  targetRoles: string[];
  createdAt: string;
  skillVerifications: { skill: string; method: string; verifiedAt: string }[];
}

export default function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/profile/public/${slug}`)
      .then(r => r.json())
      .then(data => { if (data.error) setError(data.error); else setProfile(data); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  if (error || !profile) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-foreground font-semibold">Profile not found</p>
        <Link href="/jobs" className="mt-3 inline-block text-sm text-primary hover:underline">Browse Jobs →</Link>
      </div>
    </div>
  );

  const verifiedSet = new Set(profile.verifiedSkills);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header card */}
        <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
                {profile.openToOpportunities && (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs text-emerald-500 font-medium">
                    🟢 Open to work
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted">
                {profile.experienceLevel && <span>⚡ {profile.experienceLevel}</span>}
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline">🌐 Portfolio</a>
                )}
              </div>
              {profile.bio && <p className="mt-2 text-sm text-muted leading-relaxed">{profile.bio}</p>}
            </div>
          </div>
        </div>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-5 mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                  verifiedSet.has(skill)
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-surface dark:bg-surface-dark text-foreground"
                }`}>
                  {verifiedSet.has(skill) && <span>✓</span>}
                  {skill}
                </span>
              ))}
            </div>
            {profile.verifiedSkills.length > 0 && (
              <p className="mt-2 text-xs text-muted">✓ = Verified skill</p>
            )}
          </div>
        )}

        {/* Target roles */}
        {profile.targetRoles.length > 0 && (
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-5 mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Looking for</h2>
            <div className="flex flex-wrap gap-2">
              {profile.targetRoles.map(role => (
                <span key={role} className="rounded-full bg-surface dark:bg-surface-dark px-3 py-1 text-xs text-foreground">{role}</span>
              ))}
            </div>
          </div>
        )}

        {/* Verified skills detail */}
        {profile.skillVerifications.length > 0 && (
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Verified Skills</h2>
            <div className="space-y-2">
              {profile.skillVerifications.map(v => (
                <div key={v.skill} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span className="font-medium text-foreground">{v.skill}</span>
                  </div>
                  <span className="text-xs text-muted">{v.method} · {new Date(v.verifiedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
