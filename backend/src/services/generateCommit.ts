export async function generateCommit(data: any) {
  const files = data.files.map((f: any) => f.path).join(", ");

  return {
    type: "feat",
    scope: null,
    description: `update ${files}`.slice(0, 72),
    breaking: false,
  };
}