"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  loaded: boolean;
}

export default function StatsBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  const [stats, setStats] = useState<StatItem[]>([
    { label: "Jobs Listed",  value: 0, suffix: "+",  loaded: false },
    { label: "Companies",    value: 0, suffix: "+",  loaded: false },
    { label: "Developers",   value: 0, suffix: "+",  loaded: false },
    { label: "Updated",      value: 24, suffix: "/7", loaded: true  },
  ]);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then((data: { jobs: number; companies: number; developers: number }) => {
        setStats([
          { label: "Jobs Listed",  value: data.jobs       ?? 0, suffix: "+",  loaded: true },
          { label: "Companies",    value: data.companies  ?? 0, suffix: "+",  loaded: true },
          { label: "Developers",   value: data.developers ?? 0, suffix: "+",  loaded: true },
          { label: "Updated",      value: 24,                   suffix: "/7", loaded: true },
        ]);
      })
      .catch(() => {
        // On error still mark as loaded so skeletons disappear
        setStats(prev => prev.map(s => ({ ...s, loaded: true })));
      });
  }, []);

  // Run count-up animations after data is loaded
  useEffect(() => {
    if (!stats.every(s => s.loaded)) return;
    if (animatedRef.current) return;
    animatedRef.current = true;

    // Small delay to let DOM update with new data-value attributes
    setTimeout(() => {
      gsap.utils.toArray<HTMLElement>(".stat-value").forEach((el) => {
        const target = parseInt(el.getAttribute("data-value") || "0", 10);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power3.out",
          onUpdate: () => { el.textContent = Math.round(obj.val).toString(); },
        });
      });
    }, 100);
  }, [stats]);

  useGSAP(() => {
    // Container entrance
    gsap.fromTo(containerRef.current,
      { y: 40, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 90%" } }
    );
    // Stat items stagger
    gsap.fromTo(".stat-item-inner",
      { y: 30, opacity: 0, scale: 0.7 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(2)",
        scrollTrigger: { trigger: containerRef.current, start: "top 85%" } }
    );
    // Shimmer sweep
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
        <div className="stats-shimmer absolute inset-y-0 w-32 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-8 text-center sm:text-left">
          {stats.map((stat, i) => (
            <div key={i} className="flex-1 min-w-[120px]">
              <div className="stat-item-inner">
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  {stat.loaded ? (
                    <span
                      className="stat-value text-4xl sm:text-5xl font-black text-foreground drop-shadow-sm"
                      data-value={stat.value}
                    >
                      {stat.value}
                    </span>
                  ) : (
                    <span className="inline-block w-16 h-10 rounded-lg bg-foreground/10 animate-pulse" />
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
