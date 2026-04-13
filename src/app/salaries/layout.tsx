import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Software Engineer Salaries in Pakistan 2026 — By City, Role & Experience | PakTechJobs",
  description:
    "Real salary data for software engineers in Pakistan 2026. Compare React, Node.js, AI/ML, DevOps salaries by city and experience level. Updated quarterly.",
  openGraph: {
    title: "Software Engineer Salaries in Pakistan 2026 — By City, Role & Experience | PakTechJobs",
    description:
      "Real salary data for software engineers in Pakistan 2026. Compare React, Node.js, AI/ML, DevOps salaries by city and experience level. Updated quarterly.",
  },
};

export default function SalariesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
