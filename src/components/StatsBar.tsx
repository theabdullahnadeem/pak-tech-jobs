"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// IMPORTANT: These placeholder numbers and labels should be updated by the site owner 
// once the platform launches with real user/company metrics.
const stats = [
  { label: "Jobs Listed", value: 500, suffix: "+" },
  { label: "Companies", value: 200, suffix: "+" },
  { label: "Developers", value: 50, suffix: "k+" },
  { label: "Updated", value: 24, suffix: "/7" },
];

export default function StatsBar() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    /* ── Container slides up ── */
    gsap.fromTo(containerRef.current,
      { y: 40, opacity: 0, scale: 0.97 },
      {
        y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 90%" },
      }
    );

    /* ── Individual stat items pop in with stagger ── */
    gsap.fromTo(".stat-item-inner",
      { y: 30, opacity: 0, scale: 0.7 },
      {
        y: 0, opacity: 1, scale: 1,
        duration: 0.6, stagger: 0.12, ease: "back.out(2)",
        scrollTrigger: { trigger: containerRef.current, start: "top 85%" },
      }
    );

    /* ── Number count-up with eased snap ── */
    gsap.utils.toArray<HTMLElement>(".stat-value").forEach((el) => {
      const targetValue = parseInt(el.getAttribute("data-value") || "0", 10);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetValue,
        duration: 2.2,
        ease: "power3.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" },
        onUpdate: () => { el.textContent = Math.round(obj.val).toString(); },
      });
    });

    /* ── Shimmer line across the bar ── */
    gsap.fromTo(".stats-shimmer",
      { x: "-100%", opacity: 0 },
      {
        x: "100%", opacity: 0.6, duration: 1.4, ease: "power2.inOut",
        scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" },
      }
    );
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="py-12 border-y border-border dark:border-border-dark bg-surface dark:bg-surface-dark mt-[-40px] relative z-20 mx-4 sm:mx-8 rounded-3xl shadow-xl shadow-black/5"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative overflow-hidden">
        {/* Placeholder Warning Comment for Developer/Owner */}
        {/* TODO: Replace stats values with real API hooks or accurate baseline numbers */}
        
        <div className="stats-shimmer absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-8 text-center sm:text-left">
          {stats.map((stat, i) => (
            <div key={i} className="flex-1 min-w-[120px]">
              <div className="stat-item-inner">
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <span 
                    className="stat-value text-4xl sm:text-5xl font-black text-foreground drop-shadow-sm" 
                    data-value={stat.value}
                  >
                    0
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-primary">{stat.suffix}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-muted uppercase tracking-widiest mt-1">
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
