import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact PakTechJobs — Feedback, Data & Partnerships",
  description: "Contact PakTechJobs for salary data feedback, bug reports, course inquiries, or partnership opportunities.",
  openGraph: {
    title: "Contact PakTechJobs — Feedback, Data & Partnerships",
    description: "Get in touch with the PakTechJobs team for salary data, feedback, bugs, or partnership inquiries.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
