import mysql from "mysql2/promise";
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const host = process.env.DB_HOST?.trim();
const port = Number(process.env.DB_PORT?.trim());
const user = process.env.DB_USER?.trim();
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME?.trim();

if (!host || !port || !user || !password || !database) {
  throw new Error("Konfigurasi database belum lengkap");
}

const ca = readFileSync(resolve(process.cwd(), "ca.pem"), "utf8");

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  ssl: { ca },
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 20000,
});

export default pool;
