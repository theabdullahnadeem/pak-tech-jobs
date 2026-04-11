import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
}

export function Logo({ className = "", size = "md", variant = "full" }: LogoProps) {
  const sizes = {
    sm: { icon: 22, text: 13, gap: 7 },
    md: { icon: 28, text: 16, gap: 9 },
    lg: { icon: 40, text: 22, gap: 12 },
  };
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center select-none ${className}`} style={{ gap: s.gap }}>
      {/* Icon mark — stylized rocket/arrow pointing up-right inside a rounded square */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rounded square background */}
        <rect width="32" height="32" rx="8" fill="#10b981" />
        {/* Bold upward arrow / growth chart line */}
        <polyline
          points="6,22 12,15 17,18 26,8"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Arrow head at top right */}
        <polyline
          points="21,8 26,8 26,13"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Small dot at bottom left — starting point */}
        <circle cx="6" cy="22" r="2" fill="white" opacity="0.7" />
      </svg>

      {/* Wordmark */}
      {variant === "full" && (
        <span
          style={{ fontSize: s.text, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}
        >
          <span className="text-emerald-500">Pak</span>
          <span className="text-foreground">Tech</span>
          <span className="text-foreground opacity-60" style={{ fontWeight: 500 }}>Jobs</span>
        </span>
      )}
    </span>
  );
}
