import { Router, type Response } from "express";
import multer from "multer";
import { Readable } from "stream";
import pool from "../db/index.ts";
import cloudinary from "../config/cloudinary.ts";
import type { AuthRequest } from "../middleware/authMiddleware.ts";
import authMiddleware from "../middleware/authMiddleware.ts";
import adminMiddleware from "../middleware/adminMiddleware.ts";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            return cb(new Error("Foto harus JPG, PNG, atau WEBP!"));
        }

        cb(null, true);
    }
});

function uploadImage(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "tunebox/profiles" },
            (error, result) => {
                if (error || !result) {
                    return reject(error || new Error("Upload gagal"));
                }

                resolve(result.secure_url);
            }
        );

        Readable.from(buffer).pipe(stream);
    });
}

// GET profil sendiri
router.get(
    "/profile",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const [rows]: any = await pool.execute(
                `SELECT id, username, email, profile_image, role, created_at
                 FROM users WHERE id = ?`,
                [req.user!.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "User tidak ditemukan!"
                });
            }

            return res.json({ data: rows[0] });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Gagal mengambil profil!"
            });
        }
    }
);

// Upload atau ganti foto profil
router.patch(
    "/profile-image",
    authMiddleware,
    upload.single("photo"),
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "Pilih foto terlebih dahulu!"
                });
            }

            const imageUrl = await uploadImage(req.file.buffer);

            await pool.execute(
                "UPDATE users SET profile_image = ? WHERE id = ?",
                [imageUrl, req.user!.id]
            );

            return res.json({
                message: "Foto profil berhasil diperbarui!",
                profile_image: imageUrl
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Gagal mengunggah foto profil!"
            });
        }
    }
);

// Melihat semua user: khusus admin
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    async (_req, res) => {
        try {
            const [rows] = await pool.execute(
                `SELECT id, username, email, profile_image, role, created_at
                 FROM users ORDER BY id DESC`
            );

            return res.json({ data: rows });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Gagal mengambil data user!"
            });
        }
    }
);

export default router;