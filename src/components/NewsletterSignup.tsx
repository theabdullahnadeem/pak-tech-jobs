"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [skill, setSkill] = useState("");
  const [jobType, setJobType] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const skills = ["React", "Node.js", "Python / AI", "Full Stack", "DevOps", "Cybersecurity", "Other"];
  const jobTypes = ["Remote", "On-site", "Both"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setEmail("");
    }, 1000);
  };

  return (
    <section className="py-24 bg-surface dark:bg-surface-dark border-t border-border dark:border-border-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Get Pakistan's Best Tech Jobs in Your Inbox — <span className="text-primary italic">Every Week</span>
        </h2>
        <p className="text-lg text-muted mb-10">
          Subscribe to "Tech Jobs Pakistan Weekly" and receive curated, high-paying opportunities matching your exact skills.
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-foreground text-background font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
               {loading ? "Subscribing..." : "Subscribe Free"}
            </button>
          </form>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl">
            <span className="text-4xl block mb-4">🎉</span>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">You're Subscribed!</h3>
            <p className="text-muted text-lg">Watch your inbox for the best tech opportunities in Pakistan.</p>
          </div>
        )}
      </div>
    </section>
  );
}
