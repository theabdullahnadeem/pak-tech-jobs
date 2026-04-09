import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emitToUser } from "@/lib/socketio";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { confirmedSlot } = await req.json();

  if (!confirmedSlot) return NextResponse.json({ error: "confirmedSlot required" }, { status: 400 });

  const interview = await prisma.interviewSlot.findUnique({ where: { id } });
  if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (interview.applicantId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const slotDate = new Date(confirmedSlot);
  const isValid = interview.proposedSlots.some(s => new Date(s).getTime() === slotDate.getTime());
  if (!isValid) return NextResponse.json({ error: "Invalid slot selection" }, { status: 400 });

  const updated = await prisma.interviewSlot.update({
    where: { id },
    data: { confirmedSlot: slotDate, status: "CONFIRMED" },
  });

  // Notify recruiter
  const notification = await prisma.notification.create({
    data: {
      userId: interview.recruiterId,
      type: "INTERVIEW_SCHEDULED",
      title: "Interview Confirmed",
      body: `Applicant confirmed the interview slot for ${slotDate.toLocaleString()}.`,
      data: { interviewId: id },
    },
  });

  emitToUser(interview.recruiterId, "notification:new", notification);
  emitToUser(interview.recruiterId, "interview:confirmed", { interviewId: id, confirmedSlot });

  return NextResponse.json(updated);
}
