import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Learning Paths for Pakistan — MERN, AI, DevOps & More",
  description:
    "Curated tech learning paths for Pakistan's most in-demand skills. MERN Stack, AI/ML, React Native, DevOps, Digital Marketing, and UI/UX Design courses from top platforms.",
  openGraph: {
    title: "Tech Learning Paths for Pakistan — MERN, AI, DevOps & More",
    description: "Curated tech learning paths for Pakistan's most in-demand skills. Free career guidance included.",
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
