import axios from "axios";
import * as cheerio from "cheerio";

type ScrapedJob = {
  title: string;
  link: string;
  location?: string | null;
};

const BLOCKED_TITLES = new Set([
  "job alerts",
  "saved jobs",
  "recommended jobs",
  "job search",
  "sign in",
  "home",
  "search",
]);

function isUsefulJobTitle(title: string) {
  const clean = title.trim().toLowerCase();

  if (!clean) return false;
  if (clean.length < 8) return false;
  if (BLOCKED_TITLES.has(clean)) return false;

  if (
    clean.includes("know your rights") ||
    clean.includes("workplace discrimination") ||
    clean.includes("saved jobs") ||
    clean.includes("recommended jobs") ||
    clean.includes("job alerts") ||
    clean.includes("sign in")
  ) {
    return false;
  }

  return true;
}

function normalizeGoogleLink(link: string) {
  if (link.startsWith("http")) return link;
  if (link.startsWith("/")) return `https://careers.google.com${link}`;
  return `https://careers.google.com/${link}`;
}

export async function scrapeGoogleJobs(): Promise<ScrapedJob[]> {
  const url =
    "https://www.google.com/about/careers/applications/jobs/results/?q=software%20engineer";

  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(data);
  const jobs: ScrapedJob[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const title = $(el).text().replace(/\s+/g, " ").trim();
    const href = $(el).attr("href")?.trim();

    if (!title || !href) return;

    const looksLikeJobLink =
      href.includes("/jobs/results/") ||
      href.includes("/jobs/") ||
      href.includes("applications/jobs");

    if (!looksLikeJobLink) return;
    if (!isUsefulJobTitle(title)) return;

    const fullLink = normalizeGoogleLink(href);
    const key = `${title.toLowerCase()}::${fullLink}`;

    if (seen.has(key)) return;
    seen.add(key);

    jobs.push({
      title,
      link: fullLink,
      location: null,
    });
  });

  return jobs;
}