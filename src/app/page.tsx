"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { salaryRoles, formatSalary } from "@/data/salaries";
import { tools } from "@/data/tools";
import { resources } from "@/data/resources";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const salariesRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const resourcesRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const featuredSalaries = salaryRoles.slice(0, 3);
  const featuredResources = resources.slice(0, 3);

  useGSAP(() => {
    /* ─────────── HERO — CINEMATIC ENTRANCE ─────────── */
    const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });

    // Dramatic curtain — background orbs scale in
    heroTl
      .fromTo(".hero-orb-1", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4 })
      .fromTo(".hero-orb-2", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4 }, "<0.15")
      .fromTo(".hero-orb-3", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4 }, "<0.15");

    // Badge slides in with a bounce
    heroTl.fromTo(".hero-badge",
      { y: 60, opacity: 0, scale: 0.7, rotateX: 40 },
      { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.9, ease: "back.out(1.7)" },
      "-=0.8"
    );

    // Title — each word pops up
    heroTl.fromTo(".hero-title-word",
      { y: 80, opacity: 0, rotateX: 30 },
      { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.08, ease: "back.out(1.2)" },
      "-=0.4"
    );

    // Subtitle fades up
    heroTl.fromTo(".hero-subtitle",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      "-=0.3"
    );

    // Buttons scale & bounce in
    heroTl.fromTo(".hero-btn",
      { y: 30, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(1.7)" },
      "-=0.3"
    );

    // Floating orbs — infinite parallax drift
    gsap.to(".hero-orb-1", {
      y: -30, x: 20, rotation: 10, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut",
    });
    gsap.to(".hero-orb-2", {
      y: 25, x: -20, rotation: -8, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut",
    });
    gsap.to(".hero-orb-3", {
      y: -15, x: 30, rotation: 5, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut",
    });

    // Hero parallax on scroll
    gsap.to(".hero-content-inner", {
      y: -60,
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1.5,
      },
    });

    /* ─────────── SECTION HEADINGS — CLIP REVEAL ─────────── */
    gsap.utils.toArray<HTMLElement>(".section-heading").forEach((heading) => {
      gsap.fromTo(heading,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power4.out",
          scrollTrigger: { trigger: heading, start: "top 85%", toggleActions: "play none none none" },
        }
      );
    });

    /* ─────────── SALARY CARDS — 3D FLIP IN ─────────── */
    gsap.fromTo(".salary-card",
      { y: 80, opacity: 0, rotateY: 15, scale: 0.9, transformPerspective: 800 },
      {
        y: 0, opacity: 1, rotateY: 0, scale: 1,
        duration: 0.8, stagger: 0.15, ease: "power4.out",
        scrollTrigger: {
          trigger: salariesRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      }
    );

    /* ─────────── TOOL CARDS — STAGGERED POP ─────────── */
    gsap.fromTo(".tool-card",
      { y: 60, opacity: 0, scale: 0.85, rotateX: 10, transformPerspective: 600 },
      {
        y: 0, opacity: 1, scale: 1, rotateX: 0,
        duration: 0.7, stagger: 0.1, ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: toolsRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      }
    );

    /* ─────────── RESOURCE CARDS — SLIDE FROM SIDES ─────────── */
    const resourceCards = gsap.utils.toArray<HTMLElement>(".resource-card");
    resourceCards.forEach((card, i) => {
      const fromX = i % 2 === 0 ? -60 : 60;
      gsap.fromTo(card,
        { x: fromX, y: 30, opacity: 0, rotateZ: fromX > 0 ? 3 : -3 },
        {
          x: 0, y: 0, opacity: 1, rotateZ: 0,
          duration: 0.8, ease: "power4.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    /* ─────────── CTA — SCALE UP WITH GLOW ─────────── */
    gsap.fromTo(".cta-content",
      { y: 60, opacity: 0, scale: 0.92 },
      {
        y: 0, opacity: 1, scale: 1, duration: 1, ease: "power4.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
    gsap.fromTo(".cta-btn",
      { y: 20, opacity: 0, scale: 0.8 },
      {
        y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      }
    );
  }, { scope: containerRef });

  // Word splitting helper for hero title
  const titleWords = "Software Engineer Salary in Pakistan &".split(" ");

  return (
    <div ref={containerRef}>
      {/* ═══════════ HERO ═══════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-gray-900 to-cyan-950 text-white"
        style={{ perspective: "1200px" }}
      >
        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb-1 absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/25 rounded-full blur-3xl" />
          <div className="hero-orb-2 absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl" />
          <div className="hero-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="hero-content-inner relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 lg:py-44">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="hero-badge mb-8">
              <span className="inline-block px-5 py-2 rounded-full bg-primary/20 text-primary-light text-sm font-medium border border-primary/30 backdrop-blur-sm">
                🇵🇰 #1 Software Engineer Salary Guide in Pakistan 2026
              </span>
            </div>

            {/* Title — word by word */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-3" style={{ perspective: "600px" }}>
              {titleWords.map((word, i) => (
                <span key={i} className="hero-title-word inline-block mr-[0.3em]">
                  {word}
                </span>
              ))}
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8">
              <span className="hero-title-word inline-block gradient-text">Free Career Tools</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover software engineer salary in Pakistan, cyber security salary, MERN developer salary in Lahore, Karachi &amp; Islamabad. Use our free salary after tax calculator, freelance rate calculator, and AI resume checker.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/salaries"
                className="hero-btn w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 hover:-translate-y-0.5"
              >
                Explore Salaries →
              </Link>
              <Link
                href="/tools"
                className="hero-btn w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 backdrop-blur-sm hover:scale-105 hover:-translate-y-0.5"
              >
                Try Free Tools
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════════ FEATURED SALARIES ═══════════ */}
      <section ref={salariesRef} className="py-20 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-heading text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Software Engineer <span className="gradient-text">Salary Guides</span> Pakistan
            </h2>
            <p className="text-muted max-w-xl mx-auto text-lg">
              Detailed salary breakdowns for software engineers, MERN developers, cyber security experts, AI engineers &amp; data scientists across Lahore, Karachi &amp; Islamabad.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredSalaries.map((role) => (
              <Link
                key={role.slug}
                href={`/salary/${role.slug}`}
                className="salary-card group relative p-7 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💼</span>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {role.shortTitle}
                    </h3>
                  </div>
                  <p className="text-sm text-muted mb-4 line-clamp-2">{role.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">{role.city}</span>
                    <span className="font-semibold text-primary">
                      {formatSalary(role.salaryRange.junior.min)} — {formatSalary(role.salaryRange.senior.max)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/salaries"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors group"
            >
              View all salary guides <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED TOOLS ═══════════ */}
      <section ref={toolsRef} className="py-20 sm:py-24 bg-surface dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-heading text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Free <span className="gradient-text">Salary Calculators</span> &amp; Career Tools
            </h2>
            <p className="text-muted max-w-xl mx-auto text-lg">
              Income tax calculator Pakistan, freelance rate calculator, developer salary comparison tool &amp; AI-powered resume strength checker.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="tool-card group p-7 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 text-center"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="text-5xl block mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">{tool.icon}</span>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {tool.shortTitle}
                </h3>
                <p className="text-sm text-muted line-clamp-2">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED RESOURCES ═══════════ */}
      <section ref={resourcesRef} className="py-20 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-heading text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Career Growth <span className="gradient-text">Resources &amp; Guides</span>
            </h2>
            <p className="text-muted max-w-xl mx-auto text-lg">
              Learn how to increase software engineer salary, skills to earn more as a developer, and the best software engineer career path in Pakistan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredResources.map((resource) => (
              <Link
                key={resource.slug}
                href={`/resources/${resource.slug}`}
                className="resource-card group p-7 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
              >
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                  {resource.category}
                </span>
                <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2 text-lg">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted line-clamp-2 mb-4">{resource.excerpt}</p>
                <span className="text-xs text-muted flex items-center gap-1">📖 {resource.readTime}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors group"
            >
              View all resources <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section ref={ctaRef} className="relative py-20 sm:py-24 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="cta-content relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">
            Boost Your Software Engineer Salary in Pakistan
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Enroll in our premium courses for MERN stack, AI engineering, data science &amp; cyber security. Master the highest paying tech skills in Pakistan and earn more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/courses"
              className="cta-btn w-full sm:w-auto px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5"
            >
              Browse Courses
            </Link>
            <Link
              href="/resources"
              className="cta-btn w-full sm:w-auto px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50 backdrop-blur-sm hover:scale-105 hover:-translate-y-0.5"
            >
              Free Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
