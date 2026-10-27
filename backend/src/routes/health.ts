import { Router } from "express";
import pool from "../db/index.ts";

const router = Router();

router.get("/db", async (_req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query("SELECT 1");
    connection.release();

    return res.json({ database: "connected" });
  } catch (error) {
    console.error("DB health check failed:", error);

    return res.status(503).json({
      database: "unavailable",
    });
  }
});

export default router;