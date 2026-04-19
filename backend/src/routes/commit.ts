import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";

import { parseDiff } from "../services/parseDiff";
import { reduceDiff } from "../services/reduceDiff";
import { generateCommit } from "../services/generateCommit";
import { formatCommit } from "../utils/formatCommit";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("diff"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Diff dosyası gerekli." });
    }

    const rawDiff = await fs.readFile(req.file.path, "utf8");

    const parsed = parseDiff(rawDiff);
    const reduced = reduceDiff(parsed);

    const aiResult = await generateCommit(reduced);

    const commitMessage = formatCommit(aiResult);

    return res.json({
      commitMessage,
      meta: aiResult,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hata oluştu" });
  }
});

export default router;