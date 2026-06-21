"use client";

import { useState } from "react";

export default function Home() {
  const [diff, setDiff] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

    setLoading(false);
  };

  return (
    <main className="flex-1 p-10 max-w-3xl mx-auto">
      {/* Başlık */}
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

      {/* Dosya yükleme — gizli input, özel buton */}
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
            reader.onload = (event) => setDiff(event.target?.result as string);
            reader.readAsText(file);
          }}
        />
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
          or paste below
        </span>
      </div>

      {/* Textarea */}
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

      {/* Analiz Et butonu */}
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
    </main>
  );
}
