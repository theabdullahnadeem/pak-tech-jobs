import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "Frontend Developer Jobs in Pakistan 2026 | PakTechJobs",
  description: "Find frontend developer jobs in Pakistan. React, Vue, Angular, and UI/UX positions.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="Frontend Developer Jobs in Pakistan — 2026"
      description="React, Vue, Angular, and UI development positions from verified Pakistani companies."
      apiParams="q=Frontend"
      seoHeading="Frontend Developer Jobs in Pakistan"
      seoText="Browse the latest frontend developer jobs in Pakistan on PakTechJobs. All listings are posted by real recruiters. Find React, Vue, Angular, and UI/UX roles in Lahore, Karachi, Islamabad and remote."
    />
  );
}
