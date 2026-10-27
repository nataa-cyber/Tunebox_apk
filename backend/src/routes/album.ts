
import { Router } from "express";
import pool from "../db/index.ts";
import authMiddleware from "../middleware/authMiddleware.ts";
import adminMiddleware from "../middleware/adminMiddleware.ts";

const router = Router();

// READ semua album
router.get("/", async (_req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM albums ORDER BY id DESC"
        );

        return res.json({ data: rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil album!"
        });
    }
});

// READ detail album
router.get("/:id", async (req, res) => {
    try {
        const [rows]: any = await pool.execute(
            "SELECT * FROM albums WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Album tidak ditemukan!"
            });
        }

        return res.json({ data: rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil album!"
        });
    }
});

// CREATE album
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { album_name, artist, cover_url } = req.body;

        if (!album_name || !artist) {
            return res.status(400).json({
                message: "Nama album dan artis wajib diisi!"
            });
        }

        const [result]: any = await pool.execute(
            `INSERT INTO albums (album_name, artist, cover_url)
             VALUES (?, ?, ?)`,
            [album_name, artist, cover_url || null]
        );

        return res.status(201).json({
            message: "Album berhasil ditambahkan!",
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal menambahkan album!"
        });
    }
});

// UPDATE album
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { album_name, artist, cover_url } = req.body;

        if (!album_name || !artist) {
            return res.status(400).json({
                message: "Nama album dan artis wajib diisi!"
            });
        }

        const [result]: any = await pool.execute(
            `UPDATE albums
             SET album_name = ?, artist = ?, cover_url = ?
             WHERE id = ?`,
            [album_name, artist, cover_url || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Album tidak ditemukan!"
            });
        }

        return res.json({
            message: "Album berhasil diperbarui!"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal memperbarui album!"
        });
    }
});

// DELETE album
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [result]: any = await pool.execute(
            "DELETE FROM albums WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Album tidak ditemukan!"
            });
        }

        return res.json({
            message: "Album berhasil dihapus!"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal menghapus album!"
        });
    }
});

export default router;
