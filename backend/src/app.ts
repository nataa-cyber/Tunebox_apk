
import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.ts";
import usersRoutes from "./routes/users.ts";
import songsRoutes from "./routes/songs.ts";
import albumRoutes from "./routes/album.ts";
import playlistRoutes from "./routes/playlist.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/test-route", (_req, res) => {
    res.json({ message: "Route berhasil!" });
});

// Cek server
app.get("/", (_req, res) => {
    res.json({
        message: "Backend aplikasi musik berhasil berjalan!"
    });
});

// Hubungkan semua route
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/playlists", playlistRoutes);

export default app;
