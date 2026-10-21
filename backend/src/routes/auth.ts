
import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../db/index.ts";

const router = Router();

console.log("ROUTE AUTH BERHASIL DIMUAT");

// REGISTER
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body ?? {};

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username, email, dan password wajib diisi!",
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        message: "Format email tidak valid!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter!",
      });
    }

    const [existing]: any = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Email sudah terdaftar!",
      });
    }

    // Simpan password sebagai teks biasa agar terlihat di MySQL.
    await pool.execute(
      `INSERT INTO users (username, email, password)
       VALUES (?, ?, ?)`,
      [cleanUsername, cleanEmail, password]
    );

    return res.status(201).json({
      message: "Register berhasil!",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server!",
    });
  }
});

// LOGIN
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email dan password wajib diisi!",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [rows]: any = await pool.execute(
      `SELECT id, username, email, password, role, profile_image
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah!",
      });
    }

    const user = rows[0];

    // Cocokkan password teks biasa dengan isi database.
    if (password !== user.password) {
      return res.status(401).json({
        message: "Email atau password salah!",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET belum dikonfigurasi!");

      return res.status(500).json({
        message: "Konfigurasi server bermasalah!",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server!",
    });
  }
});

export default router;
