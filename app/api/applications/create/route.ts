import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const jobId = String(formData.get("jobId") || "").trim();
    const status = String(formData.get("status") || "ready").trim();
    const resumeUsed = String(formData.get("resumeUsed") || "").trim();
    const introNote = String(formData.get("introNote") || "").trim();

    if (!jobId) {
      return new Response(null, {
  status: 303,
  headers: {
    Location: "/applications",
  },
});
    }

    const user = await prisma.user.findFirst();

    if (!user) {
      return new Response(null, {
  status: 303,
  headers: {
    Location: "/applications",
  },
});
    }

    await prisma.application.create({
      data: {
        userId: user.id,
        jobId,
        status,
        resumeUsed: resumeUsed || null,
        introNote: introNote || null,
        appliedAt: status === "applied" ? new Date() : null,
      },
    });

    return new Response(null, {
  status: 303,
  headers: {
    Location: "/applications",
  },
});
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}