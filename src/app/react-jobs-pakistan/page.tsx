import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "React Developer Jobs in Pakistan 2026 | PakTechJobs",
  description: "Browse React.js developer jobs in Pakistan. Find frontend and full-stack React positions in Lahore, Karachi, Islamabad and remote.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="React Developer Jobs in Pakistan — 2026"
      description="Browse React.js positions posted by verified recruiters across Pakistan."
      apiParams="q=React"
      seoHeading="React Developer Jobs in Pakistan"
      seoText="Find the latest React.js developer jobs in Pakistan on PakTechJobs. All listings are posted by real companies and recruiters. Browse frontend and full-stack React positions in Lahore, Karachi, Islamabad and remote."
    />
  );
}
