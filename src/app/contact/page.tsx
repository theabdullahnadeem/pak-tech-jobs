"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const contactCards = [
  { icon: "📧", title: "Email", content: "paktechhjobs@gmail.com", href: "mailto:paktechhjobs@gmail.com", linkLabel: "Send email" },
  { icon: "💬", title: "WhatsApp", content: "Chat directly with us", href: "https://wa.me/923161404891", linkLabel: "Open WhatsApp" },
  { icon: "📍", title: "Location", content: "Pakistan", href: null, linkLabel: null },
  { icon: "⏰", title: "Response Time", content: "Within 24–48 hours", href: null, linkLabel: null },
];

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl
      .fromTo(".contact-title",
        { y: 60, opacity: 0, clipPath: "inset(100% 0 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 1 }
      )
      .fromTo(".contact-subtitle",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.5"
      );

    // Contact info cards stagger
    gsap.fromTo(".contact-info-card",
      { x: -40, opacity: 0, scale: 0.95 },
      {
        x: 0, opacity: 1, scale: 1,
        duration: 0.6, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-info-grid", start: "top 85%" },
        delay: 0.3,
      }
    );

    // Form entrance
    gsap.fromTo(".contact-form",
      { y: 50, opacity: 0, scale: 0.97, rotateX: 5, transformPerspective: 800 },
      {
        y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.9, ease: "power4.out",
        delay: 0.5,
      }
    );
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => { data[key] = value.toString(); });
    try {
      const res = await fetch("https://formsubmit.co/ajax/paktechhjobs@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, _subject: `New Contact from PakTechJobs: ${data.subject || "General"}` }),
      });
      if (res.ok) setSubmitted(true);
      else setError("Failed to send message. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="contact-title text-4xl sm:text-5xl font-black mb-4 leading-tight">
          Contact <span className="gradient-text">Us</span>
        </h1>
        <p className="contact-subtitle text-lg text-muted max-w-xl leading-relaxed">
          Have questions, feedback, or want to contribute? Get in touch — we&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="contact-info-grid space-y-4">
          {contactCards.map((card) => (
            <div key={card.title}
              className="contact-info-card group p-5 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform duration-300">{card.icon}</span>
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{card.title}</h3>
              {card.href ? (
                <a href={card.href} target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  {card.content}
                </a>
              ) : (
                <p className="text-sm text-muted">{card.content}</p>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="contact-form p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
              <span className="text-6xl block mb-4">✅</span>
              <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
              <p className="text-muted mb-6">Thank you for reaching out. We&apos;ll get back to you within 24–48 hours.</p>
              <button onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-all hover:-translate-y-0.5">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}
              className="contact-form p-6 sm:p-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5">Name *</label>
                  <input type="text" id="name" name="name" required placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email *</label>
                  <input type="email" id="email" name="email" required placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1.5">Subject *</label>
                <select id="subject" name="subject" required
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm">
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
                <textarea id="message" name="message" required rows={5} placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y text-sm" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
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
