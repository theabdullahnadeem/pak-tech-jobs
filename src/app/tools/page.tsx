"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { tools } from "@/data/tools";

gsap.registerPlugin(ScrollTrigger);

export default function ToolsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const headingTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    headingTl
      .fromTo(".tools-icon-spin",
        { scale: 0, rotation: -360, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
      )
      .fromTo(".tools-heading-text",
        { y: 50, opacity: 0, clipPath: "inset(100% 0 0 0)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 0.9 },
        "-=0.5"
      )
      .fromTo(".tools-heading-desc",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.3"
      );

    const cards = gsap.utils.toArray<HTMLElement>(".tool-item-card");
    cards.forEach((card, i) => {
      const fromX = i % 2 === 0 ? -70 : 70;
      gsap.fromTo(card,
        { x: fromX, y: 50, opacity: 0, scale: 0.88, rotateZ: fromX > 0 ? 3 : -3, rotateX: 8, transformPerspective: 800 },
        {
          x: 0, y: 0, opacity: 1, scale: 1, rotateZ: 0, rotateX: 0,
          duration: 0.75, ease: "power4.out",
          scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="text-center mb-14">
        <div className="tools-icon-spin text-5xl mb-4">🛠️</div>
        <h1 className="tools-heading-text text-3xl sm:text-4xl font-bold mb-4">
          Free <span className="gradient-text">Career Tools</span>
        </h1>
        <p className="tools-heading-desc text-muted max-w-2xl mx-auto text-lg">
          Powerful, fully functional tools to help you plan your tech career, calculate your salary, and improve your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="tool-item-card group relative p-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <span className="text-5xl block mb-5 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500">{tool.icon}</span>
              <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {tool.shortTitle}
              </h2>
              <p className="text-muted text-sm leading-relaxed mb-2">{tool.description}</p>
              <p className="text-xs text-muted mb-4">Free &middot; No sign-up &middot; Instant results</p>
              <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                Try it free <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
