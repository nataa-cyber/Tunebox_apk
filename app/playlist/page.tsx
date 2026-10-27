"use client";

import { useEffect, useState } from "react";
import { Music, Trash2 } from "lucide-react";
import AudioPlayer from "@/app/components/AudioPlayer";

type Playlist = {
  id: number;
  name?: string;
  title?: string;
};

type Song = {
  id: number;
  title: string;
  artist?: string;
  audio_url?: string | null;
};

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://tunebox-apk-p2st.vercel.app/api"
).replace(/\/+$/, "");

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selected, setSelected] = useState<Playlist | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [choosingSongs, setChoosingSongs] = useState(false);

  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Silakan login terlebih dahulu.");
    }

    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      console.error(
        `Endpoint ${API}${path} mengembalikan respons non-JSON. Status: ${response.status}`,
      );

      throw new Error(
        `Endpoint API tidak ditemukan atau tidak mengembalikan JSON (${response.status}). Periksa route backend: ${path}`,
      );
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Permintaan gagal.");
    }

    return result.data ?? result;
  }

  async function loadPlaylists() {
    try {
      const data = await request<Playlist[] | { playlists: Playlist[] }>(
        "/playlists",
      );

      const items = Array.isArray(data) ? data : data.playlists;

      setPlaylists(Array.isArray(items) ? items : []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal memuat playlist.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlaylists();
  }, []);

  async function createPlaylist(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const playlistName = name.trim();

    if (!playlistName) {
      setMessage("Nama playlist wajib diisi.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      await request("/playlists", {
        method: "POST",
        body: JSON.stringify({ playlist_name: playlistName }),
      });

      setName("");
      setMessage("Playlist berhasil dibuat!");
      await loadPlaylists();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal membuat playlist.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function openPlaylist(playlist: Playlist) {
    setSelected(playlist);
    setSongs([]);
    setChoosingSongs(false);
    setMessage("Memuat lagu playlist...");

    try {
      const data = await request<{
        playlist: {
          id: number;
          playlist_name: string;
        };
        songs: Song[];
      }>(`/playlists/${playlist.id}`);

      setSelected({
        id: data.playlist.id,
        name: data.playlist.playlist_name,
      });

      setSongs(data.songs ?? []);
      setMessage("");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Gagal memuat lagu playlist.",
      );
    }
  }

  async function loadAvailableSongs() {
    setChoosingSongs(true);
    setMessage("Memuat daftar lagu...");

    try {
      const data = await request<Song[] | { songs: Song[] }>("/songs");

      const items = Array.isArray(data) ? data : data.songs;

      setSongs(Array.isArray(items) ? items : []);
      setMessage("Pilih lagu yang ingin ditambahkan.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal memuat daftar lagu.",
      );
    }
  }

  async function addSong(songId: number) {
    if (!selected) return;

    setBusy(true);

    try {
      await request(`/playlists/${selected.id}/songs`, {
        method: "POST",
        body: JSON.stringify({ song_id: songId }),
      });

      setMessage("Lagu berhasil ditambahkan!");
      await openPlaylist(selected);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal menambahkan lagu.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeSong(songId: number) {
    if (!selected) return;

    setBusy(true);

    try {
      await request(`/playlists/${selected.id}/songs/${songId}`, {
        method: "DELETE",
      });

      setSongs((previous) => previous.filter((song) => song.id !== songId));
      setMessage("Lagu berhasil dihapus dari playlist.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal menghapus lagu.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function deletePlaylist(id: number) {
    if (!window.confirm("Yakin ingin menghapus playlist?")) return;

    setBusy(true);

    try {
      await request(`/playlists/${id}`, { method: "DELETE" });

      setPlaylists((previous) =>
        previous.filter((playlist) => playlist.id !== id),
      );

      if (selected?.id === id) {
        setSelected(null);
        setSongs([]);
      }

      setMessage("Playlist berhasil dihapus.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal menghapus playlist.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#101014] p-6 text-white md:p-10">
      <h1 className="mb-2 text-3xl font-bold">My Playlist</h1>
      <p className="mb-8 text-gray-400">
        Kumpulkan lagu favoritmu dalam satu tempat.
      </p>

      <form onSubmit={createPlaylist} className="mb-6 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama playlist..."
          className="min-w-0 flex-1 rounded-lg bg-[#1b1b22] px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-purple-600 px-5 py-3 font-semibold disabled:opacity-50"
        >
          Buat
        </button>
      </form>

      {message && (
        <p className="mb-5 break-words text-sm text-purple-300">{message}</p>
      )}

      {loading && <p>Memuat playlist...</p>}

      {!loading && playlists.length === 0 && (
        <p className="text-gray-400">Belum ada playlist.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="rounded-xl bg-[#1b1b22] p-5">
            <Music className="mb-3 text-purple-400" size={28} />

            <h2 className="mb-4 font-semibold">
              {playlist.name || playlist.title || "Playlist"}
            </h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void openPlaylist(playlist)}
                className="flex-1 rounded-lg bg-purple-600 px-3 py-2"
              >
                Buka
              </button>

              <button
                type="button"
                onClick={() => void deletePlaylist(playlist.id)}
                disabled={busy}
                className="rounded-lg bg-red-500/10 p-2 text-red-400 disabled:opacity-50"
                aria-label="Hapus playlist"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <section className="mt-10 rounded-xl bg-[#1b1b22] p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">
              {selected.name || selected.title || "Playlist"}
            </h2>

            <button
              type="button"
              onClick={() => void loadAvailableSongs()}
              className="rounded-lg border border-purple-500 px-4 py-2"
            >
              Pilih Lagu
            </button>
          </div>

          {songs.length === 0 && (
            <p className="mb-4 text-gray-400">
              {choosingSongs
                ? "Belum ada lagu yang tersedia."
                : "Playlist ini belum memiliki lagu."}
            </p>
          )}

          {songs.map((song) => (
            <div
              key={song.id}
              className="mb-4 rounded-lg border border-white/10 p-4"
            >
              <p className="mb-1 font-medium">{song.title}</p>
              {song.artist && (
                <p className="mb-3 text-sm text-gray-400">{song.artist}</p>
              )}

              {!choosingSongs && (
                <AudioPlayer url={song.audio_url} title={song.title} />
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {choosingSongs ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void addSong(song.id)}
                    className="rounded-lg bg-purple-600 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    + Tambah
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeSong(song.id)}
                    className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 disabled:opacity-50"
                  >
                    Hapus dari Playlist
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
