import Link from "next/link";

const quickLinks = [
  { href: "/salaries", label: "Salary Guides" },
  { href: "/tools", label: "Career Tools" },
  { href: "/resources", label: "Resources" },
  { href: "/courses", label: "Courses" },
  { href: "/jobs", label: "Jobs" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const toolLinks = [
  { href: "/tools/salary-after-tax-calculator", label: "Tax Calculator" },
  { href: "/tools/salary-comparison-tool", label: "Salary Comparison" },
  { href: "/tools/freelance-rate-calculator", label: "Freelance Rates" },
  { href: "/tools/resume-strength-checker", label: "Resume Checker" },
];

export default function Footer() {
  return (
    <footer className="bg-surface-dark text-gray-300 border-t border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-lg text-white">PakTechSalary</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your go-to resource for tech salaries, career tools, and professional growth in Pakistan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Tools
            </h3>
            <ul className="space-y-2">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:paktechhjobs@gmail.com"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  paktechhjobs@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} PakTechSalary. All rights reserved.
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
