"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function StatsBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState([
    { label: "Jobs Listed", value: 0, suffix: "+", loaded: false },
    { label: "Companies", value: 0, suffix: "+", loaded: false },
    { label: "Developers", value: 0, suffix: "+", loaded: false },
    { label: "Updated", value: 24, suffix: "/7", loaded: true },
  ]);

  useEffect(() => {
    // Fetch real counts from the API
    Promise.allSettled([
      fetch("/api/jobs").then(r => r.json()),
      fetch("/api/admin/users").then(r => r.json()).catch(() => null),
    ]).then(([jobsResult, usersResult]) => {
      const jobs = jobsResult.status === "fulfilled" && Array.isArray(jobsResult.value) ? jobsResult.value : [];
      const users = usersResult.status === "fulfilled" && usersResult.value ? usersResult.value : [];

      const jobCount = jobs.length;
      const companyCount = new Set(jobs.map((j: { recruiter?: { id: string } }) => j.recruiter?.id).filter(Boolean)).size;
      const userCount = Array.isArray(users) ? users.filter((u: { role: string }) => u.role === "APPLICANT").length : 0;

      setStats([
        { label: "Jobs Listed", value: jobCount || 0, suffix: "+", loaded: true },
        { label: "Companies", value: companyCount || 0, suffix: "+", loaded: true },
        { label: "Developers", value: userCount || 0, suffix: "+", loaded: true },
        { label: "Updated", value: 24, suffix: "/7", loaded: true },
      ]);
    });
  }, []);

  useGSAP(() => {
    gsap.fromTo(containerRef.current,
      { y: 40, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 90%" } }
    );
    gsap.fromTo(".stat-item-inner",
      { y: 30, opacity: 0, scale: 0.7 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(2)",
        scrollTrigger: { trigger: containerRef.current, start: "top 85%" } }
    );
    gsap.utils.toArray<HTMLElement>(".stat-value").forEach((el) => {
      const targetValue = parseInt(el.getAttribute("data-value") || "0", 10);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetValue, duration: 2.2, ease: "power3.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" },
        onUpdate: () => { el.textContent = Math.round(obj.val).toString(); },
      });
    });
    gsap.fromTo(".stats-shimmer",
      { x: "-100%", opacity: 0 },
      { x: "100%", opacity: 0.6, duration: 1.4, ease: "power2.inOut",
        scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" } }
    );
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="py-12 border-y border-border dark:border-border-dark bg-surface dark:bg-surface-dark mt-[-40px] relative z-20 mx-4 sm:mx-8 rounded-3xl shadow-xl shadow-black/5"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative overflow-hidden">
        <div className="stats-shimmer absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-8 text-center sm:text-left">
          {stats.map((stat, i) => (
            <div key={i} className="flex-1 min-w-[120px]">
              <div className="stat-item-inner">
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  {stat.loaded ? (
                    <span className="stat-value text-4xl sm:text-5xl font-black text-foreground drop-shadow-sm" data-value={stat.value}>
                      0
                    </span>
                  ) : (
                    <span className="inline-block w-16 h-10 rounded-lg bg-surface dark:bg-surface-dark animate-pulse" />
                  )}
                  <span className="text-2xl sm:text-3xl font-bold text-primary">{stat.suffix}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-muted uppercase tracking-widest mt-1">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
