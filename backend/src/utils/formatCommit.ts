export function formatCommit(c: any) {
  return `${c.type}${c.scope ? `(${c.scope})` : ""}: ${c.description}`;
}