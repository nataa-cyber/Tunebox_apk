
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Music2,
  Disc3,
  Users,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Upload,
  FileAudio,
} from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

type Song = {
  id: number;
  title: string;
  artist: string;
  album_id?: number | null;
  audio_url?: string;
  cover_url?: string;
};

type Album = {
  id: number;
  album_name: string;
  artist: string;
  cover_url?: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

const emptySong = {
  title: "",
  artist: "",
  album_id: "",
  audio_url: "",
  cover_url: "",
};

const emptyAlbum = {
  album_name: "",
  artist: "",
  cover_url: "",
};

export default function AdminPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [tab, setTab] = useState<"songs" | "albums" | "users">("songs");
  const [songForm, setSongForm] = useState(emptySong);
  const [albumForm, setAlbumForm] = useState(emptyAlbum);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [editSongId, setEditSongId] = useState<number | null>(null);
  const [editAlbumId, setEditAlbumId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const request = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const jwt = token();

      if (!jwt) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${jwt}`,
          ...(options.body instanceof FormData
            ? {}
            : options.body
              ? { "Content-Type": "application/json" }
              : {}),
          ...options.headers,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || `Request gagal (${response.status})`,
        );
      }

      return result;
    },
    [],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [songResult, albumResult, userResult] = await Promise.all([
        request("/songs"),
        request("/albums"),
        request("/users"),
      ]);

      setSongs(Array.isArray(songResult.data) ? songResult.data : []);
      setAlbums(Array.isArray(albumResult.data) ? albumResult.data : []);
      setUsers(Array.isArray(userResult.data) ? userResult.data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data.",
      );
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }

    loadData();
  }, [loadData]);

  // Upload MP3 dari laptop ke Cloudinary.
  async function uploadAudio(file: File): Promise<string> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error(
        "Konfigurasi Cloudinary belum diisi di file .env.local.",
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "tunebox/songs");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.secure_url) {
      throw new Error(
        result.error?.message || "Upload MP3 gagal. Periksa konfigurasi Cloudinary.",
      );
    }

    return result.secure_url as string;
  }

  async function saveSong(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      let audioUrl = songForm.audio_url;

      if (audioFile) {
        if (!audioFile.name.toLowerCase().endsWith(".mp3")) {
          throw new Error("Pilih file berformat MP3.");
        }

        if (audioFile.size > 20 * 1024 * 1024) {
          throw new Error("Ukuran MP3 maksimal 20 MB.");
        }

        setMessage("Sedang mengupload MP3...");
        audioUrl = await uploadAudio(audioFile);
      }

      if (!audioUrl) {
        throw new Error("Pilih file MP3 terlebih dahulu.");
      }

      const body = {
        title: songForm.title.trim(),
        artist: songForm.artist.trim(),
        album_id: songForm.album_id
          ? Number(songForm.album_id)
          : null,
        audio_url: audioUrl,
        cover_url: songForm.cover_url.trim(),
      };

      await request(editSongId ? `/songs/${editSongId}` : "/songs", {
        method: editSongId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      setSongForm(emptySong);
      setAudioFile(null);
      setEditSongId(null);
      setMessage("Lagu berhasil disimpan!");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan lagu.",
      );
      setMessage("");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSong(id: number) {
    if (!window.confirm("Yakin ingin menghapus lagu ini?")) return;

    setError("");
    setMessage("");

    try {
      await request(`/songs/${id}`, { method: "DELETE" });
      setMessage("Lagu berhasil dihapus.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghapus lagu.",
      );
    }
  }

  async function saveAlbum(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await request(editAlbumId ? `/albums/${editAlbumId}` : "/albums", {
        method: editAlbumId ? "PUT" : "POST",
        body: JSON.stringify({
          album_name: albumForm.album_name.trim(),
          artist: albumForm.artist.trim(),
          cover_url: albumForm.cover_url.trim(),
        }),
      });

      setAlbumForm(emptyAlbum);
      setEditAlbumId(null);
      setMessage("Album berhasil disimpan.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan album.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAlbum(id: number) {
    if (!window.confirm("Yakin ingin menghapus album ini?")) return;

    setError("");
    setMessage("");

    try {
      await request(`/albums/${id}`, { method: "DELETE" });
      setMessage("Album berhasil dihapus.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghapus album.",
      );
    }
  }

  function editSong(song: Song) {
    setSongForm({
      title: song.title || "",
      artist: song.artist || "",
      album_id: song.album_id ? String(song.album_id) : "",
      audio_url: song.audio_url || "",
      cover_url: song.cover_url || "",
    });

    setAudioFile(null);
    setEditSongId(song.id);
    setTab("songs");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editAlbum(album: Album) {
    setAlbumForm({
      album_name: album.album_name || "",
      artist: album.artist || "",
      cover_url: album.cover_url || "",
    });

    setEditAlbumId(album.id);
    setTab("albums");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelSongEdit() {
    setEditSongId(null);
    setSongForm(emptySong);
    setAudioFile(null);
  }

  return (
    <main className="min-h-screen bg-[#101010] p-5 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} /> Kembali ke Home
        </Link>

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-violet-900/80 to-[#191919] p-7 md:p-10">
          <div>
            <div className="flex items-center gap-2 text-[#c5f467]">
              <ShieldCheck size={22} /> ADMIN PANEL
            </div>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-zinc-400">
              Kelola musik, album, dan pengguna TuneBox.
            </p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 hover:bg-white/20"
          >
            <RefreshCw size={18} /> Refresh Data
          </button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Lagu", value: songs.length, icon: Music2 },
            { label: "Total Album", value: albums.length, icon: Disc3 },
            { label: "Total User", value: users.length, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-[#191919] p-5"
            >
              <Icon className="mb-4 text-violet-400" size={24} />
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-1 text-3xl font-black">{value}</p>
            </div>
          ))}
        </div>

        {error && (
          <p className="mb-5 rounded-xl bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-5 rounded-xl bg-green-500/10 p-4 text-green-300">
            {message}
          </p>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: "songs", label: "Kelola Lagu", icon: Music2 },
            { id: "albums", label: "Kelola Album", icon: Disc3 },
            { id: "users", label: "Daftar User", icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 font-semibold ${
                tab === id
                  ? "bg-violet-600 text-white"
                  : "bg-[#222] text-zinc-400 hover:text-white"
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-10 text-center text-zinc-400">
            Memuat data dari backend...
          </p>
        ) : (
          <>
            {tab === "songs" && (
              <section className="space-y-5">
                <form
                  onSubmit={saveSong}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-[#191919] p-6 md:grid-cols-2"
                >
                  <h2 className="text-xl font-bold md:col-span-2">
                    {editSongId ? "Edit Lagu" : "Tambah Lagu Baru"}
                  </h2>

                  <input
                    required
                    placeholder="Judul lagu"
                    value={songForm.title}
                    onChange={(e) =>
                      setSongForm({ ...songForm, title: e.target.value })
                    }
                    className="rounded-xl border border-white/10 bg-[#101010] p-3 outline-none focus:border-violet-500"
                  />

                  <input
                    required
                    placeholder="Nama artis"
                    value={songForm.artist}
                    onChange={(e) =>
                      setSongForm({ ...songForm, artist: e.target.value })
                    }
                    className="rounded-xl border border-white/10 bg-[#101010] p-3 outline-none focus:border-violet-500"
                  />

                  <select
                    value={songForm.album_id}
                    onChange={(e) =>
                      setSongForm({ ...songForm, album_id: e.target.value })
                    }
                    className="rounded-xl border border-white/10 bg-[#101010] p-3 outline-none"
                  >
                    <option value="">Tanpa album</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.album_name}
                      </option>
                    ))}
                  </select>

                  <div className="rounded-xl border border-white/10 bg-[#101010] p-3 md:col-span-1">
                    <label className="mb-3 flex items-center gap-2 font-semibold">
                      <FileAudio size={19} className="text-violet-400" />
                      File MP3
                    </label>

                    <input
                      type="file"
                      accept=".mp3,audio/mpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setAudioFile(file);
                        setError("");
                      }}
                      className="w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-2 file:text-white"
                    />

                    <p className="mt-2 text-xs text-zinc-500">
                      Format MP3, maksimal 20 MB.
                    </p>

                    {audioFile && (
                      <p className="mt-2 break-all text-sm text-[#c5f467]">
                        Dipilih: {audioFile.name}
                      </p>
                    )}

                    {!audioFile && editSongId && songForm.audio_url && (
                      <p className="mt-2 text-xs text-zinc-400">
                        Audio lama tetap digunakan jika tidak memilih file baru.
                      </p>
                    )}
                  </div>

                  <input
                    placeholder="URL cover lagu (opsional)"
                    value={songForm.cover_url}
                    onChange={(e) =>
                      setSongForm({ ...songForm, cover_url: e.target.value })
                    }
                    className="rounded-xl border border-white/10 bg-[#101010] p-3 outline-none focus:border-violet-500 md:col-span-2"
                  />

                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-[#c5f467] px-5 py-3 font-bold text-black disabled:opacity-50"
                    >
                      {saving ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <Upload size={18} />
                      )}
                      {saving
                        ? "Mengupload & menyimpan..."
                        : editSongId
                          ? "Simpan Perubahan"
                          : "Upload & Tambah Lagu"}
                    </button>

                    {editSongId && (
                      <button
                        type="button"
                        onClick={cancelSongEdit}
                        className="rounded-xl bg-white/10 px-5 py-3"
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>
                </form>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#191919]">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-white/5 text-zinc-400">
                      <tr>
                        <th className="p-4">Judul</th>
                        <th className="p-4">Artis</th>
                        <th className="p-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {songs.map((song) => (
                        <tr key={song.id} className="border-t border-white/10">
                          <td className="p-4 font-semibold">{song.title}</td>
                          <td className="p-4 text-zinc-400">{song.artist}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                aria-label="Edit lagu"
                                onClick={() => editSong(song)}
                                className="rounded-lg bg-violet-500/15 p-2 text-violet-300"
                              >
                                <Pencil size={17} />
                              </button>
                              <button
                                aria-label="Hapus lagu"
                                onClick={() => deleteSong(song.id)}
                                className="rounded-lg bg-red-500/15 p-2 text-red-300"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {songs.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-zinc-500">
                            Belum ada lagu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === "albums" && (
              <section className="space-y-5">
                <form
                  onSubmit={saveAlbum}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-[#191919] p-6 md:grid-cols-2"
                >
                  <h2 className="text-xl font-bold md:col-span-2">
                    {editAlbumId ? "Edit Album" : "Tambah Album Baru"}
                  </h2>

                  <input
                    required
                    placeholder="Nama album"
                    value={albumForm.album_name}
                    onChange={(e) =>
                      setAlbumForm({ ...albumForm, album_name: e.target.value })
                    }
                    className="rounded-xl border border-white/10 bg-[#101010] p-3 outline-none focus:border-violet-500"
                  />

                  <input
                    required
                    placeholder="Nama artis"
                    value={albumForm.artist}
                    onChange={(e) =>
                      setAlbumForm({ ...albumForm, artist: e.target.value })
                    }
                    className="rounded-xl border border-white/10 bg-[#101010] p-3 outline-none focus:border-violet-500"
                  />

                  <input
                    placeholder="URL cover album"
                    value={albumForm.cover_url}
                    onChange={(e) =>
                      setAlbumForm({ ...albumForm, cover_url: e.target.value })
                    }
                    className="rounded-xl border border-white/10 bg-[#101010] p-3 outline-none focus:border-violet-500 md:col-span-2"
                  />

                  <div className="flex gap-2 md:col-span-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-[#c5f467] px-5 py-3 font-bold text-black disabled:opacity-50"
                    >
                      <Plus size={18} />
                      {saving
                        ? "Menyimpan..."
                        : editAlbumId
                          ? "Simpan Perubahan"
                          : "Tambah Album"}
                    </button>

                    {editAlbumId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditAlbumId(null);
                          setAlbumForm(emptyAlbum);
                        }}
                        className="rounded-xl bg-white/10 px-5 py-3"
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {albums.map((album) => (
                    <article
                      key={album.id}
                      className="rounded-2xl border border-white/10 bg-[#191919] p-5"
                    >
                      <div className="mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-violet-950">
                        {album.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={album.cover_url}
                            alt={album.album_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Disc3 size={42} className="text-violet-300" />
                        )}
                      </div>

                      <h3 className="font-bold">{album.album_name}</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {album.artist}
                      </p>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => editAlbum(album)}
                          className="flex items-center gap-2 rounded-lg bg-violet-500/15 px-3 py-2 text-violet-300"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                        <button
                          onClick={() => deleteAlbum(album.id)}
                          className="flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-red-300"
                        >
                          <Trash2 size={16} /> Hapus
                        </button>
                      </div>
                    </article>
                  ))}

                  {albums.length === 0 && (
                    <p className="text-zinc-500">Belum ada album.</p>
                  )}
                </div>
              </section>
            )}

            {tab === "users" && (
              <section className="overflow-x-auto rounded-2xl border border-white/10 bg-[#191919]">
                <table className="w-full min-w-[550px] text-left text-sm">
                  <thead className="bg-white/5 text-zinc-400">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Username</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-white/10">
                        <td className="p-4">{user.id}</td>
                        <td className="p-4 font-semibold">{user.username}</td>
                        <td className="p-4 text-zinc-400">{user.email}</td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              user.role === "admin"
                                ? "bg-[#c5f467]/10 text-[#c5f467]"
                                : "bg-white/10 text-zinc-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-zinc-500">
                          Belum ada user atau akses ditolak.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
