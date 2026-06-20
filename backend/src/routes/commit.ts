import { Router } from "express";

import { parseDiff } from "../services/parseDiff";
import { reduceDiff } from "../services/reduceDiff";
import { generateCommit } from "../services/generateCommit";

const router = Router();

router.post("/", async (req, res) => {
  try {
    if (!req.body.diff) {
      return res.status(400).json({ error: "Diff dosyası gerekli." });
    }

    const rawDiff = req.body.diff;

    const parsed = parseDiff(rawDiff);
    const reduced = reduceDiff(parsed);

    const aiResult = await generateCommit(reduced);

    return res.json({
      suggestions: aiResult.suggestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hata oluştu" });
  }
});

export default router;
