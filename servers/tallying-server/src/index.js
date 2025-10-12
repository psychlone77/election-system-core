import express from "express";
import { loadConfig, logger } from "@election-system/shared";

loadConfig();

const app = express();
const PORT = process.env.PORT || 3003;

app.get("/", (req, res) => res.json({ service: "tallying-server", status: "running" }));
app.get("/health", (req, res) => res.json({ ok: true }));

// Stubbed results endpoint — in a real system you'd aggregate encrypted tallies
app.get("/results", (req, res) => {
  const results = {
    Alice: Math.floor(Math.random() * 100),
    Bob: Math.floor(Math.random() * 100),
    Carol: Math.floor(Math.random() * 100),
  };
  logger.info("Returning stubbed results");
  res.json({ results, generatedAt: new Date().toISOString() });
});

app.listen(PORT, () => logger.info(`Tallying server listening on ${PORT}`));
