import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "DevOps Jobs in Pakistan 2026 | PakTechJobs",
  description: "Find DevOps, cloud, and infrastructure jobs in Pakistan. AWS, Docker, Kubernetes positions.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="DevOps & Cloud Jobs in Pakistan — 2026"
      description="AWS, Docker, Kubernetes, and CI/CD positions from verified Pakistani recruiters."
      apiParams="q=DevOps"
      seoHeading="DevOps Jobs in Pakistan"
      seoText="Browse the latest DevOps, cloud, and infrastructure jobs in Pakistan on PakTechJobs. All listings are real jobs posted by verified recruiters. Find AWS, Docker, Kubernetes, and CI/CD roles across Pakistan."
    />
  );
}
