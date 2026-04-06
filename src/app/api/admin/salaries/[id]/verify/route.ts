import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emitToUser } from "@/lib/socketio";

// PATCH /api/admin/salaries/[id]/verify — Admin only
// Body: { action: "approve" | "reject", reason?: string }
// Requirements: 12.5, 12.6, 12.7
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, reason } = body as Record<string, unknown>;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  if (action === "reject" && (!reason || typeof reason !== "string" || !reason.trim())) {
    return NextResponse.json(
      { error: "reason is required when rejecting a salary entry" },
      { status: 400 }
    );
  }

  // Fetch the salary entry
  const entry = await prisma.salaryEntry.findUnique({
    where: { id },
    select: { id: true, submittedById: true, verificationStatus: true },
  });

  if (!entry) {
    return NextResponse.json({ error: "Salary entry not found" }, { status: 404 });
  }

  if (action === "approve") {
    // Requirement 12.6: set verificationStatus=VERIFIED, include in aggregations
    const [updatedEntry, notification] = await prisma.$transaction(async (tx) => {
      const updated = await tx.salaryEntry.update({
        where: { id },
        data: {
          verificationStatus: "VERIFIED",
          reviewedAt: new Date(),
        },
      });

      const notif = await tx.notification.create({
        data: {
          userId: entry.submittedById,
          type: "SALARY_APPROVED",
          title: "Salary Entry Approved",
          body: "Your salary entry has been verified and is now included in salary aggregations.",
        },
      });

      return [updated, notif];
    });

    // Emit real-time notification to the submitter
    emitToUser(entry.submittedById, "notification:new", notification);

    return NextResponse.json(updatedEntry);
  }

  // action === "reject"
  // Requirement 12.7: remove from pending queue (set REJECTED), notify submitter
  const notification = await prisma.$transaction(async (tx) => {
    await tx.salaryEntry.update({
      where: { id },
      data: {
        verificationStatus: "REJECTED",
        reviewedAt: new Date(),
      },
    });

    const notif = await tx.notification.create({
      data: {
        userId: entry.submittedById,
        type: "SALARY_REJECTED",
        title: "Salary Entry Rejected",
        body: `Your salary entry was rejected. Reason: ${(reason as string).trim()}`,
      },
    });

    return notif;
  });

  // Emit real-time notification to the submitter
  emitToUser(entry.submittedById, "notification:new", notification);

  return NextResponse.json({ message: "Salary entry rejected" });
}
