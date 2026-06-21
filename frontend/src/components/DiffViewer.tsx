export function DiffViewer({ diff }: { diff: string }) {
  const lines = diff.split("\n");

  const fileName =
    lines.find((l) => l.startsWith("diff --git"))?.split(" b/")[1] || "changes";

  let lineNumber = 0;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 12,
        background: "var(--color-surface)",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--color-border)",
          fontSize: 13,
          fontFamily: "monospace",
          color: "var(--color-text)",
          background: "var(--color-surface)",
        }}
      >
        {fileName}
      </div>

      <div
        style={{
          fontFamily: "monospace",
          fontSize: 13,
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: 320,
        }}
      >
        {lines.map((line, i) => {
          const isAdd = line.startsWith("+") && !line.startsWith("+++");
          const isDel = line.startsWith("-") && !line.startsWith("---");
          const isMeta =
            line.startsWith("diff") ||
            line.startsWith("index") ||
            line.startsWith("+++") ||
            line.startsWith("---") ||
            line.startsWith("@@");

          if (!isDel) lineNumber++;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                background: isAdd
                  ? "var(--color-add-bg)"
                  : isDel
                    ? "var(--color-del-bg)"
                    : "transparent",
              }}
            >
              <span
                style={{
                  width: 44,
                  flexShrink: 0,
                  textAlign: "right",
                  paddingRight: 12,
                  color: "var(--color-muted)",
                  userSelect: "none",
                  opacity: 0.6,
                }}
              >
                {isMeta || isDel ? "" : lineNumber}
              </span>
              <span
                style={{
                  flex: 1,
                  color: isAdd
                    ? "var(--color-add)"
                    : isDel
                      ? "var(--color-del)"
                      : "var(--color-muted)",
                  whiteSpace: "pre",
                  paddingRight: 16,
                }}
              >
                {line || " "}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
