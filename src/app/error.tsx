"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.error(error);
    if (!ref.current) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl
      .fromTo(ref.current.querySelector(".err-icon"), { scale: 0 }, { scale: 1, duration: 0.7, ease: "back.out(2)" })
      .fromTo(ref.current.querySelector(".err-title"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .fromTo(ref.current.querySelector(".err-text"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.3")
      .fromTo(ref.current.querySelector(".err-btns"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");
  }, [error]);

  return (
    <div ref={ref} className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="err-icon text-8xl mb-6">⚠️</div>
        <h1 className="err-title text-3xl font-black text-foreground mb-3">Something went wrong</h1>
        <p className="err-text text-muted mb-8">
          We hit an unexpected error. Our team has been notified. Please try again.
        </p>
        <div className="err-btns flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset}
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 hover:-translate-y-0.5 transition-all">
            Try Again
          </button>
          <Link href="/"
            className="px-6 py-3 rounded-xl border border-border dark:border-border-dark text-foreground font-semibold hover:bg-surface dark:hover:bg-surface-dark hover:-translate-y-0.5 transition-all">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
