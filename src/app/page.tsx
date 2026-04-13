"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import JobSearchBar from "@/components/JobSearchBar";
import StatsBar from "@/components/StatsBar";
import NewsletterSignup from "@/components/NewsletterSignup";
import ResumeReviewCTA from "@/components/ResumeReviewCTA";
import { salaryRoles } from "@/data/salaries";
import { resources } from "@/data/resources";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const [trendingJobs, setTrendingJobs] = useState<{
    id: string; title: string; city: string; jobType: string;
    experienceLevel: string; salaryMin: number; salaryMax: number;
    skills: string[]; recruiter: { name: string; companyName: string | null };
  }[]>([]);

  useEffect(() => {
    fetch("/api/jobs?limit=6")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTrendingJobs(data.slice(0, 6)); })
      .catch(() => {});
  }, []);

  // Secondary content
  const featuredSalaries = salaryRoles.slice(0, 3);
  const featuredResources = resources.slice(0, 3);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    /* ── HERO: word-by-word title reveal + floating orbs ── */
    const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });

    heroTl
      .fromTo(".hero-badge",
        { y: 30, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)" }
      )
      .fromTo(".hero-title",
        { y: 60, opacity: 0, clipPath: "inset(100% 0 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 1, ease: "expo.out" },
        "-=0.3"
      )
      .fromTo(".hero-subtitle",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.5"
      )
      .fromTo(".hero-search",
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.4)" },
        "-=0.4"
      )
      .fromTo(".hero-tags",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.3"
      );

    /* ── Floating orbs parallax ── */
    gsap.to(".hero-orb-1", {
      y: -60, x: 30,
      scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 2 },
    });
    gsap.to(".hero-orb-2", {
      y: -40, x: -20,
      scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1.5 },
    });
    gsap.to(".hero-grid",
      { y: 80, scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 } }
    );

    /* ── Category cards: staggered 3D flip-in ── */
    gsap.fromTo(".category-card",
      { y: 60, opacity: 0, rotateX: 15, scale: 0.88, transformPerspective: 900 },
      {
        y: 0, opacity: 1, rotateX: 0, scale: 1,
        duration: 0.65, stagger: { amount: 0.8, from: "start" }, ease: "back.out(1.3)",
        scrollTrigger: { trigger: ".categories-grid", start: "top 82%" },
      }
    );

    /* ── Trending jobs: slide in from alternating sides ── */
    gsap.utils.toArray<HTMLElement>(".trending-job-card").forEach((card, i) => {
      gsap.fromTo(card,
        { x: i % 2 === 0 ? -60 : 60, opacity: 0, scale: 0.95 },
        {
          x: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    });

    /* ── Section headings: clip-path reveal ── */
    gsap.utils.toArray<HTMLElement>(".section-heading-reveal").forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40, clipPath: "inset(0 0 100% 0)" },
        {
          opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    /* ── Salary/resource cards: scale pop ── */
    gsap.fromTo(".secondary-card",
      { y: 50, opacity: 0, scale: 0.9 },
      {
        y: 0, opacity: 1, scale: 1,
        duration: 0.6, stagger: 0.12, ease: "back.out(1.5)",
        scrollTrigger: { trigger: ".secondary-cards-grid", start: "top 82%" },
      }
    );

    /* ── CTA sections: glow pulse on enter ── */
    gsap.fromTo(".cta-section-inner",
      { y: 50, opacity: 0, scale: 0.97 },
      {
        y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power4.out",
        scrollTrigger: { trigger: ".cta-section-inner", start: "top 85%" },
      }
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* ═══════════ HERO ═══════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-gray-900 to-cyan-950 text-white pb-16"
      >
        <div className="hero-bg-layer absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb-1 absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="hero-orb-2 absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="hero-grid absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="hero-content-inner relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <span className="hero-badge inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-sm font-medium mb-6 border border-emerald-500/25 backdrop-blur-sm">
              🇵🇰 Pakistan&apos;s #1 Tech Job Board
            </span>
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black leading-tight mb-6">
              Pakistan's Tech Job Board — Software, AI &amp; IT Jobs
            </h1>
            
            <p className="hero-subtitle text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Browse 100+ software engineering, AI, and IT jobs in Pakistan. Updated daily with roles in Lahore, Karachi, Islamabad, and Remote. Free for developers — no sign-up needed.
            </p>

            <div className="hero-search max-w-2xl mx-auto mb-6">
              <JobSearchBar />
            </div>

            {/* Popular Searches Tag Strip */}
            <div className="hero-tags flex flex-wrap items-center justify-center gap-2 text-sm text-gray-400">
              <span className="font-semibold text-gray-300 mr-2">Popular:</span>
              <Link href="/remote-jobs" className="hover:text-emerald-400 transition-colors">Remote Jobs</Link> <span className="opacity-30">•</span>
              <Link href="/react-jobs-pakistan" className="hover:text-emerald-400 transition-colors">React Jobs</Link> <span className="opacity-30">•</span>
              <Link href="/nodejs-jobs-pakistan" className="hover:text-emerald-400 transition-colors">Node.js Jobs</Link> <span className="opacity-30">•</span>
              <Link href="/internships-pakistan" className="hover:text-emerald-400 transition-colors">Internships</Link> <span className="opacity-30">•</span>
              <Link href="/fresh-graduate-it-jobs" className="hover:text-emerald-400 transition-colors">Fresh Graduate Jobs</Link> <span className="opacity-30">•</span>
              <Link href="/mern-jobs-pakistan" className="hover:text-emerald-400 transition-colors">MERN Stack</Link> <span className="opacity-30">•</span>
              <Link href="/ai-jobs-pakistan" className="hover:text-emerald-400 transition-colors">AI Jobs</Link> <span className="opacity-30">•</span>
              <Link href="/devops-jobs-pakistan" className="hover:text-emerald-400 transition-colors">DevOps</Link>
            </div>

            {/* C4: Trust tagline/value prop */}
            <p className="text-xs text-gray-500 mt-4">
              Free to use &middot; No sign-up required &middot; Updated daily
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <StatsBar />

      {/* ═══════════ JOB CATEGORIES GRID ═══════════ */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-heading-reveal text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Explore Roles by <span className="gradient-text">Category</span>
            </h2>
          </div>
          <div className="categories-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Hardcoded visual category cards to match the requirements */}
            {[
              { label: "Frontend Development", icon: "🖥️", count: 24, href: "/frontend-jobs" },
              { label: "Backend Development", icon: "⚙️", count: 18, href: "/backend-jobs" },
              { label: "Full Stack / MERN", icon: "🔗", count: 32, href: "/mern-jobs-pakistan" },
              { label: "AI & Machine Learning", icon: "🤖", count: 12, href: "/ai-jobs-pakistan" },
              { label: "Mobile Development", icon: "📱", count: 15, href: "/jobs" }, // Fallback to /jobs
              { label: "DevOps & Cloud", icon: "☁️", count: 9, href: "/devops-jobs-pakistan" },
              { label: "Cybersecurity", icon: "🔐", count: 4, href: "/jobs" },
              { label: "UI/UX Design", icon: "🎨", count: 11, href: "/jobs" },
              { label: "Internships", icon: "🎓", count: 28, href: "/internships-pakistan" },
              { label: "Remote Only", icon: "🌍", count: 45, href: "/remote-jobs" },
            ].map((cat) => (
              <Link 
                key={cat.label} 
                href={cat.href}
                className="category-card group flex flex-col p-6 rounded-2xl border border-border dark:border-border-dark bg-card hover:bg-surface dark:bg-card-dark dark:hover:bg-surface-dark transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-bottom-left">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                  {cat.label}
                </h3>
                <span className="text-xs font-semibold text-muted bg-foreground/5 dark:bg-foreground/10 self-start px-2 py-1 rounded">
                  {cat.count} Jobs
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TRENDING / LATEST JOBS — only shown when jobs exist ═══════════ */}
      <section className="py-20 sm:py-24 bg-surface dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {trendingJobs.length > 0 && (
            <>
              <div className="section-heading-reveal text-center mb-14">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  🔥 Trending Tech Jobs This Week
                </h2>
                <p className="text-lg text-muted">
                  The hottest positions actively recruiting Pakistani developers.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {trendingJobs.map((job) => (
                  <div key={job.id} className="trending-job-card">
                    <Link href={`/jobs/${job.id}`}
                      className="group flex flex-col p-5 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 shrink-0 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark flex items-center justify-center text-base font-bold text-muted">
                          {(job.recruiter.companyName || job.recruiter.name).charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{job.title}</h3>
                          <p className="text-sm text-muted truncate">{job.recruiter.companyName || job.recruiter.name} · {job.city}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills.slice(0, 3).map(s => (
                          <span key={s} className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">{s}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted mt-auto pt-3 border-t border-border dark:border-border-dark">
                        <span>{job.jobType.replace("_", " ")} · {job.experienceLevel}</span>
                        <span className="font-medium text-foreground">PKR {job.salaryMin.toLocaleString()}+</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="text-center">
            <Link 
              href="/jobs" 
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-bold rounded-xl transition-all hover:bg-primary-dark shadow-lg shadow-primary/20 hover:-translate-y-1"
            >
              Browse All Jobs →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ RESUME REVIEW CTA ═══════════ */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ResumeReviewCTA />
        </div>
      </section>



      {/* ═══════════ SECONDARY: FEATURED SEO ARTICLES ═══════════ */}
      <section className="py-20 sm:py-24 bg-surface dark:bg-surface-dark border-y border-border dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-heading-reveal text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Career Guides &amp; Salary Insights
            </h2>
            <p className="text-muted max-w-xl mx-auto text-lg">
              Boost your tech career with our comprehensive salary breakdowns and remote work preparation guides.
            </p>
          </div>
          <div className="secondary-cards-grid grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredSalaries.map((role) => (
              <Link
                key={role.slug}
                href={`/salary/${role.slug}`}
                className="secondary-card group p-6 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <span className="text-2xl">💼</span>
                  <h3 className="font-semibold text-lg">{role.shortTitle} Salary Guide</h3>
                </div>
                <p className="text-sm text-muted mb-4 line-clamp-2">{role.description}</p>
                <span className="text-primary font-medium group-hover:underline text-sm">Read Full Guide →</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/salaries"
              className="text-primary font-semibold hover:underline"
            >
              View all career guides →
            </Link>
          </div>
        </div>
      </section>

      {/* B5: Submit Your Salary CTA */}
      <section className="py-14 bg-background border-t border-border dark:border-border-dark">
        <div className="cta-section-inner max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Know Your Salary? Help the Community.</h2>
          <p className="text-muted mb-6 text-lg max-w-xl mx-auto">
            Your anonymous submission helps thousands of Pakistani developers make better career decisions. Takes 2 minutes.
          </p>
          <Link
            href="/contact?subject=Salary+Data+Submission"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl transition-all hover:bg-primary-dark shadow-lg shadow-primary/20 hover:-translate-y-1"
          >
            Submit My Salary →
          </Link>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER SIGNUP ═══════════ */}
      <NewsletterSignup />

    </div>
  );
}
