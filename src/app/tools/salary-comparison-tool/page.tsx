"use client";

import { useState } from "react";
import Link from "next/link";
import { salaryRoles, formatSalary } from "@/data/salaries";

type Level = "junior" | "mid" | "senior";

export default function SalaryComparisonTool() {
  const [role1, setRole1] = useState<string>(salaryRoles[0].slug);
  const [role2, setRole2] = useState<string>(salaryRoles[1].slug);
  const [level, setLevel] = useState<Level>("mid");
  const [compared, setCompared] = useState(false);

  const roleData1 = salaryRoles.find((r) => r.slug === role1);
  const roleData2 = salaryRoles.find((r) => r.slug === role2);

  const handleCompare = () => {
    setCompared(true);
  };

  const getRange = (role: typeof salaryRoles[0], lvl: Level) => role.salaryRange[lvl];

  const getAvg = (role: typeof salaryRoles[0], lvl: Level) => {
    const range = getRange(role, lvl);
    return (range.min + range.max) / 2;
  };

  const maxSalary = compared && roleData1 && roleData2
    ? Math.max(
        roleData1.salaryRange.senior.max,
        roleData2.salaryRange.senior.max
      )
    : 500000;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <nav className="mb-8 text-sm text-muted">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-primary transition-colors">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Salary Comparison</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">
        Salary <span className="gradient-text">Comparison Tool</span>
      </h1>
      <p className="text-muted text-lg mb-8">
        Compare salaries between different tech roles and experience levels across Pakistan.
      </p>

      <div className="p-6 sm:p-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Role 1</label>
            <select
              value={role1}
              onChange={(e) => { setRole1(e.target.value); setCompared(false); }}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {salaryRoles.map((r) => (
                <option key={r.slug} value={r.slug}>{r.shortTitle}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role 2</label>
            <select
              value={role2}
              onChange={(e) => { setRole2(e.target.value); setCompared(false); }}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {salaryRoles.map((r) => (
                <option key={r.slug} value={r.slug}>{r.shortTitle}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Experience Level</label>
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value as Level); setCompared(false); }}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="junior">Junior (0-1 yr)</option>
              <option value="mid">Mid-Level (1-3 yr)</option>
              <option value="senior">Senior (3+ yr)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40"
        >
          Compare Salaries
        </button>

        {compared && roleData1 && roleData2 && (
          <div className="mt-8 animate-fade-in-up">
            {/* Side by side cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                <h3 className="font-semibold text-lg mb-1">{roleData1.shortTitle}</h3>
                <span className="text-sm text-muted block mb-3">{level.charAt(0).toUpperCase() + level.slice(1)} Level</span>
                <div className="text-3xl font-bold text-blue-500 mb-1">
                  {formatSalary(getAvg(roleData1, level))}
                </div>
                <span className="text-xs text-muted">
                  {formatSalary(getRange(roleData1, level).min)} — {formatSalary(getRange(roleData1, level).max)}
                </span>
              </div>
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <h3 className="font-semibold text-lg mb-1">{roleData2.shortTitle}</h3>
                <span className="text-sm text-muted block mb-3">{level.charAt(0).toUpperCase() + level.slice(1)} Level</span>
                <div className="text-3xl font-bold text-emerald-500 mb-1">
                  {formatSalary(getAvg(roleData2, level))}
                </div>
                <span className="text-xs text-muted">
                  {formatSalary(getRange(roleData2, level).min)} — {formatSalary(getRange(roleData2, level).max)}
                </span>
              </div>
            </div>

            {/* Visual bar comparison */}
            <h3 className="font-semibold mb-4">Visual Comparison (All Levels)</h3>
            <div className="space-y-4">
              {(["junior", "mid", "senior"] as Level[]).map((lvl) => {
                const avg1 = getAvg(roleData1, lvl);
                const avg2 = getAvg(roleData2, lvl);
                const pct1 = (avg1 / maxSalary) * 100;
                const pct2 = (avg2 / maxSalary) * 100;

                return (
                  <div key={lvl}>
                    <span className="text-sm font-medium text-muted capitalize mb-2 block">{lvl}</span>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs w-28 truncate">{roleData1.shortTitle}</span>
                        <div className="flex-1 h-6 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-end pr-2 transition-all duration-700"
                            style={{ width: `${Math.max(pct1, 5)}%` }}
                          >
                            <span className="text-xs text-white font-medium">{formatSalary(avg1)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs w-28 truncate">{roleData2.shortTitle}</span>
                        <div className="flex-1 h-6 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-end pr-2 transition-all duration-700"
                            style={{ width: `${Math.max(pct2, 5)}%` }}
                          >
                            <span className="text-xs text-white font-medium">{formatSalary(avg2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Difference */}
            {(() => {
              const diff = getAvg(roleData1, level) - getAvg(roleData2, level);
              const higher = diff > 0 ? roleData1.shortTitle : roleData2.shortTitle;
              return (
                <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <span className="text-sm text-muted">At {level} level, </span>
                  <span className="font-semibold text-primary">{higher}</span>
                  <span className="text-sm text-muted"> earns </span>
                  <span className="font-semibold">{formatSalary(Math.abs(diff))}</span>
                  <span className="text-sm text-muted"> more per month on average.</span>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-xl font-bold mb-3">About This Tool</h2>
        <p className="text-muted leading-relaxed">
          Choosing the right tech career path in Pakistan requires understanding how salaries compare across different roles. Our salary comparison tool lets you compare compensation packages for various tech positions — from MERN developers to AI engineers — across different experience levels. Make informed career decisions backed by real salary data from Pakistan&apos;s tech industry.
        </p>
      </div>
    </div>
  );
}
