"use client";

import AudioPlayer from "@/app/components/AudioPlayer";

export default function AlbumsPage() {
  return (
    <main className="min-h-screen bg-[#101014] p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold">Album Musik</h1>

        <p className="mb-8 text-gray-400">
          Dengarkan musik langsung di TuneBox.
        </p>

        <AudioPlayer
          title="Tes Lagu TuneBox"
          artist="SoundHelix"
          url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        />
      </div>
    </main>
  );
}
