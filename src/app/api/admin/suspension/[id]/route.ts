import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/admin/suspension/[id] — Admin only
// Body: { action: "lift" | "suspend", reason: string }
// Requirements: 12.8
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

  // reason is always required
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return NextResponse.json(
      { error: "reason is required" },
      { status: 400 }
    );
  }

  if (action !== "lift" && action !== "suspend") {
    return NextResponse.json(
      { error: "action must be 'lift' or 'suspend'" },
      { status: 400 }
    );
  }

  // Fetch the recruiter — must exist and be a RECRUITER
  const recruiter = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });

  if (!recruiter || recruiter.role !== "RECRUITER") {
    return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
  }

  const suspended = action === "suspend";

  await prisma.user.update({
    where: { id },
    data: { suspended },
  });

  // Audit log — Requirement 12.8
  console.log(
    `[AUDIT] Admin ${session.user.id} ${action}ed suspension for recruiter ${recruiter.id} (${recruiter.email}). Reason: ${reason.trim()}`
  );

  return NextResponse.json({
    message: "Suspension updated",
    suspended,
    reason: (reason as string).trim(),
  });
}
