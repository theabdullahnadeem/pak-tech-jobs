"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { salaryRoles, formatSalary } from "@/data/salaries";

gsap.registerPlugin(ScrollTrigger);

export default function SalariesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    /* ── Hero heading: clip-path word reveal ── */
    const headingTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    headingTl
      .fromTo(".salary-heading-text",
        { y: 60, opacity: 0, clipPath: "inset(100% 0 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 1 }
      )
      .fromTo(".salary-heading-desc",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.4"
      );

    /* ── Cards: 3D perspective stagger with depth ── */
    gsap.fromTo(".salary-role-card",
      { y: 80, opacity: 0, rotateX: 14, rotateY: -4, scale: 0.88, transformPerspective: 900 },
      {
        y: 0, opacity: 1, rotateX: 0, rotateY: 0, scale: 1,
        duration: 0.75, stagger: { amount: 1, from: "start" }, ease: "power4.out",
        scrollTrigger: { trigger: ".salary-cards-grid", start: "top 82%" },
      }
    );

    /* ── Salary bars animate width on scroll ── */
    gsap.utils.toArray<HTMLElement>(".salary-bar").forEach((bar) => {
      const width = bar.getAttribute("data-width") || "0%";
      gsap.fromTo(bar,
        { width: "0%" },
        {
          width, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: bar, start: "top 90%" },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="text-center mb-14">
        <h1 className="salary-heading-text text-3xl sm:text-4xl font-bold mb-4">
          Software Engineer <span className="gradient-text">Salary in Pakistan</span> 2026
        </h1>
        <p className="salary-heading-desc text-muted max-w-2xl mx-auto text-lg">
          Detailed salary breakdowns for software engineers, MERN developers, cyber security experts, AI engineers, data scientists & more across Lahore, Karachi & Islamabad.
        </p>
      </div>

      <div className="salary-cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {salaryRoles.map((role) => (
          <Link
            key={role.slug}
            href={`/salary/${role.slug}`}
            className="salary-role-card group relative p-7 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💼</span>
                  <div>
                    <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {role.shortTitle}
                    </h2>
                    <span className="text-sm text-muted">{role.city}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted mb-5 line-clamp-2">{role.description}</p>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Junior</span>
                  <span className="font-medium">
                    {formatSalary(role.salaryRange.junior.min)} — {formatSalary(role.salaryRange.junior.max)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Mid-Level</span>
                  <span className="font-medium">
                    {formatSalary(role.salaryRange.mid.min)} — {formatSalary(role.salaryRange.mid.max)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Senior</span>
                  <span className="font-medium text-primary">
                    {formatSalary(role.salaryRange.senior.min)} — {formatSalary(role.salaryRange.senior.max)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {role.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {role.skills.length > 4 && (
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-muted text-xs rounded-full">
                    +{role.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
