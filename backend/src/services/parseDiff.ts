export function parseDiff(raw: string) {
  const lines = raw.split("\n");

  const files: any[] = [];
  let current: any = null;

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      if (current) files.push(current);

      const match = line.match(/a\/(.+?) b\/(.+)/);

      current = {
        path: match?.[2] || "unknown",
        added: 0,
        removed: 0,
        changes: [],
      };
      continue;
    }

    if (!current) continue;

    if (line.startsWith("+") && !line.startsWith("+++")) {
      current.added++;
      current.changes.push(line);
    }

    if (line.startsWith("-") && !line.startsWith("---")) {
      current.removed++;
      current.changes.push(line);
    }
  }

  if (current) files.push(current);

  return { files };
}