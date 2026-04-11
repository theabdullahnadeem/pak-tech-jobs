import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.headers.get("x-cron-secret");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    cronSecret === process.env.CRON_SECRET;

  if (!process.env.CRON_SECRET || !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const alerts = await prisma.jobAlert.findMany({
    where: { isActive: true },
    include: { user: { select: { email: true, name: true } } },
  });

  let sent = 0;

  for (const alert of alerts) {
    try {
      const matchingJobs = await prisma.jobPost.findMany({
        where: {
          isActive: true,
          isClosed: false,
          createdAt: { gte: sevenDaysAgo },
          OR: alert.keywords.map(kw => ({
            OR: [
              { title: { contains: kw, mode: "insensitive" } },
              { skills: { has: kw } },
              { description: { contains: kw, mode: "insensitive" } },
            ],
          })),
          ...(alert.city && { city: { contains: alert.city, mode: "insensitive" } }),
          ...(alert.jobType && { jobType: alert.jobType }),
          ...(alert.experienceLevel && { experienceLevel: alert.experienceLevel }),
          ...(alert.salaryMin && { salaryMin: { gte: alert.salaryMin } }),
        },
        select: {
          id: true,
          title: true,
          city: true,
          jobType: true,
          salaryMin: true,
          salaryMax: true,
          recruiter: { select: { companyName: true, name: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      if (matchingJobs.length === 0) continue;

      const jobListHtml = matchingJobs.map(job => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb">
            <a href="https://www.paktechjobs.com/jobs/${job.id}" style="font-weight:600;color:#10b981;text-decoration:none">${job.title}</a><br>
            <span style="color:#6b7280;font-size:13px">${job.recruiter.companyName || job.recruiter.name} · ${job.city} · PKR ${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}</span>
          </td>
        </tr>
      `).join("");

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#10b981">🔔 ${matchingJobs.length} new job${matchingJobs.length > 1 ? "s" : ""} matching your alert</h2>
          <p>Hi ${alert.user.name},</p>
          <p>Here are the latest jobs matching <strong>${alert.keywords.join(", ")}</strong>:</p>
          <table style="width:100%;border-collapse:collapse">
            ${jobListHtml}
          </table>
          <a href="https://www.paktechjobs.com/jobs?q=${encodeURIComponent(alert.keywords[0])}" 
             style="display:inline-block;margin-top:20px;padding:12px 24px;background:#10b981;color:white;border-radius:8px;text-decoration:none;font-weight:600">
            View All Matching Jobs →
          </a>
          <p style="margin-top:24px;color:#6b7280;font-size:12px">
            You're receiving this because you set up a job alert on PakTechJobs.<br>
            <a href="https://www.paktechjobs.com/dashboard/job-alerts" style="color:#10b981">Manage your alerts</a>
          </p>
        </div>
      `;

      await sendEmail({
        to: alert.user.email,
        subject: `${matchingJobs.length} new ${alert.keywords[0]} jobs in Pakistan`,
        html,
      });

      await prisma.jobAlert.update({
        where: { id: alert.id },
        data: { lastTriggeredAt: new Date() },
      });

      sent++;
    } catch {
      // Non-fatal per alert
    }
  }

  return NextResponse.json({ sent, total: alerts.length });
}
