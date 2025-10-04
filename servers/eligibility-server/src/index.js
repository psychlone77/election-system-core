const express = require("express");
const { loadConfig, logger } = require("../../../shared");

// Load environment variables (from root .env or server .env if present)
loadConfig();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req, res) => res.json({ service: "eligibility-server", status: "running" }));
app.get("/health", (req, res) => res.json({ ok: true }));

// Simple eligibility check (stubbed): even-length voterId => eligible
app.post("/check", (req, res) => {
  const { voterId } = req.body;
  if (!voterId) return res.status(400).json({ error: "missing voterId" });

  const eligible = String(voterId).length % 2 === 0;
  logger.info(`Eligibility check for ${voterId}: ${eligible}`);
  res.json({ voterId, eligible });
});

app.listen(PORT, () => logger.info(`Eligibility server listening on ${PORT}`));
