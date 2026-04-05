"use client";

import { useState } from "react";

const buttonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  padding: "12px 16px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#059669",
};

export default function DashboardActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function runAction(name: string, url: string) {
    try {
      setLoading(name);
      setMessage("");

      const res = await fetch(url, {
        method: "GET",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `${name} failed`);
      }

      if (name === "Scrape Leads") {
        setMessage(
          `Lead scrape completed. Found ${data.found ?? 0}, saved ${data.saved ?? 0}, skipped ${data.skipped ?? 0}.`
        );
      } else {
        setMessage(`${name} completed successfully.`);
      }
    } catch (error: any) {
      setMessage(error.message || "Something went wrong");
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

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          style={secondaryButtonStyle}
          onClick={() => runAction("Scrape Leads", "/api/findEmployees")}
          disabled={loading !== null}
        >
          {loading === "Scrape Leads" ? "Scraping Leads..." : "Scrape Leads"}
        </button>

        <button
          style={buttonStyle}
          onClick={() => runAction("Scrape Google Jobs", "/api/scrapeJobs")}
          disabled={loading !== null}
        >
          {loading === "Scrape Google Jobs"
            ? "Scraping Google Jobs..."
            : "Scrape Google Jobs"}
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: 14,
            color: "#cbd5e1",
            background: "#1f2937",
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}