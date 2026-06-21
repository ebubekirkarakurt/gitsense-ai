export function DiffViewer({ diff }: { diff: string }) {
  const lines = diff.split("\n");

  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: 16,
        overflowX: "auto",
        overflowY: "auto",
        maxHeight: 300,
        marginBottom: 12,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            color:
              line.startsWith("+") && !line.startsWith("+++")
                ? "var(--color-add)"
                : line.startsWith("-") && !line.startsWith("---")
                  ? "var(--color-del)"
                  : "var(--color-muted)",
            background:
              line.startsWith("+") && !line.startsWith("+++")
                ? "var(--color-add-bg)"
                : line.startsWith("-") && !line.startsWith("---")
                  ? "var(--color-del-bg)"
                  : "transparent",
            padding: "1px 8px",
            whiteSpace: "pre",
          }}
        >
          {line || " "}
        </div>
      ))}
    </div>
  );
}
