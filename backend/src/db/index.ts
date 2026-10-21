import mysql from "mysql2/promise";
import "dotenv/config";

const ca = process.env.DB_SSL_CA;

if (!ca) {
  throw new Error("DB_SSL_CA belum diatur di environment");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: ca.replace(/\\n/g, "\n"),
  },

  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
