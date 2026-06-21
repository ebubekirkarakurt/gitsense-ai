"use client";

import { useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";

export default function Home() {
  const [diff, setDiff] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    files: number;
    additions: number;
    deletions: number;
    fileNames: string[];
  } | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = async () => {
    if (!diff) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/commit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ diff }),
        }
      );

      if (!response.ok) throw new Error("Sunucu hatası.");

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setStats(data.stats || null);
    } catch {
      setError("Bir hata oluştu. Backend uyuyor olabilir, 30 saniye sonra tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ flex: 1, display: "flex", gap: 32, padding: "40px 48px" }}>

      {/* Sol — ana içerik */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Başlık */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>
            {stats ? "Analysis Complete" : "New Analysis"}
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: 13 }}>
            {stats ? "Analyzed just now" : "Paste your git diff or upload a file to generate commit messages."}
          </p>
        </div>

        {/* Stats bar — sadece analiz sonrası */}
        {stats && (
          <div style={{
            display: "flex",
            gap: 24,
            padding: "10px 16px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 600,
          }}>
            <span style={{ color: "var(--color-add)" }}>+{stats.additions} additions</span>
            <span style={{ color: "var(--color-del)" }}>-{stats.deletions} deletions</span>
            <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>{stats.files} file{stats.files !== 1 ? "s" : ""} changed</span>
            <span style={{ color: "var(--color-muted)", fontWeight: 400, marginLeft: "auto" }}>No breaking changes</span>
          </div>
        )}

        {/* Dosya yükleme */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
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
              reader.onload = (event) => setDiff(event.target?.result as string);
              reader.readAsText(file);
            }}
          />
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>or paste below</span>
        </div>

        {/* Diff viewer veya textarea */}
        {diff ? (
          <div style={{ marginBottom: 12 }}>
            <DiffViewer diff={diff} />
            <button
              onClick={() => { setDiff(""); setSuggestions([]); setStats(null); }}
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                color: "var(--color-muted)",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              ✕ Clear
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

        {/* Hata mesajı */}
        {error && (
          <div style={{
            background: "var(--color-del-bg)",
            border: "1px solid var(--color-del)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: "var(--color-del)",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Analyze butonu */}
        <button
          onClick={handleSubmit}
          disabled={loading || !diff}
          style={{
            width: "100%",
            background: loading || !diff ? "var(--color-muted)" : "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 0",
            fontSize: 15,
            fontWeight: 600,
            cursor: loading || !diff ? "not-allowed" : "pointer",
            marginBottom: 32,
            transition: "opacity 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading && (
            <span style={{
              width: 16,
              height: 16,
              border: "2px solid rgba(255,255,255,0.3)",
              borderTop: "2px solid #fff",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.8s linear infinite",
            }} />
          )}
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {/* Commit önerileri */}
        {suggestions.length > 0 && (
          <div>
            <p style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 4,
            }}>
              AI Commit Suggestions
            </p>
            <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 16 }}>
              Based on your changes, here are the best conventional commit messages.
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
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      background: index === 0 ? "var(--color-accent-bg)" : "var(--color-border)",
                      color: index === 0 ? "var(--color-accent)" : "var(--color-muted)",
                      padding: "3px 8px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                      {index === 0 ? "Recommended" : "Alternative"}
                    </span>
                    <code style={{ fontSize: 13, color: "var(--color-text)", fontFamily: "monospace" }}>
                      {suggestion}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopy(suggestion, index)}
                    style={{
                      marginLeft: 16,
                      background: copiedIndex === index ? "var(--color-accent)" : "none",
                      border: "1px solid var(--color-border)",
                      borderRadius: 6,
                      padding: "5px 12px",
                      fontSize: 12,
                      color: copiedIndex === index ? "#fff" : "var(--color-muted)",
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                  >
                    {copiedIndex === index ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sağ — stats panel */}
      <div style={{
        width: 240,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        paddingTop: 8,
      }}>

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Changes
          </p>
          {stats ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ color: "var(--color-add)", fontWeight: 600, fontSize: 14 }}>+{stats.additions} additions</span>
              <span style={{ color: "var(--color-del)", fontWeight: 600, fontSize: 14 }}>-{stats.deletions} deletions</span>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--color-muted)" }}>—</p>
          )}
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Files Changed
          </p>
          {stats ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {stats.fileNames.map((file, i) => (
                <span key={i} style={{
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
                }}>
                  {file}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--color-muted)" }}>No files analyzed yet</p>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)" }} />

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            How to use
          </p>
          <p style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.6 }}>
            Run <code style={{ fontFamily: "monospace", background: "var(--color-surface)", padding: "1px 4px", borderRadius: 4 }}>git diff &gt; changes.txt</code> in your terminal, then upload or paste the output.
          </p>
        </div>

      </div>
    </main>
  );
}