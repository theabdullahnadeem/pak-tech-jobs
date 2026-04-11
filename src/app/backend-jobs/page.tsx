import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "Backend Developer Jobs in Pakistan 2026 | PakTechJobs",
  description: "Find backend developer jobs in Pakistan. Node.js, Python, PHP, Java positions.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="Backend Developer Jobs in Pakistan — 2026"
      description="Node.js, Python, PHP, and Java backend positions from verified Pakistani recruiters."
      apiParams="q=Backend"
      seoHeading="Backend Developer Jobs in Pakistan"
      seoText="Browse the latest backend developer jobs in Pakistan on PakTechJobs. All listings are real jobs posted by verified companies. Find Node.js, Python, PHP, Java, and API development roles across Pakistan."
    />
  );
}
