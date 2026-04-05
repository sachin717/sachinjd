import { findGoogleEmployees } from "@/app/lib/linkedinFinder";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

function cleanName(name?: string) {
  if (!name) return "Unknown";
  return name.replace(/\s+/g, " ").trim();
}
function guessPriority(role?: string) {
  const r = (role || "").toLowerCase();

  if (r.includes("recruiter")) return 90;
  if (r.includes("engineering manager")) return 88;
  if (r.includes("hiring manager")) return 88;
  if (r.includes("staff")) return 85;
  if (r.includes("senior")) return 80;
  if (r.includes("software engineer")) return 75;

  return 55;
}

export async function GET() {
  try {
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No user found" },
        { status: 400 }
      );
    }

    const people = await findGoogleEmployees();

    let saved = 0;
    let skipped = 0;

    for (const p of people) {
      const linkedinUrl = p.profile?.trim();
      const name = cleanName(p.name);

      if (!linkedinUrl || !linkedinUrl.includes("/in/")) {
        skipped++;
        continue;
      }

      const existing = await prisma.outreachLead.findFirst({
        where: {
          userId: user.id,
          linkedinUrl,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

     await prisma.outreachLead.create({
  data: {
    userId: user.id,
    name,
    linkedinUrl,
    email: p.email || "",
    role: p.role || "unknown",
    company: p.company || "Google",
    source: `SerpApi: ${p.sourceQuery}`,
    priorityScore: guessPriority(p.role),
    status: "new",
    notes: "",
    commonGround: "",
  },
});

      saved++;
    }

    return NextResponse.json({
      success: true,
      found: people.length,
      saved,
      skipped,
    });
  } catch (error) {
    console.error("findEmployees error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to find employees" },
      { status: 500 }
    );
  }
}