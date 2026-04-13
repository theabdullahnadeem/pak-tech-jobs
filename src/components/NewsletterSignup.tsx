"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [skill, setSkill] = useState("");
  const [jobType, setJobType] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const skills = ["React", "Node.js", "Python / AI", "Full Stack", "DevOps", "Cybersecurity", "Other"];
  const jobTypes = ["Remote", "On-site", "Both"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, skill, jobType }),
      });

      if (res.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-surface dark:bg-surface-dark border-t border-border dark:border-border-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Get Pakistan&apos;s Best Tech Jobs in Your Inbox — <span className="text-primary italic">Every Week</span>
        </h2>
        <p className="text-lg text-muted mb-10">
          Subscribe to &quot;Tech Jobs Pakistan Weekly&quot; and receive curated, high-paying opportunities matching your exact skills.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-card dark:bg-card-dark p-6 sm:p-8 rounded-3xl border border-border dark:border-border-dark shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl focus:outline-none focus:border-primary transition-colors text-foreground"
              />
              <select
                required
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full px-4 py-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl focus:outline-none focus:border-primary transition-colors text-foreground appearance-none"
              >
                <option value="" disabled>Select Skill / Interest</option>
                {skills.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                required
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-4 py-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl focus:outline-none focus:border-primary transition-colors text-foreground appearance-none"
              >
                <option value="" disabled>Job Type Preference</option>
                {jobTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-foreground text-background font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Subscribing..." : "Subscribe Free"}
            </button>
            <p className="text-xs text-muted">No spam. Unsubscribe anytime.</p>
          </form>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl">
            <span className="text-4xl block mb-4">🎉</span>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">You&apos;re Subscribed!</h3>
            <p className="text-muted text-lg">You&apos;re in! Check your inbox — we&apos;ve sent you a welcome email with the best current jobs.</p>
          </div>
        )}
      </div>
    </section>
  );
}
