"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      const res = await fetch("https://formsubmit.co/ajax/paktechhjobs@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...data,
          _subject: `New Contact from PakTechJobs: ${data.subject || "General"}`,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">
        Contact <span className="gradient-text">Us</span>
      </h1>
      <p className="text-lg text-muted mb-10 max-w-2xl">
        Have questions, feedback, or want to contribute? Get in touch — we&apos;d love to hear from you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
            <span className="text-2xl block mb-2">📧</span>
            <h3 className="font-semibold mb-1">Email</h3>
            <a href="mailto:paktechhjobs@gmail.com" className="text-sm text-primary hover:underline">
              paktechhjobs@gmail.com
            </a>
          </div>

          <div className="p-5 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
            <span className="text-2xl block mb-2">💬</span>
            <h3 className="font-semibold mb-1">WhatsApp</h3>
            <a
              href="https://wa.me/923161404891"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Chat with us
            </a>
          </div>

          <div className="p-5 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
            <span className="text-2xl block mb-2">📍</span>
            <h3 className="font-semibold mb-1">Location</h3>
            <p className="text-sm text-muted">Pakistan</p>
          </div>

          <div className="p-5 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
            <span className="text-2xl block mb-2">⏰</span>
            <h3 className="font-semibold mb-1">Response Time</h3>
            <p className="text-sm text-muted">Within 24-48 hours</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
              <span className="text-5xl block mb-4">✅</span>
              <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
              <p className="text-muted mb-6">
                Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1.5">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                >
                  <option value="">Select a topic...</option>
                  <option value="Salary Data Feedback">Salary Data Feedback</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Course Inquiry">Course Inquiry</option>
                  <option value="Partnership / Collaboration">Partnership / Collaboration</option>
                  <option value="General Question">General Question</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1.5">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y text-sm"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message →"}
              </button>

              <p className="text-xs text-muted">
                By submitting this form, you agree to our{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
