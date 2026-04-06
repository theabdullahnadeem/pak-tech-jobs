import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "APPLICANT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { jobPostId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { jobPostId } = body;
  if (!jobPostId) {
    return NextResponse.json({ error: "jobPostId is required" }, { status: 400 });
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `${session.user.id}_${jobPostId}_${timestamp}`;
    const folder = `cvs/${session.user.id}`;

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, public_id: publicId, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      public_id: publicId,
    });
  } catch (err) {
    console.error("[POST /api/upload/cv-signature] error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
