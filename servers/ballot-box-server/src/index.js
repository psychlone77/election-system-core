const express = require("express");
const { loadConfig, logger } = require("../../../shared");

loadConfig();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get("/", (req, res) => res.json({ service: "ballot-box-server", status: "running" }));
app.get("/health", (req, res) => res.json({ ok: true }));

// Simple in-memory vote receipt (NOT FOR PRODUCTION)
const votes = [];

app.post("/vote", (req, res) => {
  const { voterId, candidate } = req.body;
  if (!voterId || !candidate)
    return res.status(400).json({ error: "missing voterId or candidate" });

  // In real system you'd check eligibility, prevent double-voting, sign/encrypt, etc.
  const receipt = { voterId, candidate, receivedAt: new Date().toISOString() };
  votes.push(receipt);
  logger.info(`Received vote from ${voterId} for ${candidate}`);
  res.json({ ok: true, receipt });
});

app.get("/votes", (req, res) => res.json({ count: votes.length, votes }));

app.listen(PORT, () => logger.info(`Ballot box server listening on ${PORT}`));
