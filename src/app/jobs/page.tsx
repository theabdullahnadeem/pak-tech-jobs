"use client";

import { useState } from "react";

export default function JobsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://formsubmit.co/ajax/paktechhjobs@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          _subject: "🚀 New Job Portal Notification Signup",
          message: `${email} wants to be notified when the PakTechJobs Job Portal launches.`,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="text-7xl mb-6 animate-fade-in-up">🚧</div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 animate-fade-in-up delay-100">
          Job Portal <span className="gradient-text">Coming Soon</span>
        </h1>

        <p className="text-muted text-lg mb-8 leading-relaxed animate-fade-in-up delay-200">
          We&apos;re building Pakistan&apos;s dedicated tech job portal. Get notified when we launch with the latest tech job listings, internships, and remote opportunities.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto animate-fade-in-up delay-300"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Notify Me"}
            </button>
          </form>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-fade-in-up max-w-md mx-auto">
            <span className="text-3xl block mb-2">✅</span>
            <p className="font-semibold text-emerald-500 mb-1">You&apos;re on the list!</p>
            <p className="text-sm text-muted">
              We&apos;ll notify you as soon as the job portal launches.
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}

        {/* Features preview */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up delay-400">
          {[
            { icon: "💼", label: "Tech Jobs" },
            { icon: "🏠", label: "Remote Listings" },
            { icon: "🎓", label: "Internships" },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark"
            >
              <span className="text-2xl block mb-2">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
