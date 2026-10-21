import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.ts";

export default function adminMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    if (!req.user) {
        return res.status(401).json({
            message: "Silakan login terlebih dahulu!"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Akses ditolak! Khusus admin."
        });
    }

    next();
}