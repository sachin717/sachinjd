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

export default function DashboardActions() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleScrapeGoogleJobs() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/scrapeJobs", {
        method: "GET",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to scrape jobs");
      }

      setMessage(`Google scrape completed. Saved ${data.count ?? 0} jobs.`);
    } catch (error: any) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
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
          style={buttonStyle}
          onClick={handleScrapeGoogleJobs}
          disabled={loading}
        >
          {loading ? "Scraping Google Jobs..." : "Scrape Google Jobs"}
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