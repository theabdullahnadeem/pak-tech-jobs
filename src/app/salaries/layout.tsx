import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Salaries in Pakistan 2026 \u2014 All Roles & Cities",
  description:
    "Detailed salary breakdowns for 10+ tech roles across Pakistan. Junior to senior pay scales for MERN, AI, DevOps, cyber security & more. Updated March 2026.",
  openGraph: {
    title: "Tech Salaries in Pakistan 2026 \u2014 All Roles & Cities",
    description:
      "Detailed salary breakdowns for 10+ tech roles across Pakistan. Junior to senior pay scales. Updated March 2026.",
  },
};

export default function SalariesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
