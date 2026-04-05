// app/components/LeadComposer.tsx
"use client";

import { useMemo, useState } from "react";

type Lead = {
  id: string;
  name: string;
  role?: string | null;
  company?: string | null;
  status: string;
  priorityScore?: number | null;
  linkedinUrl?: string | null;
  email?: string | null;
  source?: string | null;
  commonGround?: string | null;
  notes?: string | null;
  generatedNote?: string | null;
  lastContacted?: string | Date | null;
  nextFollowUp?: string | Date | null;
};

export default function LeadComposer({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(lead.generatedNote || "");
  const [email, setEmail] = useState(lead.email || "");
  const [status, setStatus] = useState(lead.status || "new");
  const [lastContacted, setLastContacted] = useState(lead.lastContacted || null);

  const [loading, setLoading] = useState<null | "generate" | "save" | "copy" | "send" | "email" | "messaged" | "replied" | "referred">(null);
  const [toast, setToast] = useState("");

  const previewHtml = useMemo(() => {
    return draft?.trim()
      ? draft
      : `<div style="color:#94a3b8">No draft yet.</div>`;
  }, [draft]);

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function postForm(
    url: string,
    values: Record<string, string>
  ) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : null;

    if (!res.ok) {
      throw new Error(data?.error || "Request failed");
    }

    return data;
  }

  async function handleGenerate() {
    try {
      setLoading("generate");
      const data = await postForm("/api/leads/generate-message", {
        leadId: lead.id,
      });

      if (data?.generatedNote !== undefined) {
        setDraft(data.generatedNote || "");
      }

      showToast("Draft generated");
      setOpen(true);
    } catch (error: any) {
      showToast(error.message || "Generate failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSaveDraft() {
    try {
      setLoading("save");
      await postForm("/api/leads/update-note", {
        leadId: lead.id,
        generatedNote: draft,
      });
      showToast("Draft saved");
    } catch (error: any) {
      showToast(error.message || "Save failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSaveEmail() {
    try {
      setLoading("email");
      await postForm("/api/leads/update-email", {
        leadId: lead.id,
        email,
      });
      showToast("Email saved");
    } catch (error: any) {
      showToast(error.message || "Email save failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleCopy() {
    try {
      setLoading("copy");
      await navigator.clipboard.writeText(draft || "");
      showToast("Copied");
    } catch {
      showToast("Copy failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSend() {
    try {
      setLoading("send");
      const data = await postForm("/api/leads/send-email", {
        leadId: lead.id,
      });

      setStatus("messaged");
      setLastContacted(data?.lastContacted || new Date().toISOString());
      showToast("Email sent");
    } catch (error: any) {
      showToast(error.message || "Send failed");
    } finally {
      setLoading(null);
    }
  }

  async function mark(url: string, nextStatus: string, key: "messaged" | "replied" | "referred") {
    try {
      setLoading(key);
      const data = await postForm(url, { leadId: lead.id });
      setStatus(nextStatus);
      if (data?.lastContacted) setLastContacted(data.lastContacted);
      showToast(`Marked ${nextStatus}`);
    } catch (error: any) {
      showToast(error.message || "Update failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={nameRowStyle}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              style={accordionBtnStyle}
            >
              {open ? "▾" : "▸"}
            </button>

            <div style={{ minWidth: 0 }}>
              <div style={nameStyle}>{lead.name}</div>
              <div style={subStyle}>
                {lead.role || "Unknown role"} • {lead.company || "Unknown company"}
              </div>
            </div>

            <span style={statusPillStyle}>{status.replaceAll("_", " ")}</span>
          </div>
        </div>

        <div style={metaRowStyle}>
          <MiniStat label="Priority" value={String(lead.priorityScore ?? 0)} />
          <MiniStat
            label="Last Contacted"
            value={
              lastContacted
                ? new Date(lastContacted).toLocaleDateString()
                : "-"
            }
          />
          <MiniStat
            label="Next Follow-Up"
            value={
              lead.nextFollowUp
                ? new Date(lead.nextFollowUp).toLocaleDateString()
                : "-"
            }
          />
        </div>

        <div style={topActionBarStyle}>
          <ActionButton
            label={loading === "generate" ? "Generating..." : "Generate"}
            onClick={handleGenerate}
            color="#2563eb"
            disabled={loading !== null}
          />
          <ActionButton
            label={loading === "save" ? "Saving..." : "Save"}
            onClick={handleSaveDraft}
            color="#059669"
            disabled={loading !== null}
          />
          <ActionButton
            label={loading === "copy" ? "Copying..." : "Copy"}
            onClick={handleCopy}
            color="#7c3aed"
            disabled={loading !== null}
          />
          <ActionButton
            label={loading === "send" ? "Sending..." : "Send"}
            onClick={handleSend}
            color={email ? "#dc2626" : "#475569"}
            disabled={!email || loading !== null}
          />
        </div>
      </div>

      {toast ? <div style={toastStyle}>{toast}</div> : null}

      {open ? (
        <div style={bodyGridStyle}>
          <div style={leftPanelStyle}>
            <SectionLabel>Lead Links</SectionLabel>
            {lead.linkedinUrl ? (
              <a
                href={lead.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                Open LinkedIn Profile
              </a>
            ) : (
              <div style={mutedTextStyle}>No LinkedIn profile</div>
            )}

            <SectionLabel>Email Address</SectionLabel>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              style={inputStyle}
            />
            <ActionButton
              label={loading === "email" ? "Saving..." : "Save Email"}
              onClick={handleSaveEmail}
              color="#334155"
              disabled={loading !== null}
              fullWidth
            />

            <SectionLabel>Source</SectionLabel>
            <div style={boxStyle}>{lead.source || "-"}</div>

            <SectionLabel>Common Ground</SectionLabel>
            <div style={boxStyle}>{lead.commonGround || "-"}</div>

            <SectionLabel>Quick Status</SectionLabel>
            <div style={{ display: "grid", gap: 8 }}>
              <ActionButton
                label={loading === "messaged" ? "Updating..." : "Mark Messaged"}
                onClick={() => mark("/api/leads/mark-messaged", "messaged", "messaged")}
                color="#6d28d9"
                disabled={loading !== null}
                fullWidth
              />
              <ActionButton
                label={loading === "replied" ? "Updating..." : "Mark Replied"}
                onClick={() => mark("/api/leads/mark-replied", "replied", "replied")}
                color="#0f766e"
                disabled={loading !== null}
                fullWidth
              />
              <ActionButton
                label={loading === "referred" ? "Updating..." : "Mark Referred"}
                onClick={() => mark("/api/leads/mark-referred", "referred", "referred")}
                color="#ea580c"
                disabled={loading !== null}
                fullWidth
              />
            </div>
          </div>

          <div style={editorPanelStyle}>
            <SectionLabel>HTML Email Draft</SectionLabel>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={18}
              style={textareaStyle}
            />
          </div>

          <div style={previewPanelStyle}>
            <SectionLabel>Preview</SectionLabel>
            <div
              style={previewStyle}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            <SectionLabel>Internal Notes</SectionLabel>
            <div style={boxStyle}>{lead.notes || "-"}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={miniStatStyle}>
      <div style={miniLabelStyle}>{label}</div>
      <div style={miniValueStyle}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={sectionLabelStyle}>{children}</div>;
}

function ActionButton({
  label,
  onClick,
  color,
  disabled,
  fullWidth,
}: {
  label: string;
  onClick: () => void;
  color: string;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...buttonStyle,
        background: color,
        width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {label}
    </button>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 22,
  padding: 20,
};

const headerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.5fr) auto auto",
  gap: 16,
  alignItems: "start",
};

const nameRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const accordionBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#0f172a",
  color: "#e5e7eb",
  cursor: "pointer",
};

const nameStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#f8fafc",
};

const subStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 14,
  lineHeight: 1.5,
  marginTop: 4,
};

const statusPillStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#1f2937",
  color: "#e5e7eb",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "capitalize",
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const miniStatStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: "10px 12px",
  minWidth: 130,
};

const miniLabelStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: 11,
  marginBottom: 4,
};

const miniValueStyle: React.CSSProperties = {
  color: "#f8fafc",
  fontSize: 14,
  fontWeight: 600,
};

const topActionBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "10px 12px",
  color: "white",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const toastStyle: React.CSSProperties = {
  marginTop: 12,
  background: "#0f172a",
  border: "1px solid #1f2937",
  borderRadius: 12,
  padding: "10px 12px",
  color: "#cbd5e1",
  fontSize: 13,
};

const bodyGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "320px minmax(0, 1fr) minmax(0, 0.9fr)",
  gap: 18,
  marginTop: 18,
  alignItems: "start",
};

const leftPanelStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1f2937",
  borderRadius: 18,
  padding: 16,
  display: "grid",
  gap: 12,
};

const editorPanelStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1f2937",
  borderRadius: 18,
  padding: 16,
};

const previewPanelStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1f2937",
  borderRadius: 18,
  padding: 16,
  display: "grid",
  gap: 12,
};

const sectionLabelStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 2,
};

const linkStyle: React.CSSProperties = {
  color: "#60a5fa",
  textDecoration: "none",
  fontWeight: 600,
  wordBreak: "break-word",
};

const mutedTextStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 14,
};

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
  minHeight: 420,
  background: "#020617",
  color: "#e5e7eb",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 14,
  outline: "none",
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  resize: "vertical",
};

const previewStyle: React.CSSProperties = {
  background: "#020617",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 16,
  minHeight: 420,
  overflow: "auto",
};

const boxStyle: React.CSSProperties = {
  background: "#020617",
  border: "1px solid #1f2937",
  borderRadius: 14,
  padding: "12px 14px",
  color: "#cbd5e1",
  minHeight: 48,
  lineHeight: 1.6,
  wordBreak: "break-word",
};