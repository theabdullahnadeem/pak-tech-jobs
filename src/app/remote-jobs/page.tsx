import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "Remote Developer Jobs in Pakistan 2026 | PakTechJobs",
  description: "Find the best remote software engineering, IT, and tech jobs for Pakistani developers. Work from home with top global companies.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="Remote Developer Jobs in Pakistan — 2026"
      description="Work from anywhere. Browse remote tech jobs posted by verified Pakistani and international companies."
      apiParams="jobType=REMOTE"
      initialLocation="Remote"
      seoHeading="About Remote Developer Jobs in Pakistan"
      seoText="PakTechJobs lists the latest remote software engineering, development, and IT jobs for Pakistani professionals. All listings are posted by real recruiters. Filter by skill, salary, and experience level to find your perfect remote role."
    />
  );
}
