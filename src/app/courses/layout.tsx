import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Courses — Learn In-Demand Tech Skills",
  description:
    "Browse curated tech courses for Pakistan's digital professionals. MERN Stack, AI/ML, React Native, DevOps, Digital Marketing, and UI/UX Design. Enroll on Coursera, Udemy, or opt for in-person training.",
  openGraph: {
    title: "Digital Courses — Learn In-Demand Tech Skills",
    description: "Curated tech courses for Pakistan's digital professionals.",
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
