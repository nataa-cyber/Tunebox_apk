"use client";

import { useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music2,
  Volume2,
} from "lucide-react";

type AudioPlayerProps = {
  url?: string | null;
  title?: string;
  artist?: string;
};

export default function AudioPlayer({
  url,
  title = "Judul lagu",
  artist = "Unknown Artist",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return "0:00";

    return `${Math.floor(seconds / 60)}:${String(
      Math.floor(seconds % 60),
    ).padStart(2, "0")}`;
  }

  async function togglePlay() {
    const audio = audioRef.current;

    if (!audio || !url) {
      setError("URL file audio belum tersedia.");
      return;
    }

    if (audio.paused) {
      try {
        setError("");
        await audio.play();
      } catch {
        setError("Lagu gagal diputar. Periksa URL file audio.");
      }
    } else {
      audio.pause();
    }
  }

  function seek(value: number) {
    if (!audioRef.current) return;

    audioRef.current.currentTime = value;
    setCurrentTime(value);
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Math.max(
      0,
      Math.min(audio.currentTime + seconds, duration || 0),
    );

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#181820] p-4 text-white shadow-lg">
      <audio
        ref={audioRef}
        src={url || undefined}
        preload="metadata"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          setError("");
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setError("File audio gagal dimuat. Periksa URL audio.");
        }}
      />

      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-purple-600/20">
          <Music2 size={28} className="text-purple-400" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{title}</p>
          <p className="truncate text-sm text-gray-400">{artist}</p>
        </div>

        <Volume2 size={20} className="text-purple-400" />
      </div>

      <div className="mt-5">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full cursor-pointer accent-purple-500"
          aria-label="Progress lagu"
        />

        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-7">
        <button
          type="button"
          onClick={() => skip(-10)}
          aria-label="Mundur 10 detik"
          className="text-gray-300 hover:text-white"
        >
          <SkipBack size={22} />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          type="button"
          onClick={() => skip(10)}
          aria-label="Maju 10 detik"
          className="text-gray-300 hover:text-white"
        >
          <SkipForward size={22} />
        </button>
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
