import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { rateLimitByUser, RATE_LIMITS } from "@/lib/rateLimit";
import { requireVerifiedRecruiter } from "@/lib/requireVerifiedRecruiter";

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = await requireVerifiedRecruiter(session);
  if (guard) return guard;

  const rl = await rateLimitByUser(session!.user.id, RATE_LIMITS.ai);
  if (rl) return rl;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, skills, experienceLevel, jobType, city } = body as Record<string, unknown>;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = `You are an expert technical recruiter writing a job description for a Pakistani tech company.

Write a professional, engaging job description for the following role:
- Title: ${title}
- Skills required: ${Array.isArray(skills) ? skills.join(", ") : "Not specified"}
- Experience level: ${experienceLevel || "Not specified"}
- Job type: ${jobType || "Not specified"}
- Location: ${city || "Pakistan"}

The description should:
1. Start with a compelling 2-3 sentence company/role overview
2. List 5-7 key responsibilities using bullet points
3. List required qualifications and skills
4. List nice-to-have skills
5. Mention any perks or benefits typical for Pakistani tech companies
6. Be 300-500 words total
7. Use professional but approachable tone

Return ONLY the job description text, no extra commentary.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const description = response.text?.trim();
    if (!description) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    return NextResponse.json({ description });
  } catch (error) {
    console.error("[AI generate-job-description] error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
