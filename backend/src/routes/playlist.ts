
import { Router } from "express";
import pool from "../db/index.ts";
import authMiddleware, {
    type AuthRequest
} from "../middleware/authMiddleware.ts";

const router = Router();

// GET playlist milik user yang sedang login
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT * FROM playlists
             WHERE user_id = ?
             ORDER BY id DESC`,
            [req.user!.id]
        );

        return res.json({ data: rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil playlist!"
        });
    }
});

// CREATE playlist
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { playlist_name } = req.body;

        if (!playlist_name || !playlist_name.trim()) {
            return res.status(400).json({
                message: "Nama playlist wajib diisi!"
            });
        }

        const [result]: any = await pool.execute(
            `INSERT INTO playlists (user_id, playlist_name)
             VALUES (?, ?)`,
            [req.user!.id, playlist_name.trim()]
        );

        return res.status(201).json({
            message: "Playlist berhasil dibuat!",
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal membuat playlist!"
        });
    }
});

// READ detail playlist beserta lagu-lagunya
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const [playlists]: any = await pool.execute(
            `SELECT * FROM playlists
             WHERE id = ? AND user_id = ?`,
            [req.params.id, req.user!.id]
        );

        if (playlists.length === 0) {
            return res.status(404).json({
                message: "Playlist tidak ditemukan!"
            });
        }

        const [songs] = await pool.execute(
            `SELECT s.*
             FROM playlist_songs ps
             JOIN songs s ON ps.song_id = s.id
             WHERE ps.playlist_id = ?`,
            [req.params.id]
        );

        return res.json({
            playlist: playlists[0],
            songs
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil detail playlist!"
        });
    }
});

// UPDATE nama playlist
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { playlist_name } = req.body;

        if (!playlist_name || !playlist_name.trim()) {
            return res.status(400).json({
                message: "Nama playlist wajib diisi!"
            });
        }

        const [result]: any = await pool.execute(
            `UPDATE playlists
             SET playlist_name = ?
             WHERE id = ? AND user_id = ?`,
            [playlist_name.trim(), req.params.id, req.user!.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Playlist tidak ditemukan!"
            });
        }

        return res.json({
            message: "Playlist berhasil diperbarui!"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal memperbarui playlist!"
        });
    }
});

// DELETE playlist
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const [result]: any = await pool.execute(
            `DELETE FROM playlists
             WHERE id = ? AND user_id = ?`,
            [req.params.id, req.user!.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Playlist tidak ditemukan!"
            });
        }

        return res.json({
            message: "Playlist berhasil dihapus!"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal menghapus playlist!"
        });
    }
});

// TAMBAHKAN lagu ke playlist
router.post(
    "/:id/songs",
    authMiddleware,
    async (req: AuthRequest, res) => {
        try {
            const { song_id } = req.body;

            if (!song_id) {
                return res.status(400).json({
                    message: "ID lagu wajib diisi!"
                });
            }

            const [playlists]: any = await pool.execute(
                `SELECT id FROM playlists
                 WHERE id = ? AND user_id = ?`,
                [req.params.id, req.user!.id]
            );

            if (playlists.length === 0) {
                return res.status(404).json({
                    message: "Playlist tidak ditemukan!"
                });
            }

            const [songs]: any = await pool.execute(
                "SELECT id FROM songs WHERE id = ?",
                [song_id]
            );

            if (songs.length === 0) {
                return res.status(404).json({
                    message: "Lagu tidak ditemukan!"
                });
            }

            await pool.execute(
                `INSERT INTO playlist_songs (playlist_id, song_id)
                 VALUES (?, ?)`,
                [req.params.id, song_id]
            );

            return res.status(201).json({
                message: "Lagu berhasil ditambahkan ke playlist!"
            });
        } catch (error: any) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Lagu sudah ada di playlist!"
                });
            }

            console.error(error);
            return res.status(500).json({
                message: "Gagal menambahkan lagu!"
            });
        }
    }
);

// HAPUS lagu dari playlist
router.delete(
    "/:id/songs/:songId",
    authMiddleware,
    async (req: AuthRequest, res) => {
        try {
            const [result]: any = await pool.execute(
                `DELETE ps FROM playlist_songs ps
                 JOIN playlists p ON ps.playlist_id = p.id
                 WHERE p.id = ? AND p.user_id = ?
                 AND ps.song_id = ?`,
                [req.params.id, req.user!.id, req.params.songId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Lagu tidak ditemukan di playlist!"
                });
            }

            return res.json({
                message: "Lagu berhasil dihapus dari playlist!"
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Gagal menghapus lagu dari playlist!"
            });
        }
    }
);

export default router;
