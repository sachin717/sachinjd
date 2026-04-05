import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const leadId = String(formData.get("leadId") || "");
    const generatedNote = String(formData.get("generatedNote") || "");

    if (!leadId) {
return NextResponse.json({
  success: false,
});

    }

    await prisma.outreachLead.update({
      where: { id: leadId },
      data: {
        generatedNote,
      },
    });

return NextResponse.json({
  success: true,
});
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({
  success: false,
});
  }
}