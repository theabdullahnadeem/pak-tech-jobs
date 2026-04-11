import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "Fresh Graduate IT Jobs in Pakistan 2026 | PakTechJobs",
  description: "Find entry-level and fresh graduate IT jobs in Pakistan. Junior developer positions for new graduates.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="Fresh Graduate IT Jobs in Pakistan — 2026"
      description="Entry-level and junior positions perfect for fresh graduates, posted by verified Pakistani companies."
      apiParams="experienceLevel=JUNIOR"
      seoHeading="Fresh Graduate IT Jobs in Pakistan"
      seoText="PakTechJobs lists the latest entry-level and fresh graduate IT jobs in Pakistan. All listings are posted by real recruiters. Find junior developer, trainee, and associate positions across Pakistan."
    />
  );
}
