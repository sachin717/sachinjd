import axios from "axios";

type FoundLead = {
  name: string;
  profile: string;
  role: string;
  company: string;
  sourceQuery: string;
  email?: string;
};

// const TARGET_COMPANIES = [
//   "Google",
//   "Microsoft",
//   "Amazon",
//   "Meta",
//   "Apple",
//   "Adobe",
//   "Salesforce",
//   "Oracle",
//   "IBM",
//   "Intel",
// ];

// const ROLE_KEYWORDS = [
//   "software engineer",
//   "senior software engineer",
//   "staff software engineer",
//   "engineering manager",
//   "recruiter",
// ];
const TARGET_COMPANIES = ["Google", "Microsoft", "Amazon", "Meta"];
const ROLE_KEYWORDS = ["software engineer", "recruiter"];

function cleanText(value?: string) {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

function extractName(title: string) {
  const clean = cleanText(title);
  return clean.split("-")[0]?.trim() || "Unknown";
}

function extractRole(title: string) {
  const clean = cleanText(title);
  const parts = clean.split("-").map((part) => part.trim()).filter(Boolean);
  return parts[1] || "unknown";
}

function normalizeLinkedInUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
  } catch {
    return url.trim();
  }
}

function isUsefulLinkedInProfile(url: string, title: string) {
  const normalizedUrl = normalizeLinkedInUrl(url);
  const cleanTitle = cleanText(title).toLowerCase();

  if (!normalizedUrl.includes("/in/")) return false;
  if (!cleanTitle) return false;
  if (cleanTitle.includes("sign in")) return false;
  if (cleanTitle.includes("linkedin login")) return false;

  return true;
}

function buildQueries() {
  const queries: { company: string; query: string }[] = [];

  for (const company of TARGET_COMPANIES) {
    for (const role of ROLE_KEYWORDS) {
      queries.push({
        company,
        query: `site:linkedin.com/in "${company}" "${role}"`,
      });
    }
  }

  return queries;
}

export async function findGoogleEmployees(): Promise<FoundLead[]> {
  const apiKey = process.env.SERP_API_KEY;

  if (!apiKey) {
    throw new Error("SERP_API_KEY is missing");
  }

  const allLeads: FoundLead[] = [];
  const seen = new Set<string>();
  const searches = buildQueries();

  for (const item of searches) {
    const { data } = await axios.get("https://serpapi.com/search.json", {
      params: {
        q: item.query,
        api_key: apiKey,
        num: 5,
      },
    });

    const results = data?.organic_results || [];

    for (const result of results) {
      const link = cleanText(result?.link);
      const title = cleanText(result?.title);

      if (!link || !title) continue;
      if (!isUsefulLinkedInProfile(link, title)) continue;

      const normalizedProfile = normalizeLinkedInUrl(link);
      if (seen.has(normalizedProfile)) continue;
      seen.add(normalizedProfile);

      allLeads.push({
        name: extractName(title),
        profile: normalizedProfile,
        role: extractRole(title),
        company: item.company,
        sourceQuery: item.query,
      });
    }
  }

  return allLeads;
}