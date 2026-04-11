"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const offerings = [
  { icon: "💰", title: "Salary Guides", desc: "Detailed salary breakdowns for 8+ tech roles across Pakistan, covering junior to senior levels and city-wise comparisons." },
  { icon: "🛠️", title: "Career Tools", desc: "Free tools including a salary-after-tax calculator, salary comparison tool, freelance rate calculator, and AI-powered resume checker." },
  { icon: "📚", title: "Resources", desc: "Expert career guides covering salary negotiation, remote work, freelancing, internships, and professional growth in Pakistan." },
  { icon: "🎓", title: "Courses", desc: "Curated tech courses with links to Coursera, Udemy, and in-person training options for MERN, AI/ML, DevOps, and more." },
];

const techStack = ["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP", "Google Gemini AI", "Vercel", "PostgreSQL", "Redis", "Socket.io"];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero entrance
    const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    heroTl
      .fromTo(".about-badge",
        { y: 30, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)" }
      )
      .fromTo(".about-title",
        { y: 60, opacity: 0, clipPath: "inset(100% 0 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 1 },
        "-=0.3"
      )
      .fromTo(".about-subtitle",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.5"
      );

    // Offering cards — 3D flip in
    gsap.fromTo(".offering-card",
      { y: 70, opacity: 0, rotateX: 15, scale: 0.9, transformPerspective: 800 },
      {
        y: 0, opacity: 1, rotateX: 0, scale: 1,
        duration: 0.7, stagger: { amount: 0.5, from: "start" }, ease: "power4.out",
        scrollTrigger: { trigger: ".offerings-grid", start: "top 82%" },
      }
    );

    // Mission section
    gsap.fromTo(".mission-section",
      { x: -50, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".mission-section", start: "top 85%" },
      }
    );

    // Tech stack pills — cascade
    gsap.fromTo(".tech-pill",
      { y: 20, opacity: 0, scale: 0.8 },
      {
        y: 0, opacity: 1, scale: 1,
        duration: 0.4, stagger: 0.06, ease: "back.out(1.7)",
        scrollTrigger: { trigger: ".tech-grid", start: "top 88%" },
      }
    );

    // Founder card
    gsap.fromTo(".founder-card",
      { y: 50, opacity: 0, scale: 0.96 },
      {
        y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power4.out",
        scrollTrigger: { trigger: ".founder-card", start: "top 85%" },
      }
    );

    // Stats counter animation
    gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
      const target = parseInt(el.getAttribute("data-value") || "0");
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        onUpdate: () => { el.textContent = Math.round(obj.val).toString(); },
      });
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      {/* Hero */}
      <div className="mb-14">
        <span className="about-badge inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-5 border border-emerald-500/20">
          🇵🇰 Built for Pakistan
        </span>
        <h1 className="about-title text-4xl sm:text-5xl font-black mb-4 leading-tight">
          About <span className="gradient-text">PakTechJobs</span>
        </h1>
        <p className="about-subtitle text-lg text-muted max-w-2xl leading-relaxed">
          Pakistan&apos;s most comprehensive resource for tech salary data, free career tools, and professional development — completely free, forever.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-16 p-6 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
        {[
          { value: 8, suffix: "+", label: "Salary Guides" },
          { value: 4, suffix: "", label: "Free Tools" },
          { value: 100, suffix: "%", label: "Free Forever" },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-primary">
              <span className="stat-number" data-value={stat.value}>0</span>
              <span>{stat.suffix}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-16">
        {/* Mission */}
        <section className="mission-section">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🎯</span> Our Mission
          </h2>
          <p className="text-muted leading-relaxed text-lg">
            We believe every tech professional in Pakistan deserves access to transparent salary information and powerful career tools — completely free. PakTechJobs was created to bridge the information gap in Pakistan&apos;s rapidly growing tech industry, helping developers, engineers, designers, and other tech professionals make informed career decisions.
          </p>
        </section>

        {/* Offerings */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🚀</span> What We Offer
          </h2>
          <div className="offerings-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offerings.map((item) => (
              <div key={item.title}
                className="offering-card group p-6 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span> How We Gather Data
          </h2>
          <p className="text-muted leading-relaxed">
            Our salary data is compiled from publicly available job postings, industry surveys, crowd-sourced compensation reports, recruiter inputs, and direct feedback from tech professionals across Pakistan. We regularly update our figures to reflect the latest market trends.
          </p>
          <p className="text-muted leading-relaxed mt-3">
            <strong className="text-foreground">Disclaimer:</strong> All salary figures are estimates and may vary based on company, location, experience, and market conditions.
          </p>
        </section>

        {/* Tech stack */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>⚡</span> Built With Modern Tech
          </h2>
          <div className="tech-grid flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span key={tech}
                className="tech-pill px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full hover:bg-primary/20 transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📬</span> Get in Touch
          </h2>
          <p className="text-muted leading-relaxed mb-5">
            Have questions, feedback, or want to contribute salary data? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/contact"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all text-center hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25">
              Contact Us
            </Link>
            <a href="mailto:paktechjobs@gmail.com"
              className="px-6 py-3 border border-border dark:border-border-dark hover:border-primary/50 font-medium rounded-xl transition-all text-center hover:-translate-y-0.5">
              paktechjobs@gmail.com
            </a>
          </div>
        </section>

        {/* Founder */}
        <section className="border-t border-border dark:border-border-dark pt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>👤</span> Who Built This
          </h2>
          <div className="founder-card p-6 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark flex flex-col sm:flex-row gap-6 items-start hover:border-primary/30 transition-colors">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/25">
              AN
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-0.5">Abdullah Nadeem</h3>
              <p className="text-sm text-primary font-medium mb-3">Founder, PakTechJobs</p>
              <p className="text-sm text-muted leading-relaxed mb-4">
                I built PakTechJobs because I saw how much confusion existed around tech salaries in Pakistan — developers were underpaid because they lacked data, and companies set ranges without market benchmarks. This platform is my attempt to fix that: free, transparent salary data and career tools for every tech professional in Pakistan.
              </p>
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
