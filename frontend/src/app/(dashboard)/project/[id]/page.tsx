"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase
        .from("analyses")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]).then(([{ data: project }, { data: analyses }]) => {
      setProject(project);
      setAnalyses(analyses || []);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );

  return (
    <div style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
      {/* Üst bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => window.history.back()}
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 13,
            color: "var(--color-muted)",
          }}
        >
          {"<"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 12, height: 12, borderRadius: "50%",
            background: project?.color, flexShrink: 0,
          }} />
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-text)" }}>
            {project?.name}
          </h1>
        </div>
      </div>

      {/* Analizler */}
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
        Analyses ({analyses.length})
      </p>

      {analyses.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
          No analyses yet. Start by pasting a git diff.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {analyses.map((a) => (
            <Link
              key={a.id}
              href={`/analysis/${a.id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text)", marginBottom: 4 }}>
                  {a.title}
                </p>
                <p style={{ fontSize: 12, color: "var(--color-muted)" }}>
                  {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                <span style={{ color: "var(--color-add)" }}>+{a.stats?.additions}</span>
                <span style={{ color: "var(--color-del)" }}>-{a.stats?.deletions}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}