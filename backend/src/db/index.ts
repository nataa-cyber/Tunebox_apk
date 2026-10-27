
import mysql from "mysql2/promise";
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const host = process.env.DB_HOST?.trim();
const portValue = process.env.DB_PORT?.trim();
const user = process.env.DB_USER?.trim();
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME?.trim();

const missing = [
  ["DB_HOST", host],
  ["DB_PORT", portValue],
  ["DB_USER", user],
  ["DB_PASSWORD", password],
  ["DB_NAME", database],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  throw new Error(
    `Environment database belum lengkap: ${missing.join(", ")}`
  );
}

const port = Number(portValue);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("DB_PORT tidak valid");
}

const caPath = resolve(process.cwd(), "src", "db", "ca.pem");
const ca = readFileSync(caPath, "utf8");

const pool = mysql.createPool({
  host: host!,
  port,
  user: user!,
  password: password!,
  database: database!,
  ssl: { ca },
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 20000,
});

export default pool;
