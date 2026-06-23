"use client";

import { useEffect, useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const [diff, setDiff] = useState("");
  const [suggestions, setSuggestions] = useState<
    { message: string; description: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    files: number;
    additions: number;
    deletions: number;
    fileNames: string[];
  } | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [copiedCmd, setCopiedCmd] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined")
        return localStorage.getItem("selectedProjectId");
      return null;
    },
  );

  useEffect(() => {
    if (!user) return;
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data }) => setProjects(data || []));
    supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setRecentAnalyses(data || []));
  }, [user]);

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
          title: data.title || `Analysis ${new Date().toLocaleDateString()}`,
          diff_text: diff,
          suggestions: data.suggestions,
          stats: data.stats,
          project_id: selectedProjectId,
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
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isEmpty ? "60px 48px 160px" : "40px 48px 160px",
        }}
      >
        {isEmpty ? (
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h1
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                  marginBottom: 10,
                }}
              >
                Merhaba{" "}
                {user?.user_metadata?.full_name || user?.email?.split("@")[0]}{" "}
                👋
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-muted)",
                  marginBottom: 4,
                }}
              >
                Bugün neyi commitliyoruz?
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-muted)",
                  opacity: 0.7,
                }}
              >
                Git diff'ini yapıştır veya dosya yükle, size en iyi commit
                mesajlarını oluşturalım.
              </p>
            </div>

            {/* Composer */}
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 40,
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    width: 180,
                    flexShrink: 0,
                    borderRight: "1px solid var(--color-border)",
                    padding: "24px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "var(--color-accent-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    📄
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--color-text)",
                      textAlign: "center",
                    }}
                  >
                    Diff dosyanızı yükleyin
                  </p>
                  <label
                    htmlFor="file-upload-hero"
                    style={{
                      padding: "5px 14px",
                      borderRadius: 7,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg)",
                      fontSize: 12,
                      color: "var(--color-text)",
                      cursor: "pointer",
                    }}
                  >
                    Dosya Seç
                  </label>
                  <input
                    id="file-upload-hero"
                    type="file"
                    accept=".txt"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = (ev) => setDiff(ev.target?.result as string);
                      r.readAsText(f);
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    flexShrink: 0,
                    fontSize: 12,
                    color: "var(--color-muted)",
                  }}
                >
                  or
                </div>
                <div style={{ flex: 1 }}>
                  {diff ? (
                    <div
                      style={{
                        position: "relative",
                        maxHeight: 200,
                        overflowY: "auto",
                        borderBottom: "1px solid var(--color-border)",
                        width: "78%",
                      }}
                    >
                      <DiffViewer diff={diff} />
                      <button
                        onClick={() => setDiff("")}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 6,
                          padding: "3px 8px",
                          fontSize: 11,
                          color: "var(--color-muted)",
                          cursor: "pointer",
                          zIndex: 1,
                        }}
                      >
                        ✕ Clear
                      </button>
                    </div>
                  ) : (
                    <textarea
                      value={diff}
                      onChange={(e) => setDiff(e.target.value)}
                      placeholder="Git diff'ini buraya yapıştırın..."
                      style={{
                        width: "100%",
                        minHeight: 160,
                        background: "none",
                        border: "none",
                        outline: "none",
                        padding: 16,
                        fontSize: 13,
                        fontFamily: "monospace",
                        color: "var(--color-text)",
                        resize: "none",
                        lineHeight: 1.6,
                      }}
                    />
                  )}
                </div>
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  padding: "10px 16px",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={handleSubmit}
                  disabled={loading || !diff}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 22px",
                    borderRadius: 9,
                    background:
                      loading || !diff
                        ? "var(--color-border)"
                        : "var(--color-accent)",
                    border: "none",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: loading || !diff ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Analiz ediliyor..." : "✦ Analiz Et"}
                </button>
              </div>
            </div>

            {/* 3 kolon */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 20,
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(234,179,8,0.08), rgba(249,115,22,0.08))",
                  border: "1px solid rgba(234,179,8,0.2)",
                  borderRadius: 12,
                  padding: 18,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 24, flexShrink: 0, marginTop: 12 }}>⚡</span>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#f59e0b",
                      marginBottom: 16,
                      marginTop: 12,
                    }}
                  >
                    Backend uyku modunda olabilir!
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--color-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    Backend için ücretsiz tier kullanıldığı için backend 15 dakika
                    işlem yapılmadığında uyku moduna girer. İlk istek{" "}
                    <strong style={{ color: "var(--color-text)" }}>
                      ~30 saniye
                    </strong>{" "}
                    sürebilir. Lütfen bekleyin, yeniden başlatılıyor.
                  </p>
                </div>
              </div>

              {/* Quick Examples */}
              <div
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  padding: 18,
                  gridColumn: "span 2",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-text)",
                    marginBottom: 14,
                  }}
                >
                  ⚡ Quick Examples
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[
                    {
                      cmd: "git diff > changes.txt",
                      desc: "Get all unstaged changes",
                    },
                    {
                      cmd: "git diff --cached > changes.txt",
                      desc: "Get staged changes",
                    },
                    {
                      cmd: "git show HEAD > changes.txt",
                      desc: "Get last commit changes",
                    },
                  ].map((ex, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background: "var(--color-bg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          ⌨️
                        </div>
                        <div>
                          <code
                            style={{
                              fontSize: 12,
                              color: "var(--color-text)",
                              fontFamily: "monospace",
                              display: "block",
                            }}
                          >
                            {ex.cmd}
                          </code>
                          <p
                            style={{
                              fontSize: 11,
                              color: "var(--color-muted)",
                            }}
                          >
                            {ex.desc}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ex.cmd);
                          setCopiedCmd(i);
                          setTimeout(() => setCopiedCmd(null), 2000);
                        }}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: "1px solid var(--color-border)",
                          background:
                            copiedCmd === i ? "var(--color-add-bg)" : "none",
                          fontSize: 11,
                          color:
                            copiedCmd === i
                              ? "var(--color-add)"
                              : "var(--color-muted)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {copiedCmd === i ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DOLU DURUM */
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Başlık */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "var(--color-text)",
                    marginBottom: 4,
                  }}
                >
                  Analysis Complete ✓
                </h1>
                <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
                  🕐 Analyzed just now
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    setDiff("");
                    setSuggestions([]);
                    setStats(null);
                  }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "none",
                    color: "var(--color-muted)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
                {suggestions.length > 0 && (
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        suggestions.map((s) => s.message).join("\n"),
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text)",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    📤 Share
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 28,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13,
                    color: "var(--color-text)",
                  }}
                >
                  {stats.files} file{stats.files !== 1 ? "s" : ""} changed
                </span>
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    background: "var(--color-add-bg)",
                    border: "1px solid rgba(74,222,128,0.2)",
                    fontSize: 13,
                    color: "var(--color-add)",
                    fontWeight: 500,
                  }}
                >
                  +{stats.additions} additions
                </span>
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    background: "var(--color-del-bg)",
                    border: "1px solid rgba(251,113,133,0.2)",
                    fontSize: 13,
                    color: "var(--color-del)",
                    fontWeight: 500,
                  }}
                >
                  -{stats.deletions} deletions
                </span>
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    fontSize: 13,
                    color: "var(--color-muted)",
                    marginLeft: "auto",
                  }}
                >
                  No breaking changes
                </span>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "var(--color-del-bg)",
                  border: "1px solid rgba(251,113,133,0.2)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 20,
                  fontSize: 13,
                  color: "var(--color-del)",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* AI Commit Suggestions */}
            {suggestions.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--color-text)",
                    marginBottom: 4,
                  }}
                >
                  ✦ AI Commit Suggestions
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-muted)",
                    marginBottom: 16,
                  }}
                >
                  Based on your changes, here are the best conventional commit
                  messages.
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--color-surface)",
                        border:
                          i === 0
                            ? "1px solid rgba(124,58,237,0.3)"
                            : "1px solid var(--color-border)",
                        borderRadius: 12,
                        padding: "16px 18px",
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
                            fontWeight: 700,
                            background:
                              i === 0
                                ? "var(--color-accent-bg)"
                                : "var(--color-border)",
                            color:
                              i === 0
                                ? "var(--color-accent)"
                                : "var(--color-muted)",
                            padding: "3px 8px",
                            borderRadius: 5,
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
                              marginBottom: 3,
                            }}
                          >
                            {s.message}
                          </code>
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--color-muted)",
                            }}
                          >
                            {s.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(s.message, i)}
                        style={{
                          marginLeft: 16,
                          background:
                            copiedIndex === i ? "var(--color-add-bg)" : "none",
                          border: "1px solid var(--color-border)",
                          borderRadius: 7,
                          padding: "6px 14px",
                          fontSize: 12,
                          color:
                            copiedIndex === i
                              ? "var(--color-add)"
                              : "var(--color-muted)",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {copiedIndex === i ? "✓ Copied" : "📋 Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Git Diff */}
            {diff && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--color-text)",
                    }}
                  >
                    Git Diff
                  </p>
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
          </div>
        )}
      </div>
    </div>
  );
}
