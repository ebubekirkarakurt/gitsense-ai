import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message, diff, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mesaj gerekli." });
    }

    const systemPrompt = `Sen bir git uzmanısın. Kullanıcı sana bir git diff paylaştı ve bu değişiklikler hakkında sorular soruyor.

${diff ? `Git Diff:\n${diff}` : ""}

Kısa, net ve teknik cevaplar ver. Türkçe veya İngilizce — kullanıcının diline göre cevap ver.`;

    const messages = [
      ...(history || []),
      { role: "user" as const, content: message },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const block = response.content[0];
    const reply = block.type === "text" ? block.text : "";

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hata oluştu." });
  }
});

export default router;