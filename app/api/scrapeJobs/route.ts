import { scrapeGoogleJobs } from "@/app/lib/jobScraper";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "No user found. Please create your profile first.",
        },
        { status: 400 }
      );
    }

    const jobs = await scrapeGoogleJobs();

    let saved = 0;
    let skipped = 0;

    for (const job of jobs) {
      const existing = await prisma.job.findFirst({
        where: {
          userId: user.id,
          title: job.title,
          company: "Google",
          link: job.link ?? null,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.job.create({
        data: {
          userId: user.id,
          title: job.title,
          company: "Google",
          location: job.location ?? null,
          source: "google",
          link: job.link ?? null,
          status: "discovered",
        },
      });

      saved++;
    }

    return NextResponse.json({
      success: true,
      scraped: jobs.length,
      saved,
      skipped,
      userId: user.id,
    });
  } catch (error) {
    console.error("scrapeJobs error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to scrape Google jobs",
      },
      { status: 500 }
    );
  }
}