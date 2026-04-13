import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, { prefix: "salary-submit", limit: 5, windowSeconds: 3600 });
  if (rl) return rl;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { role, city, level, salary, stack, email } = body as Record<string, string>;

  if (!role || !city || !level || !salary) {
    return NextResponse.json({ error: "role, city, level, and salary are required" }, { status: 400 });
  }

  const salaryNum = parseInt(salary, 10);
  if (isNaN(salaryNum) || salaryNum < 10000) {
    return NextResponse.json({ error: "Invalid salary amount" }, { status: 400 });
  }

  // Notify admin with the submission
  await sendEmail({
    to: "paktechhjobs@gmail.com",
    subject: `New Salary Submission: ${role} in ${city}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#10b981">New Salary Data Submission</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Role</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${role}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">City</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${city}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Level</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${level}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Salary (PKR/mo)</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#10b981">PKR ${salaryNum.toLocaleString()}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Tech Stack</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${stack || "Not specified"}</td></tr>
          <tr><td style="padding:8px;color:#6b7280">Submitter Email</td><td style="padding:8px">${email || "Anonymous"}</td></tr>
        </table>
      </div>
    `,
  });

  // Send confirmation to submitter if they provided email
  if (email && email.includes("@")) {
    sendEmail({
      to: email,
      subject: "Thanks for your salary submission — PakTechJobs",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#10b981">Thank you for contributing! 🙏</h2>
          <p>We received your salary data for <strong>${role}</strong> in <strong>${city}</strong>.</p>
          <p>Your submission will be reviewed and added to our salary guides, helping thousands of Pakistani developers make better career decisions.</p>
          <a href="https://www.paktechjobs.com/salaries" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#10b981;color:white;border-radius:8px;text-decoration:none;font-weight:600">View Salary Guides →</a>
          <p style="margin-top:24px;color:#6b7280;font-size:12px">PakTechJobs · Pakistan's #1 Tech Job Board</p>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
