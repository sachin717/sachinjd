import { prisma } from "@/app/lib/prisma";
import { generateLeadMessage } from "@/app/lib/ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const leadId = String(formData.get("leadId") || "").trim();

    if (!leadId) {
      return new Response(null, {
  status: 303,
  headers: {
    Location: "/leads",
  },
});
    }

    const user = await prisma.user.findFirst({
      include: {
        profile: true,
        roleProfiles: true,
      },
    });

    if (!user || !user.profile) {
      return new Response(null, {
  status: 303,
  headers: {
    Location: "/leads",
  },
});
    }

    const preferredRole =
      user.roleProfiles.find((role:any) => role.preferred) || user.roleProfiles[0];

    if (!preferredRole) {
      return new Response(null, {
  status: 303,
  headers: {
    Location: "/leads",
  },
});
    }

    const lead = await prisma.outreachLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return new Response(null, {
  status: 303,
  headers: {
    Location: "/leads",
  },
});
    }

    const generatedNote = await generateLeadMessage({
      candidateName: user.profile.fullName,
      candidateHeadline: user.profile.headline || "",
      candidateSummary: user.profile.summary || "",
      preferredRoleTitle: preferredRole.title,
      preferredRoleSummary: preferredRole.summary || "",
      leadName: lead.name,
      leadCompany: lead.company,
      leadRole: lead.role,
      commonGround: lead.commonGround,
      notes: lead.notes,
    });

    await prisma.outreachLead.update({
      where: { id: lead.id },
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
    console.error("Error generating lead message:", error);
    return NextResponse.json(
      { error: "Failed to generate lead message" },
      { status: 500 }
    );
  }
}