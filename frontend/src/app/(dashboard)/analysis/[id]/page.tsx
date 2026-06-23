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
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    setChatLoading(true);

    const userMsg = { role: "user" as const, content: chatMessage };
    const currentMessage = chatMessage;
    setChatMessage("");
    setChatHistory((prev) => [...prev, userMsg]);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          diff: analysis.diff_text,
          history: chatHistory,
        }),
      },
    );

    const data = await response.json();

    const newHistory = [
      ...chatHistory,
      userMsg,
      { role: "assistant" as const, content: data.reply },
    ];

    setChatHistory(newHistory);

    await supabase
      .from("analyses")
      .update({ chat_history: newHistory })
      .eq("id", id);

    setChatLoading(false);
  };

  useEffect(() => {
    if (!id) return;

    supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setAnalysis(data);

        if (data?.chat_history) {
          setChatHistory(data.chat_history);
        }

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
    <div
      style={{ flex: 1, display: "flex", height: "100vh", overflow: "hidden" }}
    >
      {/* Sol */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
          padding: "40px 48px",
        }}
      >
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
        <div
          style={{
            maxHeight: 300,
            overflowY: "auto",
            borderRadius: 10,
            border: "1px solid var(--color-border)",
          }}
        >
          <DiffViewer diff={analysis.diff_text} />
        </div>

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
        {/* Chat */}
        <div style={{ marginTop: 32 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 0,
            }}
          >
            Ask about this diff
          </p>

          {/* Mesajlar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 100,
            }}
          >
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontSize: 13,
                    background:
                      msg.role === "user"
                        ? "var(--color-accent)"
                        : "var(--color-surface)",
                    color: msg.role === "user" ? "#fff" : "var(--color-text)",
                    border:
                      msg.role === "assistant"
                        ? "1px solid var(--color-border)"
                        : "none",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontSize: 13,
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted)",
                  }}
                >
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 220,
              right: 0,
              padding: "12px 48px 20px",
              background: "var(--color-bg)",
              borderTop: "1px solid var(--color-border)",
              zIndex: 10,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "8px 12px",
                maxWidth: 720,
                margin: "0 auto",
              }}
            >
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChat();
                }}
                placeholder="Bu değişiklik hakkında soru sor..."
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "var(--color-text)",
                }}
              />
              <button
                onClick={handleChat}
                disabled={chatLoading || !chatMessage.trim()}
                style={{
                  background:
                    chatLoading || !chatMessage.trim()
                      ? "var(--color-muted)"
                      : "var(--color-accent)",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
              </button>
            </div>
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
          padding: "40px 24px 40px 0",
          overflowY: "auto",
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
