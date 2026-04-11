import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "IT & Tech Jobs in Lahore 2026 | PakTechJobs",
  description: "Find software engineering and IT jobs in Lahore, Pakistan. Browse the latest tech positions in Lahore.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="Tech Jobs in Lahore — 2026"
      description="Software engineering and IT positions posted by verified Lahore-based companies."
      apiParams="city=Lahore"
      initialLocation="Lahore"
      seoHeading="Tech Jobs in Lahore, Pakistan"
      seoText="PakTechJobs lists the latest software engineering and IT jobs in Lahore. All listings are posted by real recruiters. Browse frontend, backend, full-stack, DevOps, and AI roles in Lahore's growing tech scene."
    />
  );
}
