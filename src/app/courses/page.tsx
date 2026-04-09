"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { courses } from "@/data/courses";

gsap.registerPlugin(ScrollTrigger);

export default function CoursesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    /* ── Hero: staggered entrance with 3D tilt ── */
    const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    heroTl
      .fromTo(".courses-badge",
        { y: 40, opacity: 0, scale: 0.7, rotation: -8 },
        { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2)" }
      )
      .fromTo(".courses-title",
        { y: 70, opacity: 0, clipPath: "inset(100% 0 0 0)", rotateX: 20, transformPerspective: 700 },
        { y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", rotateX: 0, duration: 1 },
        "-=0.3"
      )
      .fromTo(".courses-subtitle",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.4"
      );

    /* ── Stats: bounce pop with stagger ── */
    gsap.fromTo(".stat-item",
      { y: 50, opacity: 0, scale: 0.6 },
      {
        y: 0, opacity: 1, scale: 1,
        duration: 0.7, stagger: 0.1, ease: "back.out(2.2)",
        scrollTrigger: { trigger: ".stats-row", start: "top 85%" },
      }
    );

    /* ── Why learn cards: 3D flip from bottom ── */
    gsap.fromTo(".why-learn-item",
      { y: 70, opacity: 0, rotateX: 18, rotateY: 6, scale: 0.88, transformPerspective: 700 },
      {
        y: 0, opacity: 1, rotateX: 0, rotateY: 0, scale: 1,
        duration: 0.75, stagger: { amount: 0.7, from: "start" }, ease: "power4.out",
        scrollTrigger: { trigger: ".why-learn-grid", start: "top 80%" },
      }
    );

    /* ── Course cards: cascade with depth ── */
    gsap.fromTo(".course-card",
      { y: 90, opacity: 0, scale: 0.82, rotateX: 12, transformPerspective: 900 },
      {
        y: 0, opacity: 1, scale: 1, rotateX: 0,
        duration: 0.8, stagger: { amount: 0.9, from: "start" }, ease: "back.out(1.2)",
        scrollTrigger: { trigger: ".courses-grid", start: "top 80%" },
      }
    );

    /* ── CTA: scale + glow entrance ── */
    gsap.fromTo(".courses-cta-inner",
      { y: 60, opacity: 0, scale: 0.93 },
      {
        y: 0, opacity: 1, scale: 1, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: ".courses-cta", start: "top 82%" },
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950 text-white py-24 sm:py-32">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="courses-badge inline-block px-5 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-8 border border-purple-500/30 backdrop-blur-sm">
            🎓 Invest in Your Future
          </span>
          <h1 className="courses-title text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Master In-Demand{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Digital Skills
            </span>
          </h1>
          <p className="courses-subtitle text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We&apos;ve curated the best learning paths for Pakistan&apos;s most in-demand tech skills — paired with free career guidance to help you choose the right one.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-14 bg-background border-b border-border dark:border-border-dark">
        <div className="stats-row max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "8", label: "Salary Guides" },
            { value: "4", label: "Free Tools" },
            { value: "6", label: "Course Tracks" },
            { value: "Free", label: "To Use" },
          ].map((stat) => (
            <div key={stat.label} className="stat-item">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ WHY LEARN ═══ */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-heading text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why <span className="gradient-text">Digital Courses</span> Matter
            </h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              In today&apos;s rapidly evolving tech landscape, continuous learning isn&apos;t optional — it&apos;s the difference between staying relevant and falling behind.
            </p>
          </div>

          <div className="why-learn-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              { icon: "💰", title: "Higher Earning Potential", desc: "Tech professionals with certified skills earn 3–6x more than traditional roles. A MERN developer can earn PKR 100K–400K+ per month." },
              { icon: "🌍", title: "Global Opportunities", desc: "Digital skills open doors to remote work with international companies, paying in USD/EUR while living in Pakistan." },
              { icon: "🚀", title: "Future-Proof Career", desc: "AI, cloud, and web technologies are growing exponentially. Learning these skills now positions you for decades of career growth." },
              { icon: "⚡", title: "Fast Entry Into Tech", desc: "Unlike traditional degrees, focused courses get you job-ready in 3–6 months. Many companies value skills over degrees." },
              { icon: "🏢", title: "Freelancing Freedom", desc: "Digital skills let you freelance globally. Pakistanis earn millions monthly on Upwork, Fiverr, and direct contracts." },
              { icon: "🎯", title: "Industry Certification", desc: "Completing recognized courses from Coursera, Google, or Meta adds credibility and boosts your resume significantly." },
            ].map((item) => (
              <div
                key={item.title}
                className="why-learn-item group p-7 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/40 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-500">{item.icon}</span>
                <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COURSE LISTINGS ═══ */}
      <section className="py-20 sm:py-24 bg-surface dark:bg-surface-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-heading text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Browse <span className="gradient-text">Courses</span>
            </h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Explore our curated selection of high-impact courses. Each includes links to top platforms — or opt for personalized in-person training.
            </p>
          </div>

          <div className="courses-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="course-card group relative p-7 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 flex flex-col"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{course.icon}</span>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full group-hover:bg-primary/20 transition-colors">
                      {course.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">
                    {course.shortTitle}
                  </h3>
                  <p className="text-sm text-muted mb-5 line-clamp-2 flex-1">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted border-t border-border dark:border-border-dark pt-4">
                    <span>📚 {course.difficulty}</span>
                    <span>⏱️ {course.duration}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="courses-cta relative py-20 sm:py-24 bg-gradient-to-r from-purple-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="courses-cta-inner relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">Want Personalized Guidance?</h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            Not sure which course is right for you? Get in touch for a free career consultation. We&apos;ll help you choose the perfect learning path.
          </p>
          <a
            href={`https://wa.me/923161404891?text=${encodeURIComponent("Hi! I need career guidance on which tech course to take. Can you help?")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
