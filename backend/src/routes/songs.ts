
import { Router, type Response } from "express";
import pool from "../db/index.ts";
import authMiddleware, {
    type AuthRequest
} from "../middleware/authMiddleware.ts";
import adminMiddleware from "../middleware/adminMiddleware.ts";

const router = Router();

// GET semua lagu
router.get("/", async (_req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT s.*, a.album_name
             FROM songs s
             LEFT JOIN albums a ON s.album_id = a.id
             ORDER BY s.id DESC`
        );

        return res.json({ data: rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil lagu!"
        });
    }
});

// GET detail lagu
router.get("/:id", async (req, res) => {
    try {
        const [rows]: any = await pool.execute(
            `SELECT s.*, a.album_name
             FROM songs s
             LEFT JOIN albums a ON s.album_id = a.id
             WHERE s.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Lagu tidak ditemukan!"
            });
        }

        return res.json({ data: rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil detail lagu!"
        });
    }
});

// CREATE lagu
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const { title, artist, album_id, audio_url, cover_url } = req.body;

            if (!title || !artist) {
                return res.status(400).json({
                    message: "Judul dan artis wajib diisi!"
                });
            }

            const [result]: any = await pool.execute(
                `INSERT INTO songs
                 (title, artist, album_id, audio_url, cover_url)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    title,
                    artist,
                    album_id || null,
                    audio_url || null,
                    cover_url || null
                ]
            );

            return res.status(201).json({
                message: "Lagu berhasil ditambahkan!",
                id: result.insertId
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Gagal menambahkan lagu!"
            });
        }
    }
);

// UPDATE lagu
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { title, artist, album_id, audio_url, cover_url } = req.body;

            if (!title || !artist) {
                return res.status(400).json({
                    message: "Judul dan artis wajib diisi!"
                });
            }

            const [result]: any = await pool.execute(
                `UPDATE songs
                 SET title = ?, artist = ?, album_id = ?,
                     audio_url = ?, cover_url = ?
                 WHERE id = ?`,
                [
                    title,
                    artist,
                    album_id || null,
                    audio_url || null,
                    cover_url || null,
                    req.params.id
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Lagu tidak ditemukan!"
                });
            }

            return res.json({
                message: "Lagu berhasil diperbarui!"
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Gagal memperbarui lagu!"
            });
        }
    }
);

// DELETE lagu
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const [result]: any = await pool.execute(
                "DELETE FROM songs WHERE id = ?",
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Lagu tidak ditemukan!"
                });
            }

            return res.json({
                message: "Lagu berhasil dihapus!"
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Gagal menghapus lagu!"
            });
        }
    }
);

export default router;
