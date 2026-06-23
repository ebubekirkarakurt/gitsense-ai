"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import { getProjects, createProject } from "@/lib/projects";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Analysis } from "@/types";

function IconChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

function IconPlus() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();
  const [projects, setProjects] = useState<any[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const { user } = useAuth();
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("analyses")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) {
          setRecentAnalyses(
            data.map((a) => ({
              id: a.id,
              title: a.title,
              timeAgo: new Date(a.created_at).toLocaleDateString(),
            })),
          );
        }
      });
  }, [user]);

  const width = collapsed ? 60 : 220;

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await createProject(newProjectName.trim());
      setNewProjectName("");
      setShowNewProject(false);
      loadProjects();
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        overflowX: "hidden",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Logo + toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "18px 0" : "16px 14px 16px 18px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: "var(--color-text)",
            }}
          >
            GitSense
          </span>
        )}
        <button
          onClick={toggle}
          style={{
            background: "none",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "4px 6px",
            cursor: "pointer",
            color: "var(--color-muted)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <IconChevron dir={collapsed ? "right" : "left"} />
        </button>
      </div>

      {/* New Analysis */}
      <div style={{ padding: collapsed ? "12px 8px" : "12px 14px" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 6,
            background: "var(--color-accent)",
            color: "#fff",
            borderRadius: 8,
            padding: collapsed ? "9px 0" : "9px 14px",
            fontSize: 13.5,
            fontWeight: 500,
            textDecoration: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <IconPlus />
          {!collapsed && "New Analysis"}
        </Link>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: collapsed ? "8px 0" : "8px 14px",
        }}
      >
        {/* Projects */}
        {!collapsed && (
          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 6,
                paddingLeft: 10,
              }}
            >
              Projects
            </p>

            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/project/${p.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 7,
                  fontSize: 13.5,
                  color: "var(--color-muted)",
                  textDecoration: "none",
                  marginBottom: 1,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: p.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </span>
              </Link>
            ))}

            {/* Recent Analyses */}
            {!collapsed && recentAnalyses.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                    paddingLeft: 10,
                  }}
                >
                  Recent
                </p>
                {recentAnalyses.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 7,
                      fontSize: 13,
                      color: "var(--color-muted)",
                      marginBottom: 1,
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.title}
                    </span>
                    <span style={{ fontSize: 11 }}>{a.timeAgo}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Yeni proje ekle */}
            {showNewProject ? (
              <div style={{ padding: "4px 10px" }}>
                <input
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateProject();
                    if (e.key === "Escape") setShowNewProject(false);
                  }}
                  placeholder="Project name..."
                  style={{
                    width: "100%",
                    padding: "5px 8px",
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                    outline: "none",
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowNewProject(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--color-muted)",
                  padding: "4px 10px",
                  fontFamily: "inherit",
                }}
              >
                + Add project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom — Logout */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: collapsed ? "12px 0" : "12px 14px",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: collapsed ? "7px 0" : "6px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 7,
            fontSize: 13.5,
            color: "var(--color-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            width: "100%",
            fontFamily: "inherit",
          }}
        >
          <IconLogout />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
