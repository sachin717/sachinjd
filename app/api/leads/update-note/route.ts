import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const leadId = String(formData.get("leadId") || "");
    const generatedNote = String(formData.get("generatedNote") || "");

    if (!leadId) {
      return new Response(null, {
  status: 303,
  headers: {
    Location: "/leads",
  },
});
    }

    await prisma.outreachLead.update({
      where: { id: leadId },
      data: {
        generatedNote,
      },
    });

    return new Response(null, {
  status: 303,
  headers: {
    Location: "/leads",
  },
});
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}