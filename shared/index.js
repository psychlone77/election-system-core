const path = require("path");
const dotenv = require("dotenv");

function loadConfig() {
  // Prefer a .env in the repository root; fall back to process.cwd()
  const envPath = path.resolve(process.cwd(), ".env");
  dotenv.config({ path: envPath });
  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT,
  };
}

const logger = {
  info: (...args) => console.log("[INFO]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

module.exports = { loadConfig, logger };
