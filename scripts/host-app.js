/**
 * cPanel / host entrypoint.
 * Loads .env, binds 0.0.0.0, then starts Next standalone server.
 * Set Application startup file to: app.js
 */
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, ".env"));
loadEnvFile(path.join(__dirname, ".env.local"));

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
if (!process.env.PORT) process.env.PORT = "3000";

const pass = (process.env.ADMIN_PASSWORD || "").trim();
const secret = (process.env.ADMIN_SESSION_SECRET || "").trim();
if (!pass || pass.length < 12 || !secret || secret.length < 24 || secret === pass) {
  console.error(
    "[raxinshop] Missing/weak ADMIN_PASSWORD or ADMIN_SESSION_SECRET in .env. App will not serve admin login correctly.",
  );
  console.error(
    "[raxinshop] Set both in .env (password >= 12 chars, secret >= 24 chars, different from each other).",
  );
}

require("./server.js");
