import { sendMail } from "@/app/lib/mailre";
import { prisma } from "@/app/lib/prisma";

import { NextResponse } from "next/server";

function extractSubjectAndBody(note: string) {
  const subjectMatch = note.match(/Subject:\s*(.+)/i);
  const messageMatch = note.match(/Message:\s*([\s\S]*?)(?:Follow-up:|$)/i);

  const subject =
    subjectMatch?.[1]?.trim() || "Exploring opportunities at your company";

  const body = messageMatch?.[1]?.trim() || note || "Hi, I wanted to connect regarding opportunities.";

  return { subject, body };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const leadId = String(formData.get("leadId") || "").trim();

    if (!leadId) {
   return NextResponse.json({
  success: false,
  lastContacted: "Leadid missing",
});
    }

    const lead = await prisma.outreachLead.findUnique({
      where: { id: leadId },
    });

    if (!lead || !lead.email) {
 return NextResponse.json({
  success: false,
  lastContacted: lead.email+"lead id wrong",
});
    }

    const { subject, body } = extractSubjectAndBody(lead.generatedNote || "");

    await sendMail(lead.email, subject, body);

    await prisma.outreachLead.update({
      where: { id: lead.id },
      data: {
        status: "messaged",
        lastContacted: new Date(),
      },
    });

return NextResponse.json({
  success: true,
  lastContacted: new Date().toISOString(),
});
  } catch (error) {
    console.error("Error sending lead email:", error);

   return NextResponse.json({
  success: false,
  lastContacted: error ,
});
  }
}