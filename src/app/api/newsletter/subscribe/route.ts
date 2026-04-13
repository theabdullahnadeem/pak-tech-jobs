import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Rate limit: 3 subscriptions per hour per IP
  const rl = await rateLimit(req, { prefix: "newsletter", limit: 3, windowSeconds: 3600, message: "Too many subscription attempts." });
  if (rl) return rl;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, skill, jobType } = body as Record<string, string>;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Send welcome email to subscriber
  const welcomeHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#10b981">Welcome to PakTechJobs Weekly! 🎉</h2>
      <p>You're now subscribed to Pakistan's best tech job digest.</p>
      <p>Every week you'll receive curated <strong>${skill || "tech"}</strong> jobs${jobType && jobType !== "Both" ? ` (${jobType.toLowerCase()})` : ""} straight to your inbox.</p>
      <h3 style="color:#10b981">While you wait, explore now:</h3>
      <ul>
        <li><a href="https://www.paktechjobs.com/jobs" style="color:#10b981">Browse all current jobs →</a></li>
        <li><a href="https://www.paktechjobs.com/salaries" style="color:#10b981">Check salary guides →</a></li>
        <li><a href="https://www.paktechjobs.com/tools/resume-strength-checker" style="color:#10b981">Check your resume strength →</a></li>
      </ul>
      <p style="margin-top:24px;color:#6b7280;font-size:12px">
        PakTechJobs · Pakistan's #1 Tech Job Board<br>
        <a href="https://www.paktechjobs.com" style="color:#10b981">paktechjobs.com</a>
      </p>
    </div>
  `;

  // Send welcome email to subscriber (non-blocking)
  sendEmail({
    to: email,
    subject: "Welcome to PakTechJobs Weekly — Pakistan's Best Tech Jobs",
    html: welcomeHtml,
  }).catch(() => {});

  // Also notify admin
  sendEmail({
    to: "paktechhjobs@gmail.com",
    subject: `New Newsletter Subscriber: ${email}`,
    html: `<p>New subscriber: <strong>${email}</strong><br>Skill: ${skill || "Not specified"}<br>Job type: ${jobType || "Not specified"}</p>`,
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
