
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: "user" | "admin";
    };
}

export default function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Token tidak ditemukan!"
        });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return res.status(500).json({
            message: "JWT_SECRET belum diatur!"
        });
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (
            typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.id !== "number" ||
            (decoded.role !== "user" && decoded.role !== "admin")
        ) {
            return res.status(401).json({
                message: "Isi token tidak valid!"
            });
        }

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch {
        return res.status(401).json({
            message: "Token tidak valid atau kedaluwarsa!"
        });
    }
}
