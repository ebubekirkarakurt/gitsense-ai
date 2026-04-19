const IGNORE = ["package-lock.json", "yarn.lock"];

export function reduceDiff(parsed: any) {
  return {
    files: parsed.files
      .filter((f: any) => !IGNORE.some(i => f.path.includes(i)))
      .map((f: any) => ({
        path: f.path,
        added: f.added,
        removed: f.removed,
        sample: f.changes.slice(0, 10),
      }))
      .slice(0, 10),
  };
}