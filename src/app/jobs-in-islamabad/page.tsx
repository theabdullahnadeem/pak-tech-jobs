import type { Metadata } from "next";
import CategoryJobsPage from "@/components/CategoryJobsPage";

export const metadata: Metadata = {
  title: "IT & Tech Jobs in Islamabad 2026 | PakTechJobs",
  description: "Find software engineering and IT jobs in Islamabad, Pakistan. Browse the latest tech positions in Islamabad.",
};

export default function Page() {
  return (
    <CategoryJobsPage
      title="Tech Jobs in Islamabad — 2026"
      description="Software engineering and IT positions posted by verified Islamabad-based companies."
      apiParams="city=Islamabad"
      initialLocation="Islamabad"
      seoHeading="Tech Jobs in Islamabad, Pakistan"
      seoText="PakTechJobs lists the latest software engineering and IT jobs in Islamabad. All listings are posted by real recruiters. Browse frontend, backend, full-stack, DevOps, and AI roles in Islamabad's tech sector."
    />
  );
}
