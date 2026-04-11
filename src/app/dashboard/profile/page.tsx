"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  name: string;
  bio: string | null;
  portfolioUrl: string | null;
  profileSlug: string | null;
  openToOpportunities: boolean;
  skills: string[];
  experienceLevel: string | null;
  location: string | null;
  targetRoles: string[];
}

export default function ProfileEditPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [profileSlug, setProfileSlug] = useState("");
  const [openToWork, setOpenToWork] = useState(false);
  const [skills, setSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [location, setLocation] = useState("");
  const [targetRoles, setTargetRoles] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then((data: Profile) => {
        setProfile(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setPortfolioUrl(data.portfolioUrl || "");
        setProfileSlug(data.profileSlug || "");
        setOpenToWork(data.openToOpportunities);
        setSkills(data.skills.join(", "));
        setExperienceLevel(data.experienceLevel || "");
        setLocation(data.location || "");
        setTargetRoles(data.targetRoles.join(", "));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        bio: bio.trim() || null,
        portfolioUrl: portfolioUrl.trim() || null,
        profileSlug: profileSlug.trim() || null,
        openToOpportunities: openToWork,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        experienceLevel: experienceLevel || null,
        location: location.trim() || null,
        targetRoles: targetRoles.split(",").map(s => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Failed to save");
    else setSaved(true);
    setSaving(false);
  };

  const inputCls = "w-full rounded-lg border border-border dark:border-border-dark bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            {profile?.profileSlug && (
              <Link href={`/profile/${profile.profileSlug}`} className="text-xs text-primary hover:underline mt-0.5 block">
                View public profile →
              </Link>
            )}
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500">{error}</div>}
        {saved && <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-500">✓ Profile saved</div>}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Basic Info</h2>
            <div>
              <label className="block text-xs text-muted mb-1">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Tell recruiters about yourself…" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Portfolio / Website URL</label>
              <input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className={inputCls} placeholder="https://yoursite.com" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Profile Slug (for public URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted shrink-0">/profile/</span>
                <input value={profileSlug} onChange={e => setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className={inputCls} placeholder="your-name" />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={openToWork} onChange={e => setOpenToWork(e.target.checked)} className="accent-primary w-4 h-4" />
              <span className="text-sm text-foreground">Open to work opportunities</span>
            </label>
          </div>

          <div className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Skills & Experience</h2>
            <div>
              <label className="block text-xs text-muted mb-1">Skills (comma-separated)</label>
              <input value={skills} onChange={e => setSkills(e.target.value)} className={inputCls} placeholder="React, TypeScript, Node.js" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Experience Level</label>
              <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {["JUNIOR","MID","SENIOR","LEAD"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className={inputCls} placeholder="Lahore, Pakistan" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Target Roles (comma-separated)</label>
              <input value={targetRoles} onChange={e => setTargetRoles(e.target.value)} className={inputCls} placeholder="Frontend Developer, Full Stack Engineer" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
