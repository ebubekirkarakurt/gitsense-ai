"use client";

import { useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [diff, setDiff] = useState("");
  const [suggestions, setSuggestions] = useState<
    { message: string; description: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState<{
    files: number;
    additions: number;
    deletions: number;
    fileNames: string[];
  } | null>(null);

  const { user, loading: authLoading } = useAuth();

  if (authLoading)
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
        },
      );

      if (!response.ok) throw new Error("Sunucu hatası.");

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setStats(data.stats || null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("analyses").insert({
          user_id: user.id,
          title: `Analysis ${new Date().toLocaleDateString()}`,
          diff_text: diff,
          suggestions: data.suggestions,
          stats: data.stats,
        });
      }
    } catch {
      setError(
        "Bir hata oluştu. Backend uyuyor olabilir, 30 saniye sonra tekrar dene.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = !stats && suggestions.length === 0;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Ana içerik */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          gap: 32,
          padding: "40px 48px 120px",
        }}
      >
        {/* Sol */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isEmpty ? (
            // ── BOŞ DURUM ──
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                minHeight: 400,
              }}
            >
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: "var(--color-text)",
                  marginBottom: 8,
                }}
              >
                Merhaba Bekir 👋
              </h1>
              <p style={{ fontSize: 15, color: "var(--color-muted)" }}>
                Bugün neyi commitliyoruz?
              </p>
            </div>
          ) : (
            // ── DOLU DURUM ──
            <>
              {/* Başlık */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 24,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: "var(--color-text)",
                      marginBottom: 4,
                    }}
                  >
                    Analysis Complete
                  </h1>
                  <p style={{ color: "var(--color-muted)", fontSize: 13 }}>
                    Analyzed just now
                  </p>
                </div>

                {suggestions.length > 0 && (
                  <button
                    onClick={() => {
                      const allCommits = suggestions
                        .map((s) => s.message)
                        .join("\n");
                      navigator.clipboard.writeText(allCommits);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Share
                  </button>
                )}
              </div>

              {/* Stats bar */}
              {stats && (
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    padding: "10px 16px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    marginBottom: 20,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: "var(--color-add)" }}>
                    +{stats.additions} additions
                  </span>
                  <span style={{ color: "var(--color-del)" }}>
                    -{stats.deletions} deletions
                  </span>
                  <span
                    style={{ color: "var(--color-muted)", fontWeight: 400 }}
                  >
                    {stats.files} file{stats.files !== 1 ? "s" : ""} changed
                  </span>
                  <span
                    style={{
                      color: "var(--color-muted)",
                      fontWeight: 400,
                      marginLeft: "auto",
                    }}
                  >
                    No breaking changes
                  </span>
                </div>
              )}

              {/* Git Diff */}
              {diff && (
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      Git Diff
                    </h2>
                    <button
                      onClick={() => {
                        setDiff("");
                        setSuggestions([]);
                        setStats(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 12,
                        color: "var(--color-muted)",
                        cursor: "pointer",
                      }}
                    >
                      ✕ Clear
                    </button>
                  </div>
                  <DiffViewer diff={diff} />
                </div>
              )}

              {/* Hata */}
              {error && (
                <div
                  style={{
                    background: "var(--color-del-bg)",
                    border: "1px solid var(--color-del)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    marginBottom: 16,
                    fontSize: 13,
                    color: "var(--color-del)",
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Commit önerileri */}
              {suggestions.length > 0 && (
                <div>
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              background:
                                index === 0
                                  ? "var(--color-accent-bg)"
                                  : "var(--color-border)",
                              color:
                                index === 0
                                  ? "var(--color-accent)"
                                  : "var(--color-muted)",
                              padding: "3px 8px",
                              borderRadius: 4,
                              whiteSpace: "nowrap",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            {index === 0 ? "Recommended" : "Alternative"}
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
                              {suggestion.message}
                            </code>
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--color-muted)",
                                marginTop: 4,
                              }}
                            >
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(suggestion.message, index)}
                          style={{
                            marginLeft: 16,
                            background:
                              copiedIndex === index
                                ? "var(--color-accent)"
                                : "none",
                            border: "1px solid var(--color-border)",
                            borderRadius: 6,
                            padding: "5px 12px",
                            fontSize: 12,
                            color:
                              copiedIndex === index
                                ? "#fff"
                                : "var(--color-muted)",
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
            </>
          )}
        </div>

        {/* Sağ panel — sadece dolu durumda */}
        {!isEmpty && (
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
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
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
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
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
          </div>
        )}
      </div>

      {/* Alt sabit input — ortalanmış */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 220,
          right: 0,
          padding: "16px 48px 24px",
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 640, position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 14,
              padding: "10px 14px",
            }}
          >
            {/* + butonu — dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                +
              </button>

              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 8px)",
                    left: 0,
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    padding: 6,
                    minWidth: 160,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }}
                >
                  <label
                    htmlFor="file-upload"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "var(--color-text)",
                      cursor: "pointer",
                    }}
                  >
                    📎 Add .txt file
                  </label>
                </div>
              )}

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
                  setShowMenu(false);
                }}
              />
            </div>

            <textarea
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              placeholder="Paste your git diff here..."
              rows={1}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 13,
                fontFamily: "monospace",
                color: "var(--color-text)",
                resize: "none",
                lineHeight: 1.5,
                maxHeight: 24,
                overflow: "hidden",
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={loading || !diff}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background:
                  loading || !diff
                    ? "var(--color-muted)"
                    : "var(--color-accent)",
                border: "none",
                cursor: loading || !diff ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              {loading ? (
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
