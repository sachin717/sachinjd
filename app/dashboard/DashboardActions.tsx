// app/components/DashboardActions.tsx
"use client";

import { useState } from "react";

const btnStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 16px",
  fontWeight: 600,
  cursor: "pointer",
};

export default function DashboardActions() {
  const [loading, setLoading] = useState<string | null>(null);

  async function runAction(name: string, url: string, body?: any) {
    try {
      setLoading(name);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();
      alert(`${name}: ${JSON.stringify(data)}`);
    } catch (err) {
      alert(`${name} failed`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>
        Quick Actions
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <button
          style={btnStyle}
          onClick={() => runAction("Scrape Google Jobs", "/api/scrapeJobs", { platform: "google" })}
        >
          {loading === "Scrape Google Jobs" ? "Running..." : "Scrape Google Jobs"}
        </button>

        <button
          style={btnStyle}
          onClick={() => runAction("Scrape LinkedIn Jobs", "/api/scrapeJobs", { platform: "linkedin" })}
        >
          {loading === "Scrape LinkedIn Jobs" ? "Running..." : "Scrape LinkedIn Jobs"}
        </button>

        <button
          style={btnStyle}
          onClick={() => runAction("Scrape All Jobs", "/api/scrapeJobs", { platform: "all" })}
        >
          {loading === "Scrape All Jobs" ? "Running..." : "Scrape All Jobs"}
        </button>

        <button
          style={btnStyle}
          onClick={() => runAction("Find Employees", "/api/findEmployees")}
        >
          {loading === "Find Employees" ? "Running..." : "Find Employees"}
        </button>

        <button
          style={btnStyle}
          onClick={() => runAction("Generate Messages", "/api/generateMessages")}
        >
          {loading === "Generate Messages" ? "Running..." : "Generate Messages"}
        </button>
      </div>
    </div>
  );
}