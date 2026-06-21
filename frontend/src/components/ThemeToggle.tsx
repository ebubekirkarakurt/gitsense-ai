"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 100,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: 13,
        color: "var(--color-text)",
      }}
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}