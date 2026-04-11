import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "IT & Tech Jobs in Karachi 2026 | PakTechJobs",
  description: "Find software engineering and IT jobs in Karachi, Pakistan. Browse the latest tech positions in Karachi.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="Tech Jobs in Karachi — 2026"
      description="Software engineering and IT positions posted by verified Karachi-based companies."
      apiParams="city=Karachi"
      initialLocation="Karachi"
      seoHeading="Tech Jobs in Karachi, Pakistan"
      seoText="PakTechJobs lists the latest software engineering and IT jobs in Karachi. All listings are posted by real recruiters. Browse frontend, backend, full-stack, DevOps, and AI roles in Karachi's tech industry."
    />
  );
}
