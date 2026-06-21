"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "gitsense:sidebar-collapsed";

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return { collapsed, toggle };
}