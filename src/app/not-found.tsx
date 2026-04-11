import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-black text-foreground mb-3">404</h1>
        <p className="text-xl font-semibold text-foreground mb-2">Page not found</p>
        <p className="text-muted mb-8">
          This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/jobs"
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
            Browse Jobs
          </Link>
          <Link href="/"
            className="px-6 py-3 rounded-xl border border-border dark:border-border-dark text-foreground font-semibold hover:bg-surface dark:hover:bg-surface-dark transition-colors">
            Go Home
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          {[
            { href: "/salaries", label: "💰 Salary Guides" },
            { href: "/tools", label: "🛠️ Career Tools" },
            { href: "/internships-pakistan", label: "🎓 Internships" },
            { href: "/remote-jobs", label: "🌍 Remote Jobs" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="text-primary hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
