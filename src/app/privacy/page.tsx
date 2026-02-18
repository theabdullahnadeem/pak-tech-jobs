import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for PakTechJobs — Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Policy</h1>
      <p className="text-sm text-muted mb-10">Last updated: February 13, 2026</p>

      <div className="prose-custom space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
          <p className="text-muted leading-relaxed">
            Welcome to PakTechJobs (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website paktechjobs.com (the &quot;Site&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>
          <h3 className="text-lg font-semibold mb-2 text-primary">2.1 Information You Provide</h3>
          <ul className="list-disc ml-5 space-y-1.5 text-muted">
            <li>Resume text submitted to our Resume Strength Checker tool for analysis</li>
            <li>Email address if you subscribe to our newsletter or job alerts</li>
            <li>Contact information if you reach out to us via email or WhatsApp</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 mt-4 text-primary">2.2 Information Collected Automatically</h3>
          <ul className="list-disc ml-5 space-y-1.5 text-muted">
            <li>Device information (browser type, operating system, screen resolution)</li>
            <li>Usage data (pages visited, time spent, click patterns)</li>
            <li>IP address and approximate location</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc ml-5 space-y-1.5 text-muted">
            <li>To provide, maintain, and improve our website and tools</li>
            <li>To analyze resume text using AI (Google Gemini) for the Resume Strength Checker — your resume text is sent to Google&apos;s AI API for analysis and is not stored permanently on our servers</li>
            <li>To send you newsletters, career updates, or promotional materials (with your consent)</li>
            <li>To analyze website traffic and usage patterns using Google Analytics</li>
            <li>To display personalized advertisements through Google AdSense</li>
            <li>To respond to your inquiries and provide customer support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Third-Party Services</h2>
          <p className="text-muted leading-relaxed mb-3">We use the following third-party services:</p>
          <ul className="list-disc ml-5 space-y-1.5 text-muted">
            <li><strong>Google Analytics</strong> — for traffic analysis and user behavior tracking</li>
            <li><strong>Google AdSense</strong> — for displaying advertisements on our site</li>
            <li><strong>Google Gemini AI</strong> — for analyzing resume text in our Resume Strength Checker tool</li>
            <li><strong>Vercel</strong> — for hosting and serving our website</li>
            <li><strong>Cloudflare</strong> — for CDN, DNS, and security services</li>
          </ul>
          <p className="text-muted leading-relaxed mt-3">
            These services may collect information about you in accordance with their own privacy policies. We encourage you to review their respective privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Cookies</h2>
          <p className="text-muted leading-relaxed">
            We use cookies and similar technologies to enhance your experience, analyze traffic, and serve personalized ads. You can control cookie preferences through your browser settings. By continuing to use our site, you consent to our use of cookies.
          </p>
          <ul className="list-disc ml-5 space-y-1.5 text-muted mt-3">
            <li><strong>Essential Cookies</strong> — required for the site to function properly</li>
            <li><strong>Analytics Cookies</strong> — help us understand how visitors use our site</li>
            <li><strong>Advertising Cookies</strong> — used by Google AdSense to display relevant ads</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Data Security</h2>
          <p className="text-muted leading-relaxed">
            We implement industry-standard security measures to protect your personal information, including HTTPS encryption, secure hosting, and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Data Retention</h2>
          <p className="text-muted leading-relaxed">
            Resume text submitted for analysis is processed in real-time and is not permanently stored on our servers. Analytics data is retained in accordance with Google Analytics&apos; data retention policies. Email addresses provided for newsletters are retained until you unsubscribe.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Your Rights</h2>
          <p className="text-muted leading-relaxed mb-3">You have the right to:</p>
          <ul className="list-disc ml-5 space-y-1.5 text-muted">
            <li>Request access to personal data we hold about you</li>
            <li>Request correction or deletion of your personal data</li>
            <li>Opt out of marketing communications at any time</li>
            <li>Disable cookies through your browser settings</li>
            <li>Request that we stop processing your personal data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">9. Children&apos;s Privacy</h2>
          <p className="text-muted leading-relaxed">
            Our Site is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">10. Changes to This Policy</h2>
          <p className="text-muted leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Your continued use of the Site after any changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">11. Contact Us</h2>
          <p className="text-muted leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-disc ml-5 space-y-1.5 text-muted mt-2">
            <li>Email: <a href="mailto:paktechhjobs@gmail.com" className="text-primary hover:underline">paktechhjobs@gmail.com</a></li>
            <li>Website: <a href="/" className="text-primary hover:underline">paktechjobs.com</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
