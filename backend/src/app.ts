import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.ts";
import usersRoutes from "./routes/users.ts";
import songsRoutes from "./routes/songs.ts";
import albumRoutes from "./routes/album.ts";
import healthRoutes from "./routes/health.ts";
import playlistRoutes from "./routes/playlist.ts";

const app = express();

const allowedOrigins = new Set([
  "http://localhost:3000",
  "https://tunebox-apk.vercel.app",
]);

app.use(
  cors({
    origin: [
      "https://tunebox-apk.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/test-route", (_req, res) => {
  res.json({ message: "Route berhasil!" });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Backend aplikasi musik berhasil berjalan!",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/playlists", playlistRoutes);

export default app;
