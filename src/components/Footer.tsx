import Link from "next/link";

const browseJobsLinks = [
  { href: "/remote-jobs", label: "Remote Jobs" },
  { href: "/jobs-in-lahore", label: "Lahore Jobs" },
  { href: "/jobs-in-karachi", label: "Karachi Jobs" },
  { href: "/internships-pakistan", label: "Internships" },
  { href: "/fresh-graduate-it-jobs", label: "Fresh Graduate Jobs" },
];

const bySkillLinks = [
  { href: "/react-jobs-pakistan", label: "React Jobs" },
  { href: "/nodejs-jobs-pakistan", label: "Node.js Jobs" },
  { href: "/mern-jobs-pakistan", label: "MERN Jobs" },
  { href: "/ai-jobs-pakistan", label: "AI Jobs" },
  { href: "/devops-jobs-pakistan", label: "DevOps Jobs" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "#", label: "Advertise" },
];

const resourceLinks = [
  { href: "/salaries", label: "Salary Calculators & Guides" },
  { href: "/tools", label: "Developer Tools" },
  { href: "/resources", label: "Career Advice" },
  { href: "/courses", label: "Top Courses" },
];

export default function Footer() {
  return (
    <footer className="bg-surface-dark text-gray-300 border-t border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-lg text-white">PakTechJobs</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Free salary guides, career tools, and resources for tech professionals in Pakistan.
            </p>
            
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
              Tools & Resources
            </h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Browse Jobs */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Browse Jobs
            </h3>
            <ul className="space-y-2">
              {browseJobsLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By Skill */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              By Skill
            </h3>
            <ul className="space-y-2">
              {bySkillLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} PakTechJobs. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
