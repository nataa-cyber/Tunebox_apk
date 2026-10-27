"use client";

import Sidebar from "./components/Sidebar";
import { useEffect, useState } from "react";

type Song = {
  id: number;
  title: string;
  artist: string;
  cover_url?: string;
  audio_url?: string;
};

const API_URL = "https://tunebox-apk-p2st.vercel.app";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    async function getSongs() {
      try {
        const response = await fetch(`${API_URL}/songs`);
        const result = await response.json();

        if (response.ok) {
          setSongs(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Gagal mengambil lagu:", error);
      } finally {
        setLoading(false);
      }
    }

    getSongs();
  }, []);

  const filteredSongs = songs.filter((song) =>
    `${song.title} ${song.artist}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-black text-white md:p-2">
      <div className="flex min-h-screen gap-2 pb-24">
        <Sidebar />

        {/* MAIN CONTENT */}
        <section className="min-w-0 flex-1 overflow-hidden rounded-lg bg-zinc-900">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-zinc-900/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex gap-2">
              <button
                onClick={() => window.history.back()}
                className="hidden h-8 w-8 rounded-full bg-black text-xl md:block"
                aria-label="Kembali"
              >
                ‹
              </button>
              <button
                onClick={() => window.history.forward()}
                className="hidden h-8 w-8 rounded-full bg-black text-xl md:block"
                aria-label="Maju"
              >
                ›
              </button>
            </div>

            <a
              href="/login"
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black hover:scale-105"
            >
              Login
            </a>
          </header>

          <div className="px-4 pb-10 md:px-8">
            {/* GREETING */}
            <section className="mb-8 mt-3">
              <p className="text-sm text-zinc-400">WELCOME TO TUNEBOX</p>
              <h2 className="mt-2 text-3xl font-black md:text-5xl">
                Musik buat <span className="text-green-500">hari ini.</span>
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                Temukan lagu favoritmu dan nikmati setiap momennya.
              </p>
            </section>

            {/* QUICK CARDS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "All Songs",
                  icon: "♫",
                  color: "from-green-700 to-green-950",
                },
                {
                  title: "Discover Music",
                  icon: "✦",
                  color: "from-purple-800 to-purple-950",
                },
                {
                  title: "Your Favorites",
                  icon: "♥",
                  color: "from-pink-800 to-red-950",
                },
              ].map((item) => (
                <a
                  href="#songs"
                  key={item.title}
                  className={`flex items-center gap-4 overflow-hidden rounded-md bg-gradient-to-r ${item.color} transition hover:brightness-125`}
                >
                  <span className="p-4 text-3xl">{item.icon}</span>
                  <span className="font-bold">{item.title}</span>
                </a>
              ))}
            </div>

            {/* SONG LIST */}
            <section id="songs" className="mt-10">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Popular Songs</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Musik yang tersedia di TuneBox
                  </p>
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari lagu atau artis..."
                  className="w-full rounded-full border border-zinc-700 bg-black px-4 py-2 text-sm outline-none focus:border-green-500 sm:w-64"
                />
              </div>

              {loading ? (
                <p className="py-10 text-center text-zinc-400">
                  Memuat lagu...
                </p>
              ) : filteredSongs.length === 0 ? (
                <div className="rounded-lg bg-zinc-800/60 p-8 text-center">
                  <p className="text-lg font-bold">
                    {search ? "Lagu tidak ditemukan" : "Belum ada lagu"}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {search
                      ? "Coba kata kunci lain."
                      : "Pastikan backend aktif dan data lagu sudah tersedia di database."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {filteredSongs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => setCurrentSong(song)}
                      className="group min-w-0 rounded-lg bg-zinc-800/50 p-3 text-left transition hover:bg-zinc-800"
                    >
                      <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-zinc-700 shadow-lg">
                        {song.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={song.cover_url}
                            alt={`Cover ${song.title}`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-5xl text-green-500">
                            ♫
                          </div>
                        )}

                        <span className="absolute bottom-2 right-2 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-green-500 text-xl text-black opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100">
                          ▶
                        </span>
                      </div>

                      <h3 className="truncate font-bold">{song.title}</h3>
                      <p className="mt-1 truncate text-sm text-zinc-400">
                        {song.artist}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* FOOTER */}
            <footer className="mt-16 border-t border-zinc-700 py-6 text-sm text-zinc-500">
              © 2026 TuneBox. All music, all moments.
            </footer>
          </div>
        </section>
      </div>

      {/* MINI PLAYER */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-800 bg-black px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-800 text-xl">
              {currentSong?.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentSong.cover_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                "♫"
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {currentSong?.title ?? "Pilih lagu untuk mulai"}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {currentSong?.artist ?? "TuneBox"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                if (currentSong?.audio_url) {
                  const audio = document.getElementById(
                    "tunebox-audio",
                  ) as HTMLAudioElement | null;
                  if (audio) {
                    if (audio.paused) {
                      void audio.play();
                    } else {
                      audio.pause();
                    }
                  }
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black hover:scale-105"
              aria-label="Putar atau jeda lagu"
            >
              ▶
            </button>
            <p className="text-xs text-zinc-500">Now Playing</p>
          </div>

          <div className="hidden w-1/4 text-right text-xs text-zinc-500 sm:block">
            TuneBox Player
          </div>
        </div>

        {currentSong?.audio_url && (
          <audio
            id="tunebox-audio"
            key={currentSong.id}
            src={currentSong.audio_url}
            controls
            autoPlay
            className="mt-2 h-8 w-full"
          />
        )}
      </div>

      {/* MOBILE NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-zinc-800 bg-zinc-950 py-2 md:hidden">
        <a
          href="#"
          className="flex flex-col items-center text-xs text-green-500"
        >
          <span className="text-xl">⌂</span>Home
        </a>
        <a
          href="#songs"
          className="flex flex-col items-center text-xs text-zinc-400"
        >
          <span className="text-xl">⌕</span>Search
        </a>
        <a
          href="#library"
          className="flex flex-col items-center text-xs text-zinc-400"
        >
          <span className="text-xl">▤</span>Library
        </a>
      </nav>
    </main>
  );
}
