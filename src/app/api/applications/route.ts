import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emitToUser } from "@/lib/socketio";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "APPLICANT") {
    return NextResponse.json(
      { error: "Only applicants can submit applications" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    jobPostId,
    applicantName,
    applicantEmail,
    applicantPhone,
    yearsOfExperience,
    coverLetter,
    cvPublicId,
    cvFileName,
  } = body as Record<string, unknown>;

  if (!jobPostId || typeof jobPostId !== "string") {
    return NextResponse.json({ error: "jobPostId is required" }, { status: 400 });
  }

  // Fetch job with requiredFields and recruiter info
  const job = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
    select: {
      id: true,
      isActive: true,
      isClosed: true,
      requiredFields: true,
      recruiter: { select: { id: true, avgResponseTimeHours: true } },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job post not found" }, { status: 404 });
  }

  if (!job.isActive) {
    return NextResponse.json(
      { error: "This job post is inactive and no longer accepting applications." },
      { status: 400 }
    );
  }

  if (job.isClosed) {
    return NextResponse.json(
      { error: "This job post has been closed and no longer accepting applications." },
      { status: 400 }
    );
  }

  // Validate required fields based on job config
  const fieldErrors: Record<string, string> = {};
  const required = job.requiredFields ?? ["name", "email"];

  if (required.includes("name") && (!applicantName || typeof applicantName !== "string" || !applicantName.trim())) {
    fieldErrors.applicantName = "Full name is required";
  }
  if (required.includes("email") && (!applicantEmail || typeof applicantEmail !== "string" || !applicantEmail.trim())) {
    fieldErrors.applicantEmail = "Email is required";
  }
  if (required.includes("phone") && (!applicantPhone || typeof applicantPhone !== "string" || !applicantPhone.trim())) {
    fieldErrors.applicantPhone = "Phone number is required";
  }
  if (required.includes("yearsOfExperience") && (yearsOfExperience === undefined || yearsOfExperience === null)) {
    fieldErrors.yearsOfExperience = "Years of experience is required";
  }
  if (required.includes("coverLetter") && (!coverLetter || typeof coverLetter !== "string" || !coverLetter.trim())) {
    fieldErrors.coverLetter = "Cover letter is required";
  }
  if (required.includes("cv") && (!cvPublicId || typeof cvPublicId !== "string")) {
    fieldErrors.cvPublicId = "CV upload is required";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: "Missing required fields", fields: fieldErrors }, { status: 400 });
  }

  const applicantId = session.user.id;

  // Check for duplicate application
  const existing = await prisma.application.findUnique({
    where: { jobPostId_applicantId: { jobPostId, applicantId } },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already applied to this job post." },
      { status: 409 }
    );
  }

  const avgResponseTimeHours = job.recruiter.avgResponseTimeHours;
  const responseTimeText =
    avgResponseTimeHours != null
      ? `The recruiter typically responds within ${avgResponseTimeHours} hour(s).`
      : "The recruiter's average response time is not yet available.";

  const [application, confirmationNotification] = await prisma.$transaction(async (tx) => {
    const newApplication = await tx.application.create({
      data: {
        jobPostId,
        applicantId,
        applicantName: typeof applicantName === "string" ? applicantName.trim() : undefined,
        applicantEmail: typeof applicantEmail === "string" ? applicantEmail.trim() : undefined,
        applicantPhone: typeof applicantPhone === "string" ? applicantPhone.trim() : undefined,
        yearsOfExperience: typeof yearsOfExperience === "number" ? yearsOfExperience : undefined,
        coverLetter: typeof coverLetter === "string" ? coverLetter.trim() : undefined,
        cvPublicId: typeof cvPublicId === "string" ? cvPublicId : undefined,
        cvFileName: typeof cvFileName === "string" ? cvFileName : undefined,
      },
    });

    const notification = await tx.notification.create({
      data: {
        userId: applicantId,
        type: "APPLICATION_STATUS_CHANGE",
        title: "Application Submitted",
        body: `Your application has been submitted successfully. ${responseTimeText}`,
        data: {
          applicationId: newApplication.id,
          jobPostId,
          avgResponseTimeHours,
        },
      },
    });

    return [newApplication, notification];
  });

  emitToUser(applicantId, "notification:new", confirmationNotification);

  return NextResponse.json(application, { status: 201 });
}

export async function GET(_req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId, role } = session.user;

  try {
    if (role === "APPLICANT") {
      const applications = await prisma.application.findMany({
        where: { applicantId: userId },
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          stage: true,
          submittedAt: true,
          updatedAt: true,
          rejectionReason: true,
          recruiterNotes: true,
          jobPost: {
            select: {
              id: true,
              title: true,
              city: true,
              location: true,
              jobType: true,
              experienceLevel: true,
              salaryMin: true,
              salaryMax: true,
              isActive: true,
              isClosed: true,
              recruiter: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  responseRate: true,
                  avgResponseTimeHours: true,
                  recruiterVerified: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(applications);
    }

    if (role === "RECRUITER") {
      const applications = await prisma.application.findMany({
        where: { jobPost: { recruiterId: userId } },
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          stage: true,
          submittedAt: true,
          updatedAt: true,
          jobPost: {
            select: {
              id: true,
              title: true,
              city: true,
              location: true,
            },
          },
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              skills: true,
              experienceLevel: true,
              location: true,
            },
          },
        },
      });

      return NextResponse.json(applications);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("[GET /api/applications] error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
