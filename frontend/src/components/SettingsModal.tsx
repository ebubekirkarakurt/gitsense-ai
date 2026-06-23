"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

type Tab = "general" | "appearance" | "language";

export function SettingsModal({
  onClose,
  user,
}: {
  onClose: () => void;
  user: any;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || "",
  );
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  const applyTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    if (t === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light",
      );
    } else {
      document.documentElement.setAttribute("data-theme", t);
    }
  };

  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const updates: any = {
      data: { full_name: fullName },
    };

    if (password) {
      updates.password = password;
    }

    if (email !== user?.email) {
      updates.email = email;
    }

    await supabase.auth.updateUser(updates);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {saved && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#1a7a4a",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            zIndex: 3000,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          ✓ Changes saved
        </div>
      )}
      {/* Modal kutusu */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 680,
          height: 480,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Sol — sekmeler */}
        <div
          style={{
            width: 180,
            borderRight: "1px solid var(--color-border)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "4px 10px",
              marginBottom: 4,
            }}
          >
            Settings
          </p>
          {(["general", "appearance", "language"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                textAlign: "left",
                padding: "7px 10px",
                borderRadius: 7,
                border: "none",
                background:
                  activeTab === tab ? "var(--color-accent-bg)" : "none",
                color:
                  activeTab === tab
                    ? "var(--color-accent)"
                    : "var(--color-muted)",
                fontSize: 13,
                fontWeight: activeTab === tab ? 500 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sağ — içerik */}
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {/* Kapat butonu */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "var(--color-text)",
                textTransform: "capitalize",
              }}
            >
              {activeTab}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                color: "var(--color-muted)",
              }}
            >
              ✕
            </button>
          </div>

          {activeTab === "general" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-text)",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-text)",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Email
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-text)",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
              <button
                onClick={handleSave}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--color-accent)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Save changes
              </button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-muted)",
                  marginBottom: 16,
                }}
              >
                Choose your theme preference.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {(["system", "light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => applyTheme(t)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 8,
                      border:
                        theme === t
                          ? "2px solid var(--color-accent)"
                          : "1px solid var(--color-border)",
                      background:
                        theme === t
                          ? "var(--color-accent-bg)"
                          : "var(--color-bg)",
                      color:
                        theme === t
                          ? "var(--color-accent)"
                          : "var(--color-text)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: theme === t ? 600 : 400,
                      textTransform: "capitalize",
                    }}
                  >
                    {t === "system" ? "🖥️" : t === "light" ? "☀️" : "🌙"} {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-text)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Language
              </label>
              <select
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  fontSize: 14,
                  outline: "none",
                  width: "100%",
                }}
              >
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
