import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "RECRUITER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const jobPostId = searchParams.get("jobPostId");

  const where = jobPostId
    ? { jobPost: { recruiterId: session.user.id }, jobPostId }
    : { jobPost: { recruiterId: session.user.id } };

  const applications = await prisma.application.findMany({
    where,
    select: {
      id: true,
      stage: true,
      submittedAt: true,
      applicantName: true,
      applicantEmail: true,
      applicantPhone: true,
      yearsOfExperience: true,
      coverLetter: true,
      cvFileName: true,
      isWithdrawn: true,
      jobPost: { select: { title: true } },
      applicant: { select: { skills: true, experienceLevel: true, location: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  const headers = ["ID", "Job", "Name", "Email", "Phone", "Experience (years)", "Level", "Skills", "Location", "Stage", "Withdrawn", "Submitted At"];
  const rows = applications.map(a => [
    a.id,
    a.jobPost.title,
    a.applicantName || "",
    a.applicantEmail || "",
    a.applicantPhone || "",
    a.yearsOfExperience?.toString() || "",
    a.applicant.experienceLevel || "",
    a.applicant.skills.join("; "),
    a.applicant.location || "",
    a.stage,
    a.isWithdrawn ? "Yes" : "No",
    new Date(a.submittedAt).toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="applications-${Date.now()}.csv"`,
    },
  });
}
