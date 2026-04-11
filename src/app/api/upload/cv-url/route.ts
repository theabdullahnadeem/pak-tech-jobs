import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "RECRUITER" && session.user.role !== "APPLICANT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const publicId = req.nextUrl.searchParams.get("publicId");
  if (!publicId) {
    return NextResponse.json({ error: "publicId is required" }, { status: 400 });
  }

  try {
    const url = cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      sign_url: true,
      expires_at: Math.round(Date.now() / 1000) + 3600,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[GET /api/upload/cv-url] error:", err);
    return NextResponse.json(
      { error: "Failed to generate CV download URL" },
      { status: 500 }
    );
  }
}
