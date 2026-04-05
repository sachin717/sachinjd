export const dynamic = "force-dynamic";
export const revalidate = 0;

import { unstable_noStore as noStore } from "next/cache";
import React from "react";
import AppShell from "@/app/components/AppShell";
import { prisma } from "@/app/lib/prisma";
import CopyButton from "@/app/components/CopyButton";
import LeadComposer from "./LeadsComposer";

const statusOrder = [
  "new",
  "shortlisted",
  "invite_sent",
  "connected",
  "messaged",
  "replied",
  "referred",
  "closed",
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "#1f2937",
        color: "#e5e7eb",
        fontSize: 12,
        fontWeight: 700,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {subtitle ? (
        <div style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>{subtitle}</div>
      ) : null}
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{title}</div>
      {subtitle ? (
        <div style={{ color: "#94a3b8", marginTop: 6, fontSize: 14 }}>{subtitle}</div>
      ) : null}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        color: "#94a3b8",
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {children}
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: "10px 12px",
        minWidth: 0,
      }}
    >
      <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          color: "#e5e7eb",
          fontSize: 14,
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}

export default async function LeadsPage() {
  noStore();

  const user = await prisma.user.findFirst({
    include: {
      outreachLeads: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const leads = user?.outreachLeads ?? [];

  const statusRank = new Map(statusOrder.map((status, index) => [status, index]));

  const sortedLeads = [...leads].sort((a: any, b: any) => {
    const aRank = statusRank.get(a.status) ?? 999;
    const bRank = statusRank.get(b.status) ?? 999;

    if (aRank !== bRank) return aRank - bRank;

    const aPriority = a.priorityScore ?? 0;
    const bPriority = b.priorityScore ?? 0;
    if (aPriority !== bPriority) return bPriority - aPriority;

    return (
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  });

  const countByStatus = (status: string) =>
    leads.filter((lead: any) => lead.status === status).length;

  return (
    <AppShell
      title="Referral Leads"
      subtitle="Lead pipeline, outreach drafting, and follow-up management in one workspace."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SummaryCard title="Total Leads" value={leads.length} />
        <SummaryCard title="New" value={countByStatus("new")} />
        <SummaryCard title="Messaged" value={countByStatus("messaged")} />
        <SummaryCard title="Replied" value={countByStatus("replied")} />
        <SummaryCard title="Referred" value={countByStatus("referred")} />
        <SummaryCard title="Closed" value={countByStatus("closed")} />
      </div>

      <div
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <SectionTitle
          title="Add Lead Manually"
          subtitle="Quickly add people discovered outside the scraper."
        />

        <form
          action="/api/leads/create"
          method="POST"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <input name="name" placeholder="Name" required style={inputStyle} />
          <input name="company" placeholder="Company" required style={inputStyle} />
          <input name="role" placeholder="Role" style={inputStyle} />
          <input name="linkedinUrl" placeholder="LinkedIn URL" style={inputStyle} />
          <input name="email" placeholder="Email" style={inputStyle} />
          <input name="source" placeholder="Source" style={inputStyle} />

          <input
            name="priorityScore"
            placeholder="Priority (0-100)"
            type="number"
            min="0"
            max="100"
            style={inputStyle}
          />
          <select name="status" defaultValue="new" style={inputStyle}>
            <option value="new">New</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="invite_sent">Invite Sent</option>
            <option value="connected">Connected</option>
            <option value="messaged">Messaged</option>
            <option value="replied">Replied</option>
            <option value="referred">Referred</option>
            <option value="closed">Closed</option>
          </select>
          <input name="commonGround" placeholder="Common ground" style={inputStyle} />
          <input
            name="notes"
            placeholder="Notes"
            style={{ ...inputStyle, gridColumn: "span 2" }}
          />

          <button type="submit" style={primaryBtn}>
            Save Lead
          </button>
        </form>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <SectionTitle
          title="Leads Workspace"
          subtitle="Status-sorted cards with email editing, HTML draft editing, and quick actions."
        />

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {statusOrder.map((status) => (
            <div
              key={status}
              style={{
                background: "#0f172a",
                border: "1px solid #1f2937",
                borderRadius: 999,
                padding: "8px 12px",
                color: "#cbd5e1",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {status.replaceAll("_", " ")} · {countByStatus(status)}
            </div>
          ))}
        </div>
      </div>

      {sortedLeads.length === 0 ? (
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 20,
            padding: 28,
            color: "#94a3b8",
          }}
        >
          No leads added yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          {sortedLeads.map((lead: any) => (
           
               <LeadComposer lead={lead}/>

              
          ))}
        </div>
      )}
    </AppShell>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#020617",
  color: "#e5e7eb",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: "12px 14px",
  outline: "none",
  fontSize: 14,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  background: "#020617",
  color: "#e5e7eb",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 14,
  outline: "none",
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const mutedBox: React.CSSProperties = {
  background: "#020617",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: "12px 14px",
  color: "#cbd5e1",
  minHeight: 48,
  lineHeight: 1.6,
  wordBreak: "break-word",
};

const primaryBtn: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 800,
  cursor: "pointer",
};

const successBtn: React.CSSProperties = {
  background: "#059669",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 800,
  cursor: "pointer",
};

function menuBtn(color: string): React.CSSProperties {
  return {
    width: "100%",
    background: color,
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  };
}