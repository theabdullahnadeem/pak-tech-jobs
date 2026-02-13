import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Jobs in Pakistan — Coming Soon",
  description:
    "Pakistan's dedicated tech job portal is coming soon. Get notified about the latest tech job listings, internships, and remote opportunities.",
  openGraph: {
    title: "Tech Jobs Pakistan — Coming Soon",
    description: "Pakistan's dedicated tech job portal launching soon.",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
