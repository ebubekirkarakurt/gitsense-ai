import Anthropic from "@anthropic-ai/sdk";
import systemPrompt from "../prompt/systemPrompt";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateCommit(data: any) {
  const files = data.files.map((f: any) => f.path).join(", ");

  const diffSummary = data.files
    .map(
      (f: any) =>
        `Dosya: ${f.path}
          Eklenen satırlar: ${f.added}
          Silinen satırlar: ${f.removed}
          Değişiklikler:
          ${f.sample.join("\n")}`,
    )
    .join("\n\n");

  console.log("Diff Summary:\n", diffSummary);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: diffSummary }],
  });

  const block = response.content[0];
  const message = block.type === "text" ? block.text : "";
  const cleaned = message.replace(/```[a-z]*\n?/g, "").trim();

  const suggestions = cleaned
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const clean = line.replace(/^\d+\.\s*/, "").trim();
      const [message, description] = clean.split("|").map((s) => s.trim());
      return { message, description: description || "" };
    });


  //console.log("Generated Commit Message:\n", message);

 return { suggestions };
}
