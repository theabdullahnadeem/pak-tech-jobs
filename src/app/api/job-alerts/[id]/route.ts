import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.jobAlert.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ message: "Alert deleted" });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { isActive } = await req.json();

  const alert = await prisma.jobAlert.updateMany({
    where: { id, userId: session.user.id },
    data: { isActive: Boolean(isActive) },
  });

  return NextResponse.json(alert);
}
