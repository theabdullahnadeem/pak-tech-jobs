import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emitToUser } from "@/lib/socketio";

// PATCH /api/admin/recruiters/[id] — Admin only
// Body: { action: "approve" | "reject", reason?: string }
// Requirements: 12.1, 12.3, 12.4
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
      { error: "reason is required when rejecting a recruiter" },
      { status: 400 }
    );
  }

  // Fetch the recruiter
  const recruiter = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, recruiterVerified: true },
  });

  if (!recruiter || recruiter.role !== "RECRUITER") {
    return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
  }

  if (action === "approve") {
    // Requirement 12.3: set recruiterVerified=true and send approval notification
    const [updatedUser, notification] = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { recruiterVerified: true },
        select: {
          id: true,
          email: true,
          name: true,
          companyName: true,
          businessEmail: true,
          recruiterVerified: true,
        },
      });

      const notif = await tx.notification.create({
        data: {
          userId: id,
          type: "RECRUITER_APPROVED",
          title: "Account Approved",
          body: "Your recruiter account has been verified. You can now publish job posts.",
        },
      });

      return [user, notif];
    });

    // Emit real-time notification to the recruiter
    emitToUser(id, "notification:new", notification);

    // Log for badge email (Requirement 12.3 — "Verified Company" badge)
    console.log(
      `[ADMIN] Recruiter ${recruiter.email} approved — send 'Verified Company' badge email`
    );

    return NextResponse.json(updatedUser);
  }

  // action === "reject"
  // Requirement 12.4: notify recruiter with rejection reason
  const notification = await prisma.$transaction(async (tx) => {
    const notif = await tx.notification.create({
      data: {
        userId: id,
        type: "RECRUITER_REJECTED",
        title: "Account Rejected",
        body: `Your recruiter account verification was rejected. Reason: ${(reason as string).trim()}`,
      },
    });

    return notif;
  });

  // Emit real-time notification to the recruiter
  emitToUser(id, "notification:new", notification);

  // Log for rejection email
  console.log(
    `[ADMIN] Recruiter ${recruiter.email} rejected — send rejection email with reason: ${(reason as string).trim()}`
  );

  return NextResponse.json({ message: "Recruiter rejected" });
}
