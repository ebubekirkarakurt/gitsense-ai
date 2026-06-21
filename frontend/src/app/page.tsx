"use client";

import { useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";

export default function Home() {
  const [diff, setDiff] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<{
    files: number;
    additions: number;
    deletions: number;
    fileNames: string[];
  } | null>(null);

  const handleSubmit = async () => {
    if (!diff) return;
    setLoading(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/commit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diff }),
      },
    );

    const data = await response.json();
    setSuggestions(data.suggestions || []);
    setStats(data.stats || null);

    setLoading(false);
  };

  return (
    <main style={{ flex: 1, display: "flex", gap: 32, padding: "40px 48px" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "var(--color-text)" }}
          >
            Analyze Changes
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: 14 }}>
            Paste your git diff or upload a file to generate commit messages.
          </p>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <label
            htmlFor="file-upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-muted)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            📎 Upload .txt file
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".txt"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) =>
                setDiff(event.target?.result as string);
              reader.readAsText(file);
            }}
          />
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
            or paste below
          </span>
        </div>

        {diff ? (
          <div style={{ marginBottom: 12 }}>
            <DiffViewer diff={diff} />
            <button
              onClick={() => setDiff("")}
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                color: "var(--color-muted)",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              ✕ Temizle
            </button>
          </div>
        ) : (
          <textarea
            value={diff}
            onChange={(e) => setDiff(e.target.value)}
            placeholder="git diff çıktısını buraya yapıştır..."
            style={{
              width: "100%",
              height: 220,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: 16,
              fontSize: 13,
              fontFamily: "monospace",
              color: "var(--color-text)",
              resize: "none",
              outline: "none",
              marginBottom: 12,
            }}
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !diff}
          style={{
            width: "100%",
            background:
              loading || !diff ? "var(--color-muted)" : "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 0",
            fontSize: 15,
            fontWeight: 600,
            cursor: loading || !diff ? "not-allowed" : "pointer",
            marginBottom: 32,
            transition: "opacity 0.15s",
          }}
        >
          {loading ? "Analiz ediliyor..." : "Analyze"}
        </button>

        {/* Commit önerileri */}
        {suggestions.length > 0 && (
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-muted)",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              AI Commit Suggestions
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
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
                  <div>
                    {index === 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: "var(--color-accent-bg)",
                          color: "var(--color-accent)",
                          padding: "2px 8px",
                          borderRadius: 4,
                          marginBottom: 6,
                          display: "inline-block",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Recommended
                      </span>
                    )}
                    <code
                      style={{
                        display: "block",
                        fontSize: 13,
                        color: "var(--color-add)",
                        fontFamily: "monospace",
                      }}
                    >
                      {suggestion}
                    </code>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(suggestion)}
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
        )}
      </div>
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
          {stats ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  color: "var(--color-add)",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                +{stats.additions} additions
              </span>
              <span
                style={{
                  color: "var(--color-del)",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                -{stats.deletions} deletions
              </span>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--color-muted)" }}>—</p>
          )}
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
          {stats ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {stats.fileNames.map((file, i) => (
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
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
              No files analyzed yet
            </p>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)" }} />

        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            How to use
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-muted)",
              lineHeight: 1.6,
            }}
          >
            Run{" "}
            <code
              style={{
                fontFamily: "monospace",
                background: "var(--color-surface)",
                padding: "1px 4px",
                borderRadius: 4,
              }}
            >
              git diff &gt; changes.txt
            </code>{" "}
            in your terminal, then upload or paste the output.
          </p>
        </div>
      </div>
    </main>
  );
}
