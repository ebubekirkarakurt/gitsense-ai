"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/hooks/useSidebar";
import type { Project, Analysis } from "@/types";

const PROJECTS: Project[] = [
  { id: "1", name: "GitSense Platform", color: "#2D5BFF", starred: true },
];

const RECENT: Analysis[] = [
  { id: "auth-flow",     title: "Authentication Flow",   timeAgo: "2m ago" },
];

// ── icon paths (inline SVG — no external dependency needed) ─────────────────
function IconGitSense() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function IconChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left"
        ? <path d="M15 18l-6-6 6-6"/>
        : <path d="M9 18l6-6-6-6"/>}
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}


function SectionLabel({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: 11,
      fontWeight: 600,
      color: "var(--color-muted)",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: 6,
      paddingLeft: 10,
    }}>
      {label}
    </p>
  );
}

function NavLink({
  href,
  active,
  children,
  collapsed,
  title,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  collapsed: boolean;
  title?: string;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? title : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: collapsed ? "7px 0" : "6px 10px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 7,
        fontSize: 13.5,
        fontWeight: active ? 500 : 400,
        color: active ? "var(--color-accent)" : "var(--color-muted)",
        background: active ? "var(--color-accent-bg)" : "transparent",
        textDecoration: "none",
        transition: "background 0.15s, color 0.15s",
        marginBottom: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {children}
    </Link>
  );
}


export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();

  const width = collapsed ? 60 : 220;

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
      {/* ── Logo + toggle ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "18px 0" : "16px 14px 16px 18px",
          borderBottom: "1px solid var(--color-border)",
          gap: 8,
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* <div style={{
              width: 28, height: 28,
              background: "var(--color-accent)",
              borderRadius: 7,
              display: "grid", placeItems: "center",
              color: "#fff", flexShrink: 0,
            }}>
              <IconGitSense />
            </div> */}
            <span style={{ fontWeight: 600, fontSize: 15, color: "var(--color-text)" }}>
              GitSense
            </span>
          </div>
        )}

        {/* {collapsed && (
          <div style={{
            width: 28, height: 28,
            background: "var(--color-accent)",
            borderRadius: 7,
            display: "grid", placeItems: "center",
            color: "#fff",
          }}>
            <IconGitSense />
          </div>
        )} */}

        <button
          onClick={toggle}
          title={collapsed ? "Genişlet" : "Daralt"}
          style={{
            background: "none", border: "1px solid var(--color-border)",
            borderRadius: 6, padding: "4px 6px",
            cursor: "pointer", color: "var(--color-muted)",
            display: "grid", placeItems: "center",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          <IconChevron dir={collapsed ? "right" : "left"} />
        </button>
      </div>

      {/* ── New Analysis button ── */}
      <div style={{ padding: collapsed ? "12px 8px" : "12px 14px" }}>
        <Link
          href="/analysis/new"
          title={collapsed ? "Yeni Analiz" : undefined}
          style={{
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 6,
            background: "var(--color-accent)",
            color: "#fff",
            borderRadius: 8, padding: collapsed ? "9px 0" : "9px 14px",
            fontSize: 13.5, fontWeight: 500,
            textDecoration: "none",
            transition: "opacity 0.15s",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <IconPlus />
          {!collapsed && "New Analysis"}
        </Link>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "8px 0" : "8px 14px" }}>

        {/* Projects */}
        {!collapsed && (
          <div style={{ marginBottom: 20 }}>
            <SectionLabel label="Projects" />
            {PROJECTS.map((p) => (
              <NavLink
                key={p.id}
                href={`/projects/${p.id}`}
                active={pathname === `/projects/${p.id}`}
                collapsed={false}
                title={p.name}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: p.color, flexShrink: 0,
                }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </span>
              </NavLink>
            ))}
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12.5, color: "var(--color-muted)",
              padding: "4px 10px", fontFamily: "inherit",
            }}>
              View all projects
            </button>
          </div>
        )}

        {/* Collapsed: project dots */}
        {collapsed && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 16 }}>
            {PROJECTS.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                title={p.name}
                style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: p.color, display: "block",
                }}
              />
            ))}
          </div>
        )}

        {/* Recent Analyses */}
        {!collapsed && (
          <div>
            <SectionLabel label="Recent" />
            {RECENT.map((a) => (
              <NavLink
                key={a.id}
                href={`/analysis/${a.id}`}
                active={pathname === `/analysis/${a.id}`}
                collapsed={false}
                title={a.title}
              >
                <span style={{ flex: 1, overflow: "hidden" }}>
                  <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.title}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 400 }}>
                    {a.timeAgo}
                  </span>
                </span>
              </NavLink>
            ))}
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12.5, color: "var(--color-muted)",
              padding: "4px 10px", fontFamily: "inherit",
            }}>
              View all
            </button>
          </div>
        )}
      </div>

      {/* ── Settings (bottom) ── */}
      <div style={{
        borderTop: "1px solid var(--color-border)",
        padding: collapsed ? "12px 0" : "12px 14px",
      }}>
        <NavLink
          href="/settings"
          active={pathname === "/settings"}
          collapsed={collapsed}
          title="Settings"
        >
          <IconSettings />
          {!collapsed && "Settings"}
        </NavLink>
      </div>
    </aside>
  );
}