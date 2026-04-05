import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const leadId = String(formData.get("leadId") || "").trim();
    const email = String(formData.get("email") || "").trim();

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          error: "leadId is required",
        },
        { status: 400 }
      );
    }

    await prisma.outreachLead.update({
      where: { id: leadId },
      data: {
        email: email || null,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("update-email error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}