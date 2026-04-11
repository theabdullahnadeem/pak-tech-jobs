"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function NotFound() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl
      .fromTo(".nf-icon", { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2)" })
      .fromTo(".nf-title", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.3")
      .fromTo(".nf-text", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
      .fromTo(".nf-btns", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.3")
      .fromTo(".nf-link", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 }, "-=0.2");
  }, { scope: ref });

  return (
    <div ref={ref} className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="nf-icon text-8xl mb-6">🔍</div>
        <h1 className="nf-title text-4xl font-black text-foreground mb-3">404</h1>
        <p className="nf-text text-xl font-semibold text-foreground mb-2">Page not found</p>
        <p className="nf-text text-muted mb-8">
          This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="nf-btns flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/jobs"
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 hover:-translate-y-0.5 transition-all">
            Browse Jobs
          </Link>
          <Link href="/"
            className="px-6 py-3 rounded-xl border border-border dark:border-border-dark text-foreground font-semibold hover:bg-surface dark:hover:bg-surface-dark hover:-translate-y-0.5 transition-all">
            Go Home
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          {[
            { href: "/salaries", label: "💰 Salary Guides" },
            { href: "/tools", label: "🛠️ Career Tools" },
            { href: "/internships-pakistan", label: "🎓 Internships" },
            { href: "/remote-jobs", label: "🌍 Remote Jobs" },
          ].map(link => (
            <Link key={link.href} href={link.href} className="nf-link text-primary hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
