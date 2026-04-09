import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ReviewType } from "@prisma/client";
import { emitToUser } from "@/lib/socketio";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { receiverId, applicationId, rating, comment } = body;

  if (!receiverId || !rating) return NextResponse.json({ error: "receiverId and rating required" }, { status: 400 });
  if (rating < 1 || rating > 5) return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 });

  // Verify receiver exists
  const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { role: true } });
  if (!receiver) return NextResponse.json({ error: "Receiver not found" }, { status: 404 });

  const type: ReviewType = session.user.role === "APPLICANT"
    ? "APPLICANT_REVIEWS_RECRUITER"
    : "RECRUITER_REVIEWS_APPLICANT";

  // Verify they had an interaction (application)
  if (applicationId) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { applicantId: true, jobPost: { select: { recruiterId: true } } },
    });
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    const isValid = session.user.role === "APPLICANT"
      ? app.applicantId === session.user.id
      : app.jobPost.recruiterId === session.user.id;
    if (!isValid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const review = await prisma.review.create({
    data: {
      giverId: session.user.id,
      receiverId,
      type,
      rating,
      comment: comment || null,
      applicationId: applicationId || null,
    },
  });

  // Notify receiver
  const notification = await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "REVIEW_RECEIVED",
      title: "New Review",
      body: `You received a ${rating}-star review.`,
      data: { reviewId: review.id },
    },
  });

  emitToUser(receiverId, "notification:new", notification);

  return NextResponse.json(review, { status: 201 });
}
