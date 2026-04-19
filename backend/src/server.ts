import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import commitRouter from "./routes/commit";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/commit", commitRouter);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 CommitSense AI running on http://localhost:${PORT}`);
});