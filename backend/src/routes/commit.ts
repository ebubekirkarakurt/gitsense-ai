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
      stats: {
        files: reduced.files.length,
        additions: reduced.files.reduce(
          (sum: number, f: any) => sum + f.added,
          0,
        ),
        deletions: reduced.files.reduce(
          (sum: number, f: any) => sum + f.removed,
          0,
        ),
        fileNames: reduced.files.map((f: any) => f.path),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hata oluştu" });
  }
});

export default router;
