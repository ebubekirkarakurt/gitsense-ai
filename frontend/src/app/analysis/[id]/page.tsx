"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DiffViewer } from "@/components/DiffViewer";

export default function AnalysisPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!id) return;

    supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setAnalysis(data);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );

  if (!analysis)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Analysis not found.
      </div>
    );

  return (
    <div style={{ flex: 1, display: "flex", gap: 32, padding: "40px 48px" }}>
      {/* Sol */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Üst bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => window.history.back()}
              style={{
                background: "white",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-text)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {"<"}
            </button>
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--color-text)",
                  marginBottom: 2,
                }}
              >
                {analysis.title}
              </h1>
              <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
                {new Date(analysis.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setShared(true);
              setTimeout(() => setShared(false), 2000);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: shared
                ? "var(--color-accent)"
                : "var(--color-surface)",
              color: shared ? "#fff" : "var(--color-text)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {shared ? "✓ Link Copied!" : "Share"}
          </button>
        </div>

        {/* Diff */}
        <h2
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--color-text)",
            marginBottom: 10,
          }}
        >
          Git Diff
        </h2>
        <DiffViewer diff={analysis.diff_text} />

        {/* Suggestions */}
        <div style={{ marginTop: 24 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 4,
            }}
          >
            AI Commit Suggestions
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-muted)",
              marginBottom: 16,
            }}
          >
            Based on your changes, here are the best conventional commit
            messages.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analysis.suggestions.map((s: any, i: number) => (
              <div
                key={i}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        i === 0
                          ? "var(--color-accent-bg)"
                          : "var(--color-border)",
                      color:
                        i === 0 ? "var(--color-accent)" : "var(--color-muted)",
                      padding: "3px 8px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {i === 0 ? "Recommended" : "Alternative"}
                  </span>
                  <div>
                    <code
                      style={{
                        fontSize: 13,
                        color: "var(--color-text)",
                        fontFamily: "monospace",
                        display: "block",
                      }}
                    >
                      {s.message}
                    </code>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--color-muted)",
                        marginTop: 4,
                      }}
                    >
                      {s.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(s.message)}
                  style={{
                    marginLeft: 16,
                    background: "none",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    padding: "5px 12px",
                    fontSize: 12,
                    color: "var(--color-muted)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağ panel */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          paddingTop: 8,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            Changes
          </p>
          <span
            style={{
              color: "var(--color-add)",
              fontWeight: 600,
              fontSize: 14,
              display: "block",
            }}
          >
            +{analysis.stats?.additions} additions
          </span>
          <span
            style={{
              color: "var(--color-del)",
              fontWeight: 600,
              fontSize: 14,
              display: "block",
            }}
          >
            -{analysis.stats?.deletions} deletions
          </span>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            Files Changed
          </p>
          {analysis.stats?.fileNames?.map((file: string, i: number) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                color: "var(--color-text)",
                fontFamily: "monospace",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "4px 8px",
                display: "block",
                marginBottom: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
