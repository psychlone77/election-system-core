import { resolve } from "path";
import { config } from "dotenv";

function loadConfig() {
  // Prefer a .env in the repository root; fall back to process.cwd()
  const envPath = resolve(process.cwd(), ".env");
  config({ path: envPath });
  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT,
  };
}

const logger = {
  info: (...args) => console.log("[INFO]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

export { loadConfig, logger };
