import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import commitRouter from "./routes/commit";
import chatRouter from "./routes/chat";



const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/commit", commitRouter);
app.use("/api/chat", chatRouter);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 CommitSense AI running on http://localhost:${PORT}`);
});